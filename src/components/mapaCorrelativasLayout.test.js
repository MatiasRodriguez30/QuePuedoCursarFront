import { describe, it, expect } from 'vitest'
import { buildIndexes } from '../lib/businessLogic'
import {
  CARD_H,
  CARD_W,
  PAD_TOP,
  ROW_GAP,
  buildMapaData,
  computeLayout,
  computeRelacionesFoco,
  routeOrthogonalEdges,
} from './mapaCorrelativasLayout'

function makeTestCtx() {
  const materias = [
    // 1° Año
    { id: 1, codigo: '4', nombre: 'Inglés I', anio: 1, cuatrimestre: null, horas_semanales: 2 },
    { id: 2, codigo: '6', nombre: 'Algoritmo y Estructura de Datos', anio: 1, cuatrimestre: null, horas_semanales: 5 },
    { id: 3, codigo: '8', nombre: 'Sistemas y Procesos de Negocio', anio: 1, cuatrimestre: null, horas_semanales: 4 },
    // 2° Año
    { id: 4, codigo: '14', nombre: 'Paradigmas de Programación', anio: 2, cuatrimestre: null, horas_semanales: 4 },
    { id: 5, codigo: '16', nombre: 'Análisis de Sistemas de Información', anio: 2, cuatrimestre: null, horas_semanales: 6 },
    // 3° Año
    { id: 6, codigo: '23', nombre: 'Diseño de Sistemas de Información', anio: 3, cuatrimestre: null, horas_semanales: 6 },
    { id: 7, codigo: '21', nombre: 'Economía', anio: 3, cuatrimestre: 1, horas_semanales: 3 },
    // 4° Año
    { id: 8, codigo: '25', nombre: 'Ingeniería y Calidad de Software', anio: 4, cuatrimestre: 1, horas_semanales: 3 },
    { id: 9, codigo: '30', nombre: 'Administración de Sistemas de Información', anio: 4, cuatrimestre: null, horas_semanales: 6 },
    // 5° Año
    { id: 10, codigo: '33', nombre: 'Sistemas de Gestión', anio: 5, cuatrimestre: 1, horas_semanales: 4 },
    { id: 11, codigo: '36', nombre: 'Proyecto Final', anio: 5, cuatrimestre: null, horas_semanales: 6 },
    // Electiva
    { id: 12, codigo: 'E-UX', nombre: 'Diseño de Experiencia de Usuario (UX)', anio: 4, cuatrimestre: 2, horas_semanales: 6 },
  ]

  const prerequisitos = [
    // Previas de DSI (id 6): 3 APROBADA (1,2,3) + 2 REGULARIZADA (4,5)
    { id: 101, materia_id: 6, materia_requerida_id: 1, tipo: 'APROBADA' },
    { id: 102, materia_id: 6, materia_requerida_id: 2, tipo: 'APROBADA' },
    { id: 103, materia_id: 6, materia_requerida_id: 3, tipo: 'APROBADA' },
    { id: 104, materia_id: 6, materia_requerida_id: 4, tipo: 'REGULARIZADA' },
    { id: 105, materia_id: 6, materia_requerida_id: 5, tipo: 'REGULARIZADA' },
    // Dependientes obligatorias de DSI: 2 REGULARIZADA (8,9) + 2 APROBADA (10,11)
    { id: 106, materia_id: 8, materia_requerida_id: 6, tipo: 'REGULARIZADA' },
    { id: 107, materia_id: 9, materia_requerida_id: 6, tipo: 'REGULARIZADA' },
    { id: 108, materia_id: 10, materia_requerida_id: 6, tipo: 'APROBADA' },
    { id: 109, materia_id: 11, materia_requerida_id: 6, tipo: 'APROBADA' },
    // Dependiente electiva + misma columna con electiva
    { id: 110, materia_id: 12, materia_requerida_id: 6, tipo: 'REGULARIZADA' },
    { id: 111, materia_id: 12, materia_requerida_id: 8, tipo: 'REGULARIZADA' },
  ]

  const estadosMap = {
    1: 'PROMOCIONADA',
    2: 'PROMOCIONADA',
    3: 'PROMOCIONADA',
    4: 'REGULAR',
    5: 'PROMOCIONADA',
    6: 'REGULAR',
    7: 'CURSANDO',
  }

  const indexes = buildIndexes(materias, prerequisitos)
  return {
    materias,
    prerequisitos,
    estadosMap,
    ...indexes,
  }
}

