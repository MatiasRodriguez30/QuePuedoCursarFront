import { useMemo, useState } from 'react'
import { KeyRound, Link2 } from 'lucide-react'

// Posición manual (columna, fila) de cada tabla conocida del esquema. Pensada
// para que las tablas relacionadas queden adyacentes y las líneas no tengan
// que cruzar por el medio de otra caja. Si en el futuro se agrega una tabla
// nueva y no está acá, igual aparece (ver `sinUbicar` más abajo), sólo que
// sin una posición prolija en la grilla.
const LAYOUT = {
  password_reset_tokens: { col: 0, row: 0 },
  sesiones: { col: 1, row: 0 },
  config_app: { col: 2, row: 0 },
  carreras: { col: 3, row: 0 },
  grupos: { col: 0, row: 1 },
  usuarios: { col: 1, row: 1 },
  estados_materia: { col: 2, row: 1 },
  materias: { col: 3, row: 1 },
  membresias: { col: 1, row: 2 },
  prerequisitos: { col: 2, row: 2 },
  eventos: { col: 0, row: 3 },
}

const COL_X = [20, 300, 580, 860]
const ROW_Y = [20, 210, 400, 590]
const BOX_W = 220
const HEADER_H = 28
const ROW_H = 16
const PAD_Y = 8

function medirCaja(tabla) {
  const claves = tabla.columnas.filter(c => c.primary_key || c.referencia)
  const otras = tabla.columnas.length - claves.length
  const h = HEADER_H + PAD_Y * 2 + claves.length * ROW_H + (otras > 0 ? ROW_H : 0)
  return { claves, otras, h }
}

function anclas(src, dst) {
  const dx = dst.cx - src.cx
  const dy = dst.cy - src.cy
  if (Math.abs(dx) >= Math.abs(dy) * 0.75) {
    return dx > 0
      ? { x1: src.x + src.w, y1: src.cy, x2: dst.x, y2: dst.cy }
      : { x1: src.x, y1: src.cy, x2: dst.x + dst.w, y2: dst.cy }
  }
  return dy > 0
    ? { x1: src.cx, y1: src.y + src.h, x2: dst.cx, y2: dst.y }
    : { x1: src.cx, y1: src.y, x2: dst.cx, y2: dst.y + dst.h }
}

