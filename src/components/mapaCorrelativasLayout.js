import { checkCursadaRequirements, esElectiva } from '../lib/businessLogic'

export const CARD_W = 252
export const CARD_H = 128
export const COL_GAP = 84
export const ROW_GAP = 22
export const PAD_X = 28
export const PAD_TOP = 64
export const PAD_BOTTOM = 28

function matchFiltroMateria(info, filtroActivo) {
  switch (filtroActivo) {
    case 'LISTAS':
      return info.isCursable
    case 'CURSANDO':
      return info.isCursando
    case 'FINALES':
      return info.isRegular
    case 'APROBADAS':
      return info.isAprobada
    case 'BLOQUEADAS':
      return info.isBloqueada
    case 'TODAS':
    default:
      return true
  }
}

export function buildMapaData(ctx, { incluirElectivas = false, filtroActivo = 'TODAS', query = '' } = {}) {
  const materias = ctx?.materias || []
  const estadosMap = ctx?.estadosMap || {}
  const q = query.toLowerCase().trim()

  const obligatorias = []
  const electivas = []
  for (const m of materias) {
    if (esElectiva(m)) electivas.push(m)
    else obligatorias.push(m)
  }

  const seleccionadas = incluirElectivas ? [...obligatorias, ...electivas] : obligatorias
  const colMap = new Map()
  const sinAnio = []
  const electivasCol = []

  const nodesMetaById = new Map()
  const visibleIdSet = new Set()

  let visibles = 0
  let aprobadas = 0
  let regulares = 0
  let cursando = 0
  let cursables = 0
  let bloqueadas = 0

  for (const m of seleccionadas) {
    const estado = estadosMap[m.id] || 'NO_CURSADA'
    const reqCheck = checkCursadaRequirements(m.id, ctx)
    const isAprobada = estado === 'PROMOCIONADA'
    const isRegular = estado === 'REGULAR'
    const isCursando = estado === 'CURSANDO'
    const isCursable = estado === 'NO_CURSADA' && reqCheck.puede
    const isBloqueada = estado === 'NO_CURSADA' && !reqCheck.puede

    const infoBase = {
      ...m,
      estado,
      reqCheck,
      isElectiva: esElectiva(m),
      isAprobada,
      isRegular,
      isCursando,
      isCursable,
      isBloqueada,
    }

    const matchFilter = matchFiltroMateria(infoBase, filtroActivo)
    const matchQuery = !q ||
      m.nombre.toLowerCase().includes(q) ||
      m.codigo.toLowerCase().includes(q)
    const matchesView = matchFilter && matchQuery

    const item = {
      ...infoBase,
      matchFilter,
      matchQuery,
      matchesView,
    }

    nodesMetaById.set(m.id, item)
    visibleIdSet.add(m.id)

    if (matchesView) visibles += 1
    if (isAprobada) aprobadas += 1
    else if (isRegular) regulares += 1
    else if (isCursando) cursando += 1
    else if (isCursable) cursables += 1
    else bloqueadas += 1

    if (item.isElectiva) {
      electivasCol.push(item)
    } else if (m.anio != null) {
      if (!colMap.has(m.anio)) colMap.set(m.anio, [])
      colMap.get(m.anio).push(item)
    } else {
      sinAnio.push(item)
    }
  }

  const aniosOrdenados = [...colMap.keys()].sort((a, b) => a - b)
  const columns = aniosOrdenados.map(anio => ({
    key: String(anio),
    label: `${anio}º Año`,
    items: colMap.get(anio),
  }))

  if (sinAnio.length > 0) {
    columns.push({ key: 'SIN_ANIO', label: 'Sin año', items: sinAnio })
  }
  if (incluirElectivas && electivasCol.length > 0) {
    columns.push({ key: 'ELECTIVAS', label: 'Electivas', items: electivasCol })
  }

  return {
    columns,
    nodesMetaById,
    visibleIdSet,
    stats: {
      total: seleccionadas.length,
      visibles,
      aprobadas,
      regulares,
      cursando,
      cursables,
      bloqueadas,
      totalElectivas: electivas.length,
    },
  }
}