describe('mapaCorrelativasLayout', () => {
  it('excluye electivas por defecto y calcula conteos reales', () => {
    const ctx = makeTestCtx()
    const sinElectivas = buildMapaData(ctx)

    expect(sinElectivas.columns.map(c => c.label)).toEqual([
      '1º Año',
      '2º Año',
      '3º Año',
      '4º Año',
      '5º Año',
    ])
    expect(sinElectivas.stats).toEqual({
      total: 11,
      visibles: 11,
      aprobadas: 4,
      regulares: 2,
      cursando: 1,
      cursables: 2, // 8 y 9 quedan cursables porque DSI está REGULAR
      bloqueadas: 2, // 10 y 11 exigen DSI APROBADA
      totalElectivas: 1,
    })

    const conElectivas = buildMapaData(ctx, { incluirElectivas: true })
    expect(conElectivas.columns.map(c => c.key)).toEqual(['1', '2', '3', '4', '5', 'ELECTIVAS'])
    expect(conElectivas.stats.total).toBe(12)
  })

  it('filtra por estado y búsqueda de texto correctamente', () => {
    const ctx = makeTestCtx()
    const soloListas = buildMapaData(ctx, { filtroActivo: 'LISTAS' })
    expect(soloListas.stats.visibles).toBe(2)

    const busqueda = buildMapaData(ctx, { query: 'proyecto' })
    expect(busqueda.stats.visibles).toBe(1)
    expect(busqueda.nodesMetaById.get(11).matchesView).toBe(true)
    expect(busqueda.nodesMetaById.get(6).matchesView).toBe(false)
  })

  it('calcula previas, habilitaciones con Regular/Aprobada y cumplimiento para la materia enfocada', () => {
    const ctx = makeTestCtx()
    const mapaSinElectivas = buildMapaData(ctx)
    const rel = computeRelacionesFoco(6, ctx, mapaSinElectivas.visibleIdSet)

    expect(rel.totalPrevias).toBe(5)
    expect(rel.conAprobadaCount).toBe(2)
    expect(rel.conRegularCount).toBe(2)
    expect(rel.edges).toHaveLength(9)
    expect(rel.previasMap.get(1)).toMatchObject({ tipo: 'APROBADA', cumplida: true })
    expect(rel.previasMap.get(4)).toMatchObject({ tipo: 'REGULARIZADA', cumplida: true })
    expect(rel.habilitaMap.get(8)).toMatchObject({ tipo: 'REGULARIZADA' })
    expect(rel.habilitaMap.get(11)).toMatchObject({ tipo: 'APROBADA' })

    const mapaConElectivas = buildMapaData(ctx, { incluirElectivas: true })
    const relElectivas = computeRelacionesFoco(6, ctx, mapaConElectivas.visibleIdSet)
    expect(relElectivas.conRegularCount).toBe(3)
    expect(relElectivas.edges).toHaveLength(10)
  })

  it('rutea aristas ortogonales sin cruzar por encima de tarjetas intermedias', () => {
    const ctx = makeTestCtx()
    const mapa = buildMapaData(ctx, { incluirElectivas: true })
    const layout = computeLayout(mapa.columns)
    const rel = computeRelacionesFoco(6, ctx, mapa.visibleIdSet)
    const routed = routeOrthogonalEdges(rel.edges, layout.nodesById)

    expect(routed).toHaveLength(rel.edges.length)
    for (const edge of routed) {
      expect(edge.d.startsWith('M ')).toBe(true)
      expect(edge.d).not.toContain('NaN')
      for (const [px, py] of edge.points) {
        expect(Number.isFinite(px)).toBe(true)
        expect(Number.isFinite(py)).toBe(true)
      }
    }

    // Arista multi-columna (Inglés I col 0 -> DSI col 2) viaja horizontalmente por un corredor ROW_GAP
    const salto1a3 = routed.find(e => e.from === 1 && e.to === 6)
    expect(salto1a3.points).toHaveLength(6)
    const corrY = salto1a3.points[2][1]
    expect(salto1a3.points[3][1]).toBe(corrY)

    // Verificar que corrY no cae dentro de la altura vertical de ninguna fila ocupada
    for (let r = 0; r < layout.maxRows; r++) {
      const cardTop = PAD_TOP + r * (CARD_H + ROW_GAP)
      const cardBottom = cardTop + CARD_H
      expect(corrY <= cardTop || corrY >= cardBottom).toBe(true)
    }

    // Arista misma columna (ej. si hay dependencia dentro de misma columna o electiva->electiva)
    const sameColEdges = routeOrthogonalEdges(
      [{ id: 'same-1-2', from: 1, to: 2, tipo: 'APROBADA', direccion: 'habilita' }],
      layout.nodesById,
    )
    expect(sameColEdges[0].points).toHaveLength(4)
    expect(sameColEdges[0].points[1][0]).toBeGreaterThan(layout.nodesById.get(1).x + CARD_W)
    expect(sameColEdges[0].points[1][0]).toBeLessThanOrEqual(layout.width)
  })
})
