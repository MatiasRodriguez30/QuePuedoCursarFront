import { useState } from 'react'
import { BookX, ChevronDown, ChevronUp, Edit3, GitFork, Plus, Search, Shuffle, Trash2 } from 'lucide-react'
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
  const [expandedAnios, setExpandedAnios] = useState(() => {
    const primer = aniosOrdenados[0] || '1'
    return { [primer]: true }
  })

  function toggleAnio(anioKey) {
    setExpandedAnios(prev => ({
      ...prev,
      [anioKey]: !prev[anioKey]
    }))
  }

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
    return (
      <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
        <p className="font-mono text-xs font-bold uppercase text-[#52525b]">
          Elegí una carrera en la barra superior para gestionar sus materias.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div>
          <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            Materias — {ctx.carreraActual.nombre}
          </h2>
          <p className="text-xs font-mono text-[#52525b] mt-0.5">
            Asignaturas, régimen cuatrimestral y cadena de correlatividades.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar materia o código..."
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>
          <button
            type="button"
            onClick={() => setEditingMateria(null)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px] whitespace-nowrap"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Nueva Materia</span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <BookX className="w-8 h-8 text-[#71717a] mx-auto mb-2" aria-hidden="true" />
          <p className="font-display text-sm font-bold uppercase text-[#111111]">No se encontraron materias</p>
          <p className="text-xs font-mono text-[#52525b] mt-1">Usá "+ Nueva Materia" para cargar materias a esta carrera.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {aniosOrdenados.map(anioKey => {
            const materiasAnio = gruposPorAnio[anioKey]
            const titulo = anioKey == 0 ? 'Materias Sin Nivel Asignado' : `${anioKey}º Año de Cursada`
            const isOpen = Boolean(query.trim() || expandedAnios[anioKey])
            return (
              <div key={anioKey} className="space-y-3">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => toggleAnio(anioKey)}
                  className="w-full flex items-center justify-between gap-2 pb-1.5 border-b-2 border-[#111111] text-left cursor-pointer md:cursor-default select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-[#ff1464] border border-[#111111]" aria-hidden="true" />
                    <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">{titulo}</h3>
                    <span className="text-[11px] font-mono text-[#52525b]">({materiasAnio.length} materias)</span>
                  </div>
                  <span className="md:hidden flex items-center gap-1 font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#111111] bg-white text-[#111111] shadow-[1px_1px_0px_#111111]">
                    {isOpen ? (
                      <>
                        <span>Plegar</span>
                        <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <span>Desplegar</span>
                        <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                      </>
                    )}
                  </span>
                </button>

                {/* Grilla responsiva de fichas (acordeón en móvil, expandida en escritorio) */}
                <div className={isOpen ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3' : 'hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3'}>
                  {materiasAnio.map(m => {
                    const reqs = ctx.prereqsByMateria[m.id] || []
                    return (
                      <div
                        key={m.id}
                        className="bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm p-3.5 flex flex-col justify-between gap-2.5"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-[#111111] text-[#ccff00]">
                              {m.codigo}
                            </span>
                            <span className="text-[10px] font-mono font-bold text-[#52525b]">
                              {m.cuatrimestre ? `${m.cuatrimestre}° Cuat.` : 'Anual'} • {m.horas_semanales || 4} hs/sem
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#111111] leading-snug">{m.nombre}</h4>
                          {m.es_basica_compartida && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-mono font-bold px-1.5 py-0.2 bg-[#eff6ff] text-[#0047ff] border border-[#111111]">
                              <Shuffle className="w-2.5 h-2.5" aria-hidden="true" />
                              <span>Comisión compartida</span>
                            </span>
                          )}
                          <p className="text-[11px] font-mono text-[#52525b] mt-1.5">
                            Correlativas directas: <b className="text-[#111111]">{reqs.length}</b>
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#111111] gap-1">
                          <button
                            type="button"
                            onClick={() => setPrereqsMateria(m)}
                            className="text-xs font-mono font-bold text-[#111111] hover:text-[#ff1464] underline underline-offset-2 cursor-pointer"
                          >
                            Correlatividades
                          </button>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMateria(m)}
                              title="Editar materia"
                              aria-label={`Editar materia ${m.nombre}`}
                              className="p-1.5 bg-white hover:bg-[#fff9db] text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(m)}
                              title="Eliminar materia"
                              aria-label={`Eliminar materia ${m.nombre}`}
                              className="p-1.5 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#991b1b] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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
