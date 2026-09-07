import { useEffect, useMemo, useState } from 'react'
import { Calendar, CheckCircle2, Clock, FastForward, GraduationCap, Map, Sparkles, TrendingUp, Unlock } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { computeCaminoCompleto, computeCreditosElectivas, computePrediccionCursando, getPeriodoActual } from '../lib/businessLogic'

const NOMBRE_CUATRI = (p) => p.cuatrimestre ? `${p.cuatrimestre}° cuatrimestre ${p.anio}` : `Anual ${p.anio}`

export default function RutaTab({ ctx, showToast, setConfigApp, esAdmin }) {
  const [anioInput, setAnioInput] = useState(ctx.configApp.anio_actual || '')
  const [cuatSel, setCuatSel] = useState(ctx.configApp.cuatrimestre_actual || null)

  useEffect(() => {
    setCuatSel(ctx.configApp.cuatrimestre_actual || null)
    setAnioInput(ctx.configApp.anio_actual || '')
  }, [ctx.configApp.anio_actual, ctx.configApp.cuatrimestre_actual])

  const periodo = getPeriodoActual(ctx.configApp)
  const prediccion = useMemo(() => computePrediccionCursando(ctx), [ctx])
  const camino = useMemo(() => computeCaminoCompleto(ctx), [ctx])
  const creditos = useMemo(() => computeCreditosElectivas(ctx), [ctx])

  async function guardarPeriodo() {
    const anio = parseInt(anioInput) || null
    if (!anio || !cuatSel) {
      showToast('warning', 'Datos incompletos', 'Elegí año y cuatrimestre antes de guardar')
      return
    }
    try {
      const cfg = await apiRequest('/config', { method: 'PUT', body: JSON.stringify({ anio_actual: anio, cuatrimestre_actual: cuatSel }) })
      setConfigApp(cfg)
      showToast('success', 'Período Guardado', 'La ruta sugerida ya usa tu momento actual')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  async function limpiarPeriodo() {
    try {
      setCuatSel(null)
      const cfg = await apiRequest('/config', { method: 'PUT', body: JSON.stringify({ anio_actual: null, cuatrimestre_actual: null }) })
      setConfigApp(cfg)
      showToast('info', 'Período Automático', 'Volviendo a estimar por fecha del dispositivo')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  const periodoTexto = ctx.configApp.anio_actual && ctx.configApp.cuatrimestre_actual
    ? `✓ Configurado manualmente: ${periodo.cuatrimestre}° cuatrimestre ${periodo.anio}`
    : `Sin configurar — usando fecha del dispositivo: ${periodo.cuatrimestre || 'receso'}° cuatrimestre ${periodo.anio}`

  const pasosCount = camino.pasos.length
  const anios = (pasosCount / 2).toFixed(pasosCount % 2 === 0 ? 0 : 1)

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Map className="w-4 h-4 text-brand-400" />
          Camino Óptimo de Cursada
        </h2>
        <p className="text-xs text-slate-400">La secuencia completa, período por período, para terminar cursando lo máximo posible cada vez.</p>
      </div>

      {/* Banner de atraso / tiempo estimado */}
      <div className="glass-panel rounded-2xl p-5 border border-brand-500/30 bg-brand-950/10 flex items-center gap-4 flex-wrap">
        <div className="h-11 w-11 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
          <Clock className="w-5 h-5 text-brand-400" />
        </div>
        <div className="flex-1 min-w-[200px]">
          {pasosCount === 0 ? (
            <p className="text-sm font-bold text-emerald-300">¡No te queda nada pendiente que puedas planificar! 🎉</p>
          ) : (
            <>
              <p className="text-sm font-bold text-white">
                Te faltan al menos <span className="text-brand-400">{pasosCount} cuatrimestre{pasosCount === 1 ? '' : 's'}</span> (~{anios} año{anios == 1 ? '' : 's'}) cursando el máximo posible cada período.
              </p>
              {!camino.completo && (
                <>
                  <p className="text-xs text-amber-300/90 mt-1">
                    Y quedarían {camino.materiasRestantes} materia{camino.materiasRestantes === 1 ? '' : 's'} sin ubicar en esa proyección (revisalas en "¿Qué Puedo Cursar?" — puede que dependan de una electiva que no se dicta este semestre).
                  </p>
                  {camino.oportunidadesFinales.length > 0 && (
                    <div className="text-xs text-amber-200/90 mt-2 flex items-start gap-1.5">
                      <FastForward className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>
                        Algunas se destrabarían antes vía excepción: {camino.oportunidadesFinales.map(({ materia, correlativa, tipo }, i) => (
                          <span key={materia.id}>
                            <span className="font-semibold">{materia.nombre}</span> (te falta {tipo === 'REGULARIZADA' ? 'regularizar' : 'rendir el final de'} {correlativa?.nombre}){i < camino.oportunidadesFinales.length - 1 ? '; ' : ''}
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
      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-brand-400" />
          Tu Momento Actual
        </h3>
        <p className="text-xs text-slate-400 mb-3">Definilo para que el camino y las "próximas oportunidades" sean exactas. Si lo dejás vacío, el sistema estima el cuatrimestre con la fecha de tu dispositivo.</p>
        {esAdmin ? (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Año calendario</label>
              <input type="number" value={anioInput} onChange={e => setAnioInput(e.target.value)} placeholder="Ej: 2026"
                className="w-28 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cuatrimestre</label>
              <div className="flex gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
                {[1, 2].map(n => (
                  <button key={n} type="button" onClick={() => setCuatSel(n)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${cuatSel === n ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                    {n}°
                  </button>
                ))}
              </div>
            </div>
            <button onClick={guardarPeriodo} className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all">Guardar</button>
            <button onClick={limpiarPeriodo} className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Usar fecha automática</button>
            <span className="text-xs text-slate-400 ml-auto">{periodoTexto}</span>
          </div>
        ) : (
          <p className="text-xs text-slate-300">{periodoTexto} <span className="text-slate-500">(sólo el admin puede cambiarlo)</span></p>
        )}
      </div>

      {/* Predicción por materias "Cursando" */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-sky-400" />
          Predicción: si apruebo lo que estoy cursando
        </h3>
        <p className="text-xs text-slate-400 mb-3">Simulación optimista: asume que todas tus materias en estado "Cursando" terminan aprobadas.</p>
        {prediccion.cursando.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic glass-panel rounded-xl border border-slate-800">
            No tenés materias marcadas como "Cursando" ahora. Marcalas en la pestaña "Mis Estados" para ver la predicción.
          </div>
        ) : (
          <div className="glass-panel rounded-2xl p-4 border border-sky-500/20 space-y-3">
            <div className="text-xs text-slate-400">
              Estás cursando:{' '}
              {prediccion.cursando.map((m, i) => (
                <span key={m.id}>
                  <span className="font-semibold text-sky-300">{m.nombre}</span>
                  {i < prediccion.cursando.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>

            {prediccion.desbloqueadas.length > 0 && (
              <div className="pt-3 border-t border-slate-800/60">
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider flex items-center gap-1"><Unlock className="w-3 h-3" /> Se desbloquean del todo:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {prediccion.desbloqueadas.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      {m.nombre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {prediccion.acercadas.length > 0 && (
              <div className="pt-3 border-t border-slate-800/60">
                <span className="text-[11px] uppercase font-bold text-brand-400 tracking-wider flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Te acercan (todavía no del todo):</span>
                <div className="space-y-1.5 mt-2">
                  {prediccion.acercadas.map(({ materia, faltan }) => (
                    <div key={materia.id} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                      <span className="font-semibold text-white">{materia.nombre}</span>
                      <span className="text-slate-500"> — te seguiría faltando: {faltan.map(f => f.materia).join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {prediccion.desbloqueadas.length === 0 && prediccion.acercadas.length === 0 && (
              <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800/60">Aprobarlas no cambia nada más todavía (las materias que dependen de ellas tienen otras correlativas pendientes sin relación a esto).</div>
            )}
          </div>
        )}
      </div>

      {/* Camino secuencial completo */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Map className="w-4 h-4 text-emerald-400" />
          Camino Sugerido, Paso a Paso
        </h3>
        <p className="text-xs text-slate-400 mb-1">Cada paso asume que rendís y aprobás el final de todo lo del paso anterior (no sólo regularizarlo). Ordenado por impacto en cascada dentro de cada período.</p>
        <p className="text-xs text-slate-500 mb-4">Donde diga <span className="text-amber-300 font-semibold">"vía excepción"</span> es una materia que normalmente no entraría todavía, pero sí si tramitás el Cursado Condicional (pestaña Recomendaciones) — es una opción extra, no hace falta tomarla para seguir el camino.</p>

        {camino.pasos.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic glass-panel rounded-xl border border-slate-800">Nada para planificar: no hay materias pendientes habilitables.</div>
        ) : (
          <div className="space-y-5">
            {camino.pasos.map((paso, i) => (
              <div key={i}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: COLORES[i % COLORES.length].texto }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] border" style={{ background: COLORES[i % COLORES.length].bg, borderColor: COLORES[i % COLORES.length].border }}>{i + 1}</span>
                  {NOMBRE_CUATRI(paso.periodo)} {i === 0 ? '· ahora' : ''}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paso.materias.map(({ materia, atraso }) => (
                    <div key={materia.id} className="glass-card rounded-xl p-4 border border-slate-800/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
                        {atraso.cantidad > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: COLORES[i % COLORES.length].bg, color: COLORES[i % COLORES.length].texto, borderColor: COLORES[i % COLORES.length].border }}>
                            Destraba {atraso.cantidad}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">{materia.nombre}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{materia.anio ? `Año ${materia.anio}` : ''} {materia.cuatrimestre ? `• ${materia.cuatrimestre}°C` : '• Anual'}</p>
                    </div>
                  ))}
                </div>

                {paso.porExcepcion && paso.porExcepcion.length > 0 && (
                  <div className="mt-3 pl-3 border-l-2 border-amber-500/40 space-y-2">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5"><FastForward className="w-3.5 h-3.5" /> Vía excepción, también podrías arrancar:</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {paso.porExcepcion.map(({ materia, correlativa, tipo }) => (
                        <div key={materia.id} className="rounded-xl p-3 border border-amber-500/25 bg-amber-950/10">
                          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
                          <h5 className="text-xs font-bold text-white leading-snug mt-1.5">{materia.nombre}</h5>
                          <p className="text-[10px] text-amber-200/90 mt-1">
                            Necesitás tramitar la excepción porque te falta {tipo === 'REGULARIZADA' ? 'regularizar' : 'rendir el final de'} <span className="font-semibold">{correlativa?.nombre}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Créditos de electivas: el plan pide horas por nivel, no materias puntuales */}
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <GraduationCap className="w-4 h-4 text-teal-400" />
          Créditos de Electivas
        </h3>
        <p className="text-xs text-slate-400 mb-3">No hace falta cursar todas las electivas cargadas: el plan pide una cantidad de horas semanales por nivel. Elegí cualquier combinación que llegue al total.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditos.map(({ nivel, requeridas, logradas, cumplido, disponibles }) => {
            const pct = Math.min(100, Math.round((logradas / requeridas) * 100))
            const cursables = disponibles.filter(m => {
              const est = ctx.estadosMap[m.id] || 'NO_CURSADA'
              return est === 'NO_CURSADA'
            })
            return (
              <div key={nivel} className={`glass-card rounded-xl p-4 border ${cumplido ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800/80'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">Nivel {nivel}</span>
                  {cumplido && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className={cumplido ? 'text-emerald-400' : 'text-slate-300'}>{logradas} / {requeridas} hs</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div className={`h-full ${cumplido ? 'bg-emerald-500' : 'bg-teal-500'} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
                {!cumplido && (
                  <p className="text-[11px] text-slate-500">
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

const COLORES = [
  { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', texto: '#6ee7b7' },   // emerald
  { bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.3)', texto: '#a5b4fc' },   // brand
  { bg: 'rgba(56,189,248,0.15)', border: 'rgba(56,189,248,0.3)', texto: '#7dd3fc' },   // sky
  { bg: 'rgba(217,70,239,0.15)', border: 'rgba(217,70,239,0.3)', texto: '#f0abfc' },   // fuchsia
  { bg: 'rgba(251,146,60,0.15)', border: 'rgba(251,146,60,0.3)', texto: '#fdba74' },   // orange
  { bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.3)', texto: '#fda4af' },     // rose
]