export function computeRelacionesFoco(materiaId, ctx, visibleIdSet) {
  if (!materiaId || !visibleIdSet || !visibleIdSet.has(materiaId)) return null

  const estadosMap = ctx?.estadosMap || {}
  const reqs = ctx?.prereqsByMateria?.[materiaId] || []
  const deps = ctx?.dependientesByMateria
    ? (ctx.dependientesByMateria[materiaId] || [])
    : (ctx?.prerequisitos || []).filter(p => p.materia_requerida_id === materiaId)

  const previasMap = new Map()
  for (const r of reqs) {
    const reqId = r.materia_requerida_id
    if (!visibleIdSet.has(reqId)) continue
    const reqEstado = estadosMap[reqId] || 'NO_CURSADA'
    const cumplida = r.tipo === 'APROBADA'
      ? reqEstado === 'PROMOCIONADA'
      : (reqEstado === 'REGULAR' || reqEstado === 'PROMOCIONADA')

    const prev = previasMap.get(reqId)
    if (!prev || (prev.tipo !== 'APROBADA' && r.tipo === 'APROBADA')) {
      previasMap.set(reqId, { tipo: r.tipo, cumplida, req: r })
    }
  }

  const habilitaMap = new Map()
  for (const d of deps) {
    const depId = d.materia_id
    if (!visibleIdSet.has(depId)) continue
    const prev = habilitaMap.get(depId)
    if (!prev || (prev.tipo !== 'APROBADA' && d.tipo === 'APROBADA')) {
      habilitaMap.set(depId, { tipo: d.tipo, req: d })
    }
  }

  let conAprobadaCount = 0
  let conRegularCount = 0
  for (const info of habilitaMap.values()) {
    if (info.tipo === 'APROBADA') conAprobadaCount += 1
    else if (info.tipo === 'REGULARIZADA') conRegularCount += 1
  }

  const edges = []
  for (const [reqId, info] of previasMap.entries()) {
    edges.push({
      id: `pre-${reqId}-${materiaId}`,
      from: reqId,
      to: materiaId,
      tipo: info.tipo,
      direccion: 'previa',
    })
  }
  for (const [depId, info] of habilitaMap.entries()) {
    edges.push({
      id: `dep-${materiaId}-${depId}`,
      from: materiaId,
      to: depId,
      tipo: info.tipo,
      direccion: 'habilita',
    })
  }

  return {
    materiaId,
    previasMap,
    habilitaMap,
    conAprobadaCount,
    conRegularCount,
    totalPrevias: previasMap.size,
    edges,
  }
}

export function computeLayout(columns) {
  const nodesById = new Map()
  const columnHeaders = []

  let maxRows = 0
  columns.forEach((col, colIdx) => {
    const x = PAD_X + colIdx * (CARD_W + COL_GAP)
    const items = col.items || []
    if (items.length > maxRows) maxRows = items.length

    let aprobadas = 0
    items.forEach((item, rowIdx) => {
      const y = PAD_TOP + rowIdx * (CARD_H + ROW_GAP)
      if (item.isAprobada) aprobadas += 1
      nodesById.set(item.id, {
        id: item.id,
        x,
        y,
        w: CARD_W,
        h: CARD_H,
        col: colIdx,
        row: rowIdx,
        cx: x + CARD_W / 2,
        cy: y + CARD_H / 2,
      })
    })

    columnHeaders.push({
      key: col.key,
      label: col.label,
      x,
      w: CARD_W,
      count: items.length,
      aprobadas,
    })
  })

  const effectiveCols = Math.max(1, columns.length)
  const effectiveRows = Math.max(1, maxRows)
  const width = PAD_X * 2 + effectiveCols * CARD_W + (effectiveCols - 1) * COL_GAP
  const height = PAD_TOP + effectiveRows * CARD_H + (effectiveRows - 1) * ROW_GAP + PAD_BOTTOM

  return {
    nodesById,
    columnHeaders,
    width,
    height,
    maxRows: effectiveRows,
  }
}

