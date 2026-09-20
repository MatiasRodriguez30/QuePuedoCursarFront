import { memo, useDeferredValue, useMemo, useState } from 'react'
import { Check, CheckCircle2, Clock, Hourglass, Inbox, RotateCcw, Search, Sliders, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const ESTADOS = [
  { value: 'NO_CURSADA', label: 'No Cursada', short: 'No Cursada', icon: X },
  { value: 'CURSANDO', label: 'Cursando', short: 'Cursando', icon: Hourglass },
  { value: 'REGULAR', label: 'Regular', short: 'Regular', icon: Clock },
  { value: 'PROMOCIONADA', label: 'Aprobada', short: 'Aprobada', icon: CheckCircle2 },
]

export default function EstadosTab({ ctx, showToast, showConfirm, actualizarEstado }) {
  const [query, setQuery] = useState('')
  const queryDiferida = useDeferredValue(query)

  const list = useMemo(() => {
    const q = queryDiferida.toLowerCase().trim()
    if (!q) return ctx.materias
    return ctx.materias.filter(
      m => m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q)
    )
  }, [ctx.materias, queryDiferida])

  async function handleReset() {
    const ok = await showConfirm(
      '¿Reiniciar todo tu avance académico?',
      "Todas las materias van a volver a estado 'No Cursada'. Esta acción no se puede deshacer.",
      'Reiniciar'
    )
    if (!ok) return
    try {
      await apiRequest('/estados/reset', { method: 'POST' })
    } catch (err) {
      showToast('error', 'Error', 'No se pudo reiniciar el avance: ' + err.message)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e2dcce]">
        <div>
          <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-700" />
            Mis Estados Académicos
          </h2>
          <p className="text-xs text-[#57534e]">
            Marcá con un clic la situación de cada materia para recalcular correlatividades al instante.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrar materias..."
              className="w-full bg-white border-2 border-[#78716c] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 transition-colors min-h-[44px]"
            />
          </div>
          <button
            onClick={handleReset}
            title="Reiniciar todo el avance académico"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border-2 border-rose-600 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-bold transition-colors flex-shrink-0 min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="col-span-full py-12 text-center text-[#57534e] notebook-panel rounded-xl p-6">
          <Inbox className="w-8 h-8 text-[#78716c] mx-auto mb-2" />
          No hay materias para mostrar
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map(m => (
            <MateriaEstadoCard
              key={m.id}
              materia={m}
              estado={ctx.estadosMap[m.id] || 'NO_CURSADA'}
              onSetEstado={actualizarEstado}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const MateriaEstadoCard = memo(function MateriaEstadoCard({ materia, estado, onSetEstado }) {
  const [animando, setAnimando] = useState(false)

  function handleSelect(nuevoEstado) {
    if (nuevoEstado === estado) return
    if (nuevoEstado === 'PROMOCIONADA') {
      setAnimando(true)
      setTimeout(() => setAnimando(false), 400)
    }
    onSetEstado(materia.id, nuevoEstado)
  }

  return (
    <div
      className={`notebook-card rounded-xl p-4 border-2 border-[#e2dcce] flex flex-col justify-between gap-3 bg-white transition-all ${
        animando ? 'stamp-pop-animation border-emerald-600' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
            {materia.codigo}
          </span>
          <span className="text-xs text-[#57534e] font-medium">
            {materia.anio ? `Año ${materia.anio}` : ''} {materia.cuatrimestre ? `(${materia.cuatrimestre}°C)` : ''}
          </span>
        </div>
        <h4 className="text-sm font-bold text-[#1a1916] leading-snug">{materia.nombre}</h4>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#f4efe6] p-1.5 rounded-xl border border-[#d6cebf]"
        role="group"
        aria-label={`Estado de ${materia.nombre}`}
      >
        {ESTADOS.map(({ value, label }) => {
          const active = estado === value
          return (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[44px] ${
                active
                  ? CLASES_ACTIVAS[value]
                  : `text-[#44403c] bg-white border border-[#d6cebf] ${CLASES_HOVER[value]}`
              }`}
            >
              {active && <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />}
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

const CLASES_ACTIVAS = {
  NO_CURSADA: 'bg-[#44403c] text-white border border-[#292524] shadow-xs',
  CURSANDO: 'bg-sky-600 text-white border border-sky-800 shadow-xs',
  REGULAR: 'bg-amber-600 text-white border border-amber-800 shadow-xs',
  PROMOCIONADA: 'bg-emerald-600 text-white border border-emerald-800 shadow-xs',
}

const CLASES_HOVER = {
  NO_CURSADA: 'hover:bg-[#ede6d8] hover:text-[#1a1916]',
  CURSANDO: 'hover:bg-sky-100 hover:text-sky-950',
  REGULAR: 'hover:bg-amber-100 hover:text-amber-950',
  PROMOCIONADA: 'hover:bg-emerald-100 hover:text-emerald-950',
}
