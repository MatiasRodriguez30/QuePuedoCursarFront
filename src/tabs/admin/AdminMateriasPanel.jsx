import { useState } from 'react'
import { BookX, Edit3, GitFork, Plus, Search, Shuffle, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import MateriaModal from '../../components/MateriaModal'
import PrereqsModal from '../../components/PrereqsModal'

export default function AdminMateriasPanel({ ctx, showToast, showConfirm }) {
  const [query, setQuery] = useState('')
  const [editingMateria, setEditingMateria] = useState(undefined)
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

  if (!ctx.carreraActual) {
    return <p className="text-xs text-[#57534e] italic py-8 text-center">Elegí una carrera arriba para gestionar sus materias.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#e2dcce]">
        <div>
          <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-orange-700" />
            Materias y Correlatividades — {ctx.carreraActual.nombre}
          </h3>
          <p className="text-xs text-[#57534e]">
            Gestioná asignaturas, años, cuatrimestres y requisitos de esta carrera.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar materia..."
              className="w-full bg-white border-2 border-[#78716c] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 transition-colors min-h-[44px]"
            />
          </div>
          <button
            onClick={() => setEditingMateria(null)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Materia</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-12 text-center notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-6">
          <BookX className="w-10 h-10 text-[#78716c] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-[#1a1916]">No hay materias cargadas</h4>
          <p className="text-xs text-[#57534e] mt-1">Usá el botón "+ Nueva Materia" para cargar el plan.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {aniosOrdenados.map(anioKey => {
            const materiasAnio = gruposPorAnio[anioKey]
            const titulo = anioKey == 0 ? 'Materias Sin Año Asignado' : `${anioKey}° Año de Cursada`
            return (
              <div key={anioKey} className="space-y-3">
                <div className="flex items-center gap-2.5 pb-1 border-b-2 border-[#d6cebf]">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  <h4 className="text-sm font-bold text-[#1a1916]">{titulo}</h4>
                  <span className="text-xs text-[#78716c] font-mono">({materiasAnio.length} materias)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {materiasAnio.map(m => {
                    const reqs = ctx.prereqsByMateria[m.id] || []
                    return (
                      <div
                        key={m.id}
                        className="notebook-card rounded-xl p-4 border-2 border-[#e2dcce] bg-white flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                              {m.codigo}
                            </span>
                            <span className="text-[11px] text-[#57534e] font-semibold">
                              {m.cuatrimestre ? `${m.cuatrimestre}°C` : 'Anual'}
                              {m.horas_semanales ? ` • ${m.horas_semanales}hs` : ''}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-[#1a1916] leading-snug">{m.nombre}</h5>
                          {m.es_basica_compartida && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-950 border border-teal-500">
                              <Shuffle className="w-2.5 h-2.5" /> Comisión compartida
                            </span>
                          )}
                          <p className="text-[11px] text-[#57534e] mt-1.5">
                            Correlatividades: <b className="text-orange-900">{reqs.length}</b>
                          </p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#e2dcce]">
                          <button
                            onClick={() => setPrereqsMateria(m)}
                            className="text-xs font-bold text-orange-800 hover:text-orange-950 hover:underline"
                          >
                            Editar correlatividades
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingMateria(m)}
                              title="Editar materia"
                              aria-label={`Editar materia ${m.nombre}`}
                              className="p-1.5 text-[#57534e] hover:text-[#1a1916] rounded-lg hover:bg-[#f4efe6] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(m)}
                              title="Eliminar materia"
                              aria-label={`Eliminar materia ${m.nombre}`}
                              className="p-1.5 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
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
        <MateriaModal
          materia={editingMateria}
          carreraId={ctx.carreraActual.id}
          onClose={() => setEditingMateria(undefined)}
          showToast={showToast}
        />
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