function getFanOffset(index, total) {
  if (total <= 1) return 0
  const maxSpan = 48 // [-24, +24] alrededor de cy
  const step = Math.min(12, maxSpan / (total - 1))
  return (index - (total - 1) / 2) * step
}

function getGapLaneX(gapColIndex, laneIndex, laneTotal) {
  const gapStart = PAD_X + gapColIndex * (CARD_W + COL_GAP) + CARD_W
  const center = gapStart + COL_GAP / 2
  if (laneTotal <= 1) return center
  const usableSpan = COL_GAP - 32 // 16px margen mínimo respecto a tarjetas
  const step = Math.min(10, usableSpan / (laneTotal - 1))
  return center + (laneIndex - (laneTotal - 1) / 2) * step
}

function corridorCenterY(corridorIdx) {
  if (corridorIdx < 0) return PAD_TOP - 14
  return PAD_TOP + corridorIdx * (CARD_H + ROW_GAP) + CARD_H + ROW_GAP / 2
}

export function routeOrthogonalEdges(edges, nodesById) {
  const valid = []
  let maxRow = 0
  for (const node of nodesById.values()) {
    if (node.row > maxRow) maxRow = node.row
  }

  for (const e of edges || []) {
    const src = nodesById.get(e.from)
    const dst = nodesById.get(e.to)
    if (!src || !dst) continue

    let exitSide = 'right'
    let enterSide = 'left'
    if (dst.col === src.col) {
      exitSide = 'right'
      enterSide = 'right'
    } else if (dst.col < src.col) {
      exitSide = 'left'
      enterSide = 'right'
    }

    valid.push({ edge: e, src, dst, exitSide, enterSide })
  }

  // Agrupar anclas por (nodeId, side) ordenadas por la coordenada Y del extremo opuesto
  const sideBuckets = new Map()
  function addSideAnchor(nodeId, side, item, otherNode) {
    const k = `${String(nodeId)}:${side}`
    if (!sideBuckets.has(k)) {
      sideBuckets.set(k, { nodeId, side, entries: [] })
    }
    sideBuckets.get(k).entries.push({ item, otherY: otherNode.cy, otherCol: otherNode.col })
  }

  for (const item of valid) {
    addSideAnchor(item.src.id, item.exitSide, item, item.dst)
    addSideAnchor(item.dst.id, item.enterSide, item, item.src)
  }

  for (const { nodeId, side, entries } of sideBuckets.values()) {
    entries.sort((a, b) => (a.otherY - b.otherY) || (a.otherCol - b.otherCol))
    entries.forEach((entry, idx) => {
      const offset = getFanOffset(idx, entries.length)
      if (entry.item.src.id === nodeId && entry.item.exitSide === side) {
        entry.item.startOffset = offset
      }
      if (entry.item.dst.id === nodeId && entry.item.enterSide === side) {
        entry.item.endOffset = offset
      }
    })
  }

  // Contar carriles verticales necesarios en cada gap
  const gapBuckets = new Map()
  function registerGap(gapCol, item, role) {
    if (!gapBuckets.has(gapCol)) gapBuckets.set(gapCol, [])
    gapBuckets.get(gapCol).push({ item, role })
  }

  for (const item of valid) {
    const { src, dst } = item
    if (dst.col === src.col + 1) {
      registerGap(src.col, item, 'mid')
    } else if (dst.col > src.col + 1) {
      registerGap(src.col, item, 'lane1')
      registerGap(dst.col - 1, item, 'lane2')
    } else if (dst.col === src.col) {
      registerGap(src.col, item, 'loop')
    } else if (dst.col < src.col) {
      registerGap(src.col - 1, item, 'back1')
      if (src.col - dst.col > 1) registerGap(dst.col, item, 'back2')
    }
  }

  for (const [gapCol, entries] of gapBuckets.entries()) {
    entries.sort((a, b) => (a.item.src.cy - b.item.src.cy) || (a.item.dst.cy - b.item.dst.cy))
    entries.forEach((entry, idx) => {
      const x = getGapLaneX(gapCol, idx, entries.length)
      if (entry.role === 'mid') entry.item.midX = x
      else if (entry.role === 'lane1') entry.item.lane1X = x
      else if (entry.role === 'lane2') entry.item.lane2X = x
      else if (entry.role === 'loop') entry.item.loopX = x
      else if (entry.role === 'back1') entry.item.back1X = x
      else if (entry.role === 'back2') entry.item.back2X = x
    })
  }

  // Elegir pasillos horizontales (ROW_GAP) para aristas multi-columna
  const corridorCounts = new Map()

  for (const item of valid) {
    if (Math.abs(item.dst.col - item.src.col) <= 1) continue

    const targetY = item.dst.cy + (item.endOffset || 0)
    const candidateCorridors = maxRow >= 1
      ? Array.from({ length: maxRow }, (_, i) => i) // corredores entre filas 0..maxRow-1 y debajo de maxRow
      : [-1, 0]

    let bestCorr = candidateCorridors[0]
    let bestDist = Infinity
    for (const cIdx of candidateCorridors) {
      const cy = corridorCenterY(cIdx)
      const dist = Math.abs(cy - targetY)
      if (dist < bestDist) {
        bestDist = dist
        bestCorr = cIdx
      }
    }

    item.corridorIdx = bestCorr
    if (!corridorCounts.has(bestCorr)) corridorCounts.set(bestCorr, [])
    corridorCounts.get(bestCorr).push(item)
  }

  for (const [cIdx, itemsInCorr] of corridorCounts.entries()) {
    itemsInCorr.sort((a, b) => (a.src.cy - b.src.cy) || (a.dst.cy - b.dst.cy))
    const baseY = corridorCenterY(cIdx)
    const span = Math.min(10, Math.max(0, ROW_GAP - 10))
    const step = itemsInCorr.length > 1 ? Math.min(4, span / (itemsInCorr.length - 1)) : 0
    itemsInCorr.forEach((item, idx) => {
      const offset = itemsInCorr.length > 1 ? (idx - (itemsInCorr.length - 1) / 2) * step : 0
      item.corridorY = baseY + offset
    })
  }

  return valid.map(item => {
    const { edge, src, dst, exitSide, enterSide } = item
    const startY = src.cy + (item.startOffset || 0)
    const endY = dst.cy + (item.endOffset || 0)
    const startX = exitSide === 'right' ? src.x + src.w : src.x
    const endX = enterSide === 'left' ? dst.x - 2 : dst.x + dst.w + 2

    let points = []
    if (dst.col === src.col + 1) {
      const midX = item.midX
      points = [
        [startX, startY],
        [midX, startY],
        [midX, endY],
        [endX, endY],
      ]
    } else if (dst.col > src.col + 1) {
      const lane1X = item.lane1X
      const lane2X = item.lane2X
      const corrY = item.corridorY
      points = [
        [startX, startY],
        [lane1X, startY],
        [lane1X, corrY],
        [lane2X, corrY],
        [lane2X, endY],
        [endX, endY],
      ]
    } else if (dst.col === src.col) {
      const loopX = Math.min(item.loopX, src.x + src.w + 22)
      const safeLoopX = Math.max(loopX, src.x + src.w + 14)
      points = [
        [startX, startY],
        [safeLoopX, startY],
        [safeLoopX, endY],
        [endX, endY],
      ]
    } else if (src.col - dst.col === 1) {
      const backX = item.back1X
      points = [
        [startX, startY],
        [backX, startY],
        [backX, endY],
        [endX, endY],
      ]
    } else {
      const lane1X = item.back1X
      const lane2X = item.back2X
      const corrY = item.corridorY
      points = [
        [startX, startY],
        [lane1X, startY],
        [lane1X, corrY],
        [lane2X, corrY],
        [lane2X, endY],
        [endX, endY],
      ]
    }

    const d = points
      .map(([px, py], i) => `${i === 0 ? 'M' : 'L'} ${Math.round(px * 10) / 10} ${Math.round(py * 10) / 10}`)
      .join(' ')

    return {
      id: edge.id,
      from: edge.from,
      to: edge.to,
      tipo: edge.tipo,
      direccion: edge.direccion,
      d,
      points,
      startX,
      startY,
      endX,
      endY,
    }
  })
}
