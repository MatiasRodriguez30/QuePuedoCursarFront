import { useMemo } from 'react'
import {
  Calendar,
  CheckCircle2,
  Clock,
  FastForward,
  GraduationCap,
  Map,
  Sparkles,
  TrendingUp,
  Unlock
} from 'lucide-react'
import {
  computeCaminoCompleto,
  computeCreditosElectivas,
  computePrediccionCursando,
  getPeriodoActual
} from '../lib/businessLogic'

const NOMBRE_CUATRI = (p) =>
  p.cuatrimestre ? `${p.cuatrimestre}° cuatrimestre ${p.anio}` : `Anual ${p.anio}`

const STEP_THEMES = [
  { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', badge: 'bg-orange-100 text-orange-950 border-orange-400' },
  { bg: '#dcfce7', border: '#16a34a', text: '#14532d', badge: 'bg-emerald-100 text-emerald-950 border-emerald-400' },
  { bg: '#e0f2fe', border: '#0284c7', text: '#075985', badge: 'bg-sky-100 text-sky-950 border-sky-400' },
  { bg: '#fef3c7', border: '#d97706', text: '#78350f', badge: 'bg-amber-100 text-amber-950 border-amber-400' },
  { bg: '#f3e8ff', border: '#9333ea', text: '#581c87', badge: 'bg-purple-100 text-purple-950 border-purple-400' },
]

export default function RutaTab({ ctx }) {
  const periodo = getPeriodoActual(ctx.configApp)
  const prediccion = useMemo(() => computePrediccionCursando(ctx), [ctx])
  const camino = useMemo(() => computeCaminoCompleto(ctx), [ctx])
  const creditos = useMemo(() => computeCreditosElectivas(ctx), [ctx])

  const periodoTexto =
    ctx.configApp.anio_actual && ctx.configApp.cuatrimestre_actual
      ? `Configurado manualmente: ${periodo.cuatrimestre}° cuatrimestre ${periodo.anio}`
      : `Sin configurar — usando fecha del dispositivo: ${periodo.cuatrimestre || 'receso'}° cuatrimestre ${periodo.anio}`

  const pasosCount = camino.pasos.length
  const anios = (pasosCount / 2).toFixed(pasosCount % 2 === 0 ? 0 : 1)

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#e2dcce]">
        <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
          <Map className="w-4 h-4 text-orange-700" />
          Camino Óptimo de Cursada
        </h2>
        <p className="text-xs text-[#57534e]">
          La secuencia completa, período por período, para completar la carrera cursando lo máximo posible cada vez.
        </p>
      </div>

      {/* Banner de tiempo estimado */}
      <div className="notebook-panel rounded-2xl p-5 border-2 border-orange-400 bg-orange-50/40 flex items-center gap-4 flex-wrap">
        <div className="h-11 w-11 rounded-xl bg-orange-100 border border-orange-400 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-orange-800" />
        </div>
        <div className="flex-1 min-w-[200px]">
          {pasosCount === 0 ? (
            <p className="text-sm font-bold text-emerald-900">¡No te queda nada pendiente que puedas planificar!</p>
          ) : (
            <>
              <p className="text-sm font-bold text-[#1a1916]">
                Te faltan al menos <span className="text-orange-900 font-extrabold">{pasosCount} cuatrimestre{pasosCount === 1 ? '' : 's'}</span> (~{anios} año{anios == 1 ? '' : 's'}) cursando el máximo posible cada período.
              </p>
              {!camino.completo && (
                <>
                  <p className="text-xs text-amber-950 mt-1 font-medium">
                    Y quedarían {camino.materiasRestantes} materia{camino.materiasRestantes === 1 ? '' : 's'} sin ubicar en esa proyección (revisalas en "¿Qué Cursar?" — puede que dependan de una electiva que no se dicta este semestre).
                  </p>
                  {camino.oportunidadesFinales.length > 0 && (
                    <div className="text-xs text-amber-900 mt-2 flex items-start gap-1.5 font-medium">
                      <FastForward className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-700" />
                      <span>
                        Algunas se destrabarían antes vía excepción: {camino.oportunidadesFinales.map(({ materia, correlativa, tipo }, i) => (
                          <span key={materia.id}>
                            <span className="font-bold text-[#1a1916]">{materia.nombre}</span> (te falta {tipo === 'REGULARIZADA' ? 'regularizar' : 'rendir el final de'} {correlativa?.nombre}){i < camino.oportunidadesFinales.length - 1 ? '; ' : ''}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Momento actual */}
      <div className="notebook-panel rounded-2xl p-4 sm:p-5 border border-[#e2dcce] bg-white">
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-orange-700" />
          Tu Momento Actual
        </h3>
        <p className="text-xs text-[#57534e] font-medium">{periodoTexto}</p>
      </div>

      {/* Predicción por materias en curso */}
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-sky-700" />
          Predicción: si apruebo lo que estoy cursando
        </h3>
        <p className="text-xs text-[#57534e] mb-3">
          Simulación optimista: asume que todas tus materias en estado "Cursando" terminan aprobadas con final.
        </p>

        {prediccion.cursando.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#57534e] italic notebook-panel rounded-xl border border-[#e2dcce] bg-white p-4">
            No tenés materias marcadas como "Cursando" ahora. Marcalas en la pestaña "Mis Estados" para ver la proyección.
          </div>
        ) : (
          <div className="notebook-panel rounded-2xl p-4 sm:p-5 border-2 border-sky-400 bg-sky-50/20 space-y-3">
            <div className="text-xs text-[#57534e]">
              Estás cursando:{' '}
              {prediccion.cursando.map((m, i) => (
                <span key={m.id}>
                  <span className="font-bold text-[#075985]">{m.nombre}</span>
                  {i < prediccion.cursando.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {prediccion.desbloqueadas.length > 0 && (
              <div className="pt-3 border-t border-[#e2dcce]">
                <span className="text-[11px] uppercase font-bold text-emerald-900 tracking-wider flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5 text-emerald-700" /> Se desbloquean del todo:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {prediccion.desbloqueadas.map(m => (
                    <span
                      key={m.id}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-[#dcfce7] text-[#14532d] border border-emerald-600"
                    >
                      {m.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {prediccion.acercadas.length > 0 && (
              <div className="pt-3 border-t border-[#e2dcce]">
                <span className="text-[11px] uppercase font-bold text-orange-950 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-700" /> Te acercan (todavía no del todo):
                </span>
                <div className="space-y-1.5 mt-2">
                  {prediccion.acercadas.map(({ materia, faltan }) => (
                    <div
                      key={materia.id}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white border border-[#d6cebf] text-[#1a1916]"
                    >
                      <span className="font-bold">{materia.nombre}</span>
                      <span className="text-[#57534e]"> — te seguiría faltando: {faltan.map(f => f.materia).join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediccion.desbloqueadas.length === 0 && prediccion.acercadas.length === 0 && (
              <div className="text-xs text-[#57534e] italic pt-2 border-t border-[#e2dcce]">
                Aprobarlas no cambia nada más todavía (las materias que dependen de ellas tienen otras correlativas pendientes).
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camino secuencial completo */}
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <Map className="w-4 h-4 text-emerald-700" />
          Camino Sugerido, Paso a Paso
        </h3>
        <p className="text-xs text-[#57534e] mb-1 leading-relaxed">
          Cada paso asume que rendís y aprobás el final de todo lo del período anterior. Ordenado por impacto en cascada dentro de cada período.
        </p>
        <p className="text-xs text-[#78716c] mb-4">
          Donde diga <span className="text-amber-800 font-bold">"vía excepción"</span> es una materia que normalmente no entraría todavía, pero sí si tramitás cursado condicional.
        </p>

        {camino.pasos.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#57534e] italic notebook-panel rounded-xl border border-[#e2dcce] bg-white p-4">
            Nada para planificar: no hay materias pendientes habilitables.
          </div>
        ) : (
          <div className="space-y-6">
            {camino.pasos.map((paso, i) => {
              const theme = STEP_THEMES[i % STEP_THEMES.length]
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b-2 border-[#d6cebf]">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold border-2"
                      style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                    >
                      {i + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1a1916]">
                      {NOMBRE_CUATRI(paso.periodo)} {i === 0 ? '· (ahora)' : ''}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {paso.materias.map(({ materia, atraso }) => (
                      <div key={materia.id} className="notebook-card rounded-xl p-4 border-2 border-[#e2dcce] bg-white">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                            {materia.codigo}
                          </span>
                          {atraso.cantidad > 0 && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ background: theme.bg, borderColor: theme.border, color: theme.text }}
                            >
                              Destraba {atraso.cantidad}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-[#1a1916] leading-snug">{materia.nombre}</h4>
                        <p className="text-[11px] text-[#57534e] mt-1 font-medium">
                          {materia.anio ? `Año ${materia.anio}` : ''} {materia.cuatrimestre ? `• ${materia.cuatrimestre}°C` : '• Anual'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {paso.porExcepcion && paso.porExcepcion.length > 0 && (
                    <div className="mt-3 pl-3 border-l-4 border-amber-500 space-y-2">
                      <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <FastForward className="w-3.5 h-3.5 text-amber-700" /> Vía excepción, también podrías arrancar:
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {paso.porExcepcion.map(({ materia, correlativa, tipo }) => (
                          <div key={materia.id} className="rounded-xl p-3 border-2 border-amber-300 bg-amber-50/60">
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                              {materia.codigo}
                            </span>
                            <h5 className="text-xs font-bold text-[#1a1916] leading-snug mt-1.5">{materia.nombre}</h5>
                            <p className="text-[11px] text-amber-950 font-medium mt-1">
                              Falta {tipo === 'REGULARIZADA' ? 'regularizar' : 'aprobar'} <span className="font-bold">{correlativa?.nombre}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Créditos de electivas */}
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-teal-700" />
          Créditos de Electivas
        </h3>
        <p className="text-xs text-[#57534e] mb-3 leading-relaxed">
          No hace falta cursar todas las electivas cargadas: el plan pide una cantidad de horas semanales por nivel. Elegí cualquier combinación que llegue al total exigido.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditos.map(({ nivel, requeridas, logradas, cumplido, disponibles }) => {
            const pct = Math.min(100, Math.round((logradas / requeridas) * 100))
            const cursables = disponibles.filter(m => {
              const est = ctx.estadosMap[m.id] || 'NO_CURSADA'
              return est === 'NO_CURSADA'
            })
            return (
              <div
                key={nivel}
                className={`notebook-card rounded-xl p-4 border-2 ${
                  cumplido ? 'border-emerald-600 bg-emerald-50/30' : 'border-[#e2dcce] bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#1a1916]">Nivel {nivel}</span>
                  {cumplido && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14532d]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Cumplido
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={cumplido ? 'text-[#14532d] font-bold' : 'text-[#44403c]'}>
                    {logradas} / {requeridas} hs
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f4efe6] rounded-full overflow-hidden border border-[#d6cebf] mb-2">
                  <div
                    className={`h-full ${cumplido ? 'bg-emerald-600' : 'bg-teal-600'} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {!cumplido && (
                  <p className="text-[11px] text-[#57534e] font-medium leading-relaxed">
                    {cursables.length > 0
                      ? `Disponibles ahora: ${cursables.map(m => m.nombre.replace(' (Electiva)', '')).join(', ')}`
                      : 'Ninguna electiva de este nivel cargada como cursable todavía.'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
