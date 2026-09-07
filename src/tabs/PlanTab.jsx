import { useState } from 'react'
import { BookX, Edit3, GitFork, Plus, Search, Shuffle, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import MateriaModal from '../components/MateriaModal'
import PrereqsModal from '../components/PrereqsModal'

export default function PlanTab({ ctx, showToast, showConfirm, esAdmin }) {
  const [query, setQuery] = useState('')
  const [editingMateria, setEditingMateria] = useState(undefined) // undefined = cerrado, null = nueva, obj = editar
  const [prereqsMateria, setPrereqsMateria] = useState(null)

  let list = ctx.materias
  const q = query.toLowerCase().trim()
  if (q) list = list.filter(m => m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q))

  const gruposPorAnio = {}
  list.forEach(m => {
    const key = m.anio || 0
    if (!gruposPorAnio[key]) gruposPorAnio[key] = []
    gruposPorAnio[key].push(m)
  })
  const aniosOrdenados = Object.keys(gruposPorAnio).sort((a, b) => Number(a) - Number(b))

  async function handleDelete(m) {
    const ok = await showConfirm(
      `¿Eliminar "${m.nombre}"?`,
      'Se eliminarán automáticamente también todas sus correlatividades asociadas. Esta acción no se puede deshacer.'
    )
    if (!ok) return
    try {
      await apiRequest(`/materias/${m.id}`, { method: 'DELETE' })
    } catch (err) {
      showToast('error', 'Error', 'No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-4 h-4 text-brand-400" />
            Estructura Curricular
          </h2>
          <p className="text-xs text-slate-400">Gestiona materias, años, cuatrimestres y árbol de requisitos</p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar materia..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          {esAdmin && (
            <button onClick={() => setEditingMateria(null)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all">
              <Plus className="w-4 h-4" />
              <span>Nueva Materia</span>
            </button>
          )}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-14 text-center glass-panel rounded-2xl border border-slate-800">
          <BookX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No hay asignaturas en el plan</h3>
          <p className="text-xs text-slate-500 mt-1">Usa el botón "+ Nueva Materia" para cargar las materias de la carrera</p>
        </div>
      ) : (
        <div className="space-y-8">
          {aniosOrdenados.map(anioKey => {
            const materiasAnio = gruposPorAnio[anioKey]
            const titulo = anioKey == 0 ? 'Asignaturas Generales / Sin Año Asignado' : `${anioKey}° Año Curricular`
            return (
              <div key={anioKey} className="space-y-3">
                <div className="flex items-center gap-3 pb-1 border-b border-slate-800/80">
                  <span className="w-2 h-2 rounded-full bg-brand-500" />
                  <h3 className="text-sm font-bold text-slate-200">{titulo}</h3>
                  <span className="text-xs text-slate-500 font-mono">({materiasAnio.length} materias)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {materiasAnio.map(m => {
                    const reqs = ctx.prereqsByMateria[m.id] || []
                    return (
                      <div key={m.id} className="glass-card rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between gap-3">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{m.codigo}</span>
                            <span className="text-[11px] text-slate-400 font-medium">{m.cuatrimestre ? `${m.cuatrimestre}° Cuatrimestre` : 'Anual'}{m.horas_semanales ? ` • ${m.horas_semanales}hs` : ''}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white leading-snug">{m.nombre}</h4>
                          {m.es_basica_compartida && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                              <Shuffle className="w-2.5 h-2.5" /> Comisión compartida
                            </span>
                          )}
                          {m.descripcion && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.descripcion}</p>}
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Correlatividades:</span>
                            <span className="text-[11px] font-mono text-brand-400 font-bold">{reqs.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                            {reqs.length > 0 ? reqs.map(p => (
                              <span key={p.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/80">
                                <span className="font-semibold text-brand-300">{p.tipo === 'REGULARIZADA' ? 'REG' : 'APR'}:</span>
                                <span className="truncate max-w-[120px]">{p.materia_requerida?.nombre || 'Materia'}</span>
                              </span>
                            )) : <span className="text-xs text-slate-500 italic">Ninguna (Inicial)</span>}
                          </div>
                        </div>

                        {esAdmin && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <button onClick={() => setPrereqsMateria(m)} className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-brand-500/10 transition-colors">
                              <GitFork className="w-3.5 h-3.5" />
                              <span>Requisitos</span>
                            </button>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingMateria(m)} title="Editar Asignatura" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(m)} title="Eliminar Asignatura" className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editingMateria !== undefined && (
        <MateriaModal materia={editingMateria} onClose={() => setEditingMateria(undefined)} showToast={showToast} />
      )}
      {prereqsMateria && (
        <PrereqsModal
          materia={prereqsMateria}
          materias={ctx.materias}
          prereqsByMateria={ctx.prereqsByMateria}
          onClose={() => setPrereqsMateria(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}