export default function DiagramaRelacional({ tablas, onVerTabla }) {
  const [resaltada, setResaltada] = useState(null)

  const { cajas, aristas, sinUbicar, ancho, alto } = useMemo(() => {
    const cajas = {}
    const sinUbicar = []

    tablas.forEach(t => {
      const pos = LAYOUT[t.nombre]
      const { claves, otras, h } = medirCaja(t)
      if (!pos) { sinUbicar.push(t); return }
      const x = COL_X[pos.col]
      const y = ROW_Y[pos.row]
      cajas[t.nombre] = { tabla: t, claves, otras, x, y, w: BOX_W, h, cx: x + BOX_W / 2, cy: y + h / 2 }
    })

    const aristas = []
    tablas.forEach(t => {
      t.columnas.forEach((c, i) => {
        if (!c.referencia) return
        const src = cajas[t.nombre]
        const dst = cajas[c.referencia.tabla]
        if (!src || !dst) return
        // Si dos columnas de la misma tabla apuntan al mismo destino
        // (ej. prerequisitos.materia_id y materia_requerida_id -> materias),
        // se separan un poco para que no queden dibujadas exactamente encima.
        const gemelas = t.columnas.filter(cc => cc.referencia && cc.referencia.tabla === c.referencia.tabla)
        const offset = gemelas.length > 1 ? (gemelas.indexOf(c) - (gemelas.length - 1) / 2) * 10 : 0
        const { x1, y1, x2, y2 } = anclas(src, dst)
        aristas.push({
          key: `${t.nombre}.${c.nombre}`,
          origen: t.nombre,
          destino: c.referencia.tabla,
          etiqueta: `${t.nombre}.${c.nombre} → ${c.referencia.tabla}.${c.referencia.columna}`,
          x1: x1 + offset, y1: y1 + offset, x2: x2 + offset, y2: y2 + offset,
        })
      })
    })

    const maxCol = Math.max(...Object.values(cajas).map(c => c.x + c.w), 0)
    const maxRow = Math.max(...Object.values(cajas).map(c => c.y + c.h), 0)
    return { cajas, aristas, sinUbicar, ancho: maxCol + 20, alto: maxRow + 20 }
  }, [tablas])

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-mono text-[#52525b]">
        <KeyRound className="w-3 h-3 inline text-[#b45309] -mt-0.5" aria-hidden="true" /> clave primaria ·{' '}
        <Link2 className="w-3 h-3 inline text-[#0047ff] -mt-0.5" aria-hidden="true" /> clave foránea. Pasá el mouse
        por una tabla para resaltar sus relaciones. Tocá una tabla para ver sus filas.
      </p>

      <div className="overflow-auto border-2 border-[#111111] bg-[#f9f6ee]" style={{ maxHeight: '70vh' }}>
        <svg width={ancho} height={alto} className="block" role="img" aria-label="Diagrama de relaciones entre tablas">
          <defs>
            <marker id="flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#111111" />
            </marker>
            <marker id="flecha-activa" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#ff1464" />
            </marker>
          </defs>

          {aristas.map(a => {
            const activa = resaltada && (a.origen === resaltada || a.destino === resaltada)
            const atenuada = resaltada && !activa
            return (
              <path
                key={a.key}
                d={`M ${a.x1} ${a.y1} C ${(a.x1 + a.x2) / 2} ${a.y1}, ${(a.x1 + a.x2) / 2} ${a.y2}, ${a.x2} ${a.y2}`}
                fill="none"
                stroke={activa ? '#ff1464' : '#111111'}
                strokeWidth={activa ? 2.5 : 1.5}
                opacity={atenuada ? 0.15 : 1}
                markerEnd={`url(#${activa ? 'flecha-activa' : 'flecha'})`}
              >
                <title>{a.etiqueta}</title>
              </path>
            )
          })}

          {Object.values(cajas).map(caja => {
            const activa = resaltada === caja.tabla.nombre
            const conectada = resaltada && aristas.some(a =>
              (a.origen === resaltada && a.destino === caja.tabla.nombre) ||
              (a.destino === resaltada && a.origen === caja.tabla.nombre)
            )
            const atenuada = resaltada && !activa && !conectada
            return (
              <g
                key={caja.tabla.nombre}
                transform={`translate(${caja.x}, ${caja.y})`}
                opacity={atenuada ? 0.35 : 1}
                className="cursor-pointer"
                onMouseEnter={() => setResaltada(caja.tabla.nombre)}
                onMouseLeave={() => setResaltada(null)}
                onClick={() => onVerTabla(caja.tabla.nombre)}
              >
                <rect width={caja.w} height={caja.h} fill="#ffffff" stroke="#111111" strokeWidth={activa ? 3 : 2} />
                <rect width={caja.w} height={HEADER_H} fill="#111111" />
                <text x={8} y={HEADER_H / 2 + 4} fontFamily="monospace" fontSize="11" fontWeight="bold" fill="#ccff00">
                  {caja.tabla.nombre}
                </text>
                <text x={caja.w - 8} y={HEADER_H / 2 + 4} fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#ccff00" textAnchor="end">
                  {caja.tabla.filas}
                </text>
                {caja.claves.map((c, i) => (
                  <text
                    key={c.nombre}
                    x={10}
                    y={HEADER_H + PAD_Y + ROW_H * i + 11}
                    fontFamily="monospace"
                    fontSize="9.5"
                    fill={c.referencia ? '#0047ff' : '#111111'}
                  >
                    {c.primary_key ? '🔑 ' : c.referencia ? '↳ ' : ''}{c.nombre}
                  </text>
                ))}
                {caja.otras > 0 && (
                  <text
                    x={10}
                    y={HEADER_H + PAD_Y + ROW_H * caja.claves.length + 10}
                    fontFamily="monospace"
                    fontSize="9"
                    fill="#71717a"
                  >
                    +{caja.otras} campo{caja.otras === 1 ? '' : 's'} más
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {sinUbicar.length > 0 && (
        <p className="text-[10px] font-mono text-[#71717a]">
          Sin posición fija en el diagrama (tabla nueva): {sinUbicar.map(t => t.nombre).join(', ')}. Se pueden ver igual en la lista.
        </p>
      )}
    </div>
  )
}
