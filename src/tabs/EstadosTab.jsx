import { memo, useDeferredValue, useMemo, useState } from 'react'
import { Inbox, RotateCcw, Search, Sliders } from 'lucide-react'
import { apiRequest } from '../lib/api'

const ESTADOS = [
  { value: 'NO_CURSADA', label: 'No Cursada' },
  { value: 'CURSANDO', label: 'Cursando' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'PROMOCIONADA', label: 'Aprobada' },
]

export default function EstadosTab({ ctx, showToast, showConfirm, actualizarEstado }) {
  const [query, setQuery] = useState('')
  // El filtrado de la lista completa se hace sobre el valor diferido: tipear
  // no bloquea el input aunque re-renderizar las tarjetas tarde.
  const queryDiferida = useDeferredValue(query)

  const list = useMemo(() => {
    const q = queryDiferida.toLowerCase().trim()
    if (!q) return ctx.materias
    return ctx.materias.filter(m => m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q))
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-400" />
            Actualizar Situación Académica
          </h2>
          <p className="text-xs text-slate-400">Marca en un clic el estado de cada materia para recalcular correlatividades</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrar materias..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            onClick={handleReset}
            title="Reiniciar todo el avance académico"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-colors flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="col-span-full py-12 text-center text-slate-400 glass-panel rounded-xl">
          <Inbox className="w-8 h-8 text-slate-500 mx-auto mb-2" />
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

// Memoizada: cambiar el estado de una materia no debe re-renderizar las
// tarjetas de todas las demás (el plan puede tener más de 40).
const MateriaEstadoCard = memo(function MateriaEstadoCard({ materia, estado, onSetEstado }) {
  return (
    <div className="glass-card rounded-xl p-4 border border-slate-800/90 flex flex-col justify-between gap-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
          <span className="text-xs text-slate-400">{materia.anio ? `Año ${materia.anio}` : ''} {materia.cuatrimestre ? `(${materia.cuatrimestre}°C)` : ''}</span>
        </div>
        <h4 className="text-sm font-bold text-white leading-snug">{materia.nombre}</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
        {ESTADOS.map(({ value, label }) => {
          const active = estado === value
          return (
            <button
              key={value}
              onClick={() => onSetEstado(materia.id, value)}
              className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${active ? CLASES_ACTIVAS[value] : `text-slate-400 ${CLASES_HOVER[value]}`}`}
            >
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
})

const CLASES_ACTIVAS = {
  NO_CURSADA: 'bg-slate-700 text-white shadow-sm',
  CURSANDO: 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20',
  REGULAR: 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20',
  PROMOCIONADA: 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20',
}

const CLASES_HOVER = {
  NO_CURSADA: 'hover:text-slate-200',
  CURSANDO: 'hover:text-sky-300',
  REGULAR: 'hover:text-amber-300',
  PROMOCIONADA: 'hover:text-emerald-300',
}
