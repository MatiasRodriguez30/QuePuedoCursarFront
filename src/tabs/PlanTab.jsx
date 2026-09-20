import { useState } from 'react'
import { BookX, GitFork, Search, Shuffle } from 'lucide-react'
import TitoAvatar from '../components/TitoAvatar'

export default function PlanTab({ ctx }) {
  const [query, setQuery] = useState('')

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e2dcce]">
        <div>
          <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-orange-700" />
            Estructura Curricular
          </h2>
          <p className="text-xs text-[#57534e]">
            Materias, años, cuatrimestres y correlatividades de {ctx.carreraActual?.nombre || 'la carrera'}.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar materia..."
            className="w-full bg-white border-2 border-[#78716c] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 transition-colors min-h-[44px]"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-14 text-center notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-6">
          <BookX className="w-12 h-12 text-[#78716c] mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#1a1916]">No hay materias en el plan</h3>
          <p className="text-xs text-[#57534e] mt-1">Todavía no hay asignaturas cargadas para esta carrera.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {aniosOrdenados.map(anioKey => {
            const materiasAnio = gruposPorAnio[anioKey]
            const titulo = anioKey == 0 ? 'Materias Generales / Sin Año Asignado' : `${anioKey}° Año de Cursada`
            return (
              <div key={anioKey} className="space-y-3.5">
                <div className="flex items-center gap-2.5 pb-1 border-b-2 border-[#d6cebf]">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  <h3 className="text-sm font-bold text-[#1a1916]">{titulo}</h3>
                  <span className="text-xs text-[#78716c] font-mono">({materiasAnio.length} materias)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {materiasAnio.map(m => {
                    const reqs = ctx.prereqsByMateria[m.id] || []
                    return (
                      <div key={m.id} className="notebook-card rounded-xl p-4 border-2 border-[#e2dcce] bg-white">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                            {m.codigo}
                          </span>
                          <span className="text-[11px] text-[#57534e] font-semibold">
                            {m.cuatrimestre ? `${m.cuatrimestre}° Cuatrimestre` : 'Anual'}
                            {m.horas_semanales ? ` • ${m.horas_semanales}hs` : ''}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#1a1916] leading-snug">{m.nombre}</h4>
                        {m.es_basica_compartida && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-900 border border-teal-400">
                            <Shuffle className="w-2.5 h-2.5" /> Comisión compartida
                          </span>
                        )}
                        {m.descripcion && (
                          <p className="text-xs text-[#57534e] mt-1.5 line-clamp-2 leading-relaxed font-medium">
                            {m.descripcion}
                          </p>
                        )}

                        <div className="space-y-1.5 pt-2.5 mt-2.5 border-t border-[#e2dcce]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-[#78716c] tracking-wider">
                              Correlativas:
                            </span>
                            <span className="text-[11px] font-mono font-bold text-orange-800">{reqs.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                            {reqs.length > 0 ? (
                              reqs.map(p => (
                                <span
                                  key={p.id}
                                  className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#d6cebf]"
                                >
                                  <span className="font-bold text-orange-800">
                                    {p.tipo === 'REGULARIZADA' ? 'REG' : 'APR'}:
                                  </span>
                                  <span className="truncate max-w-[120px] font-medium">
                                    {p.materia_requerida?.nombre || 'Materia'}
                                  </span>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[#78716c] italic">Ninguna (Inicial)</span>
                            )}
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
    </div>
  )
}
