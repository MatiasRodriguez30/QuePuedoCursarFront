import { useEffect, useMemo, useState } from 'react'
import { Calendar, Map, Route, Sparkles, Unlock } from 'lucide-react'
import { apiRequest } from '../lib/api'
import { computePrediccionCursando, computeRutaSugerida, getPeriodoActual } from '../lib/businessLogic'

export default function RutaTab({ ctx, showToast, setConfigApp }) {
  const [anioInput, setAnioInput] = useState(ctx.configApp.anio_actual || '')
  const [cuatSel, setCuatSel] = useState(ctx.configApp.cuatrimestre_actual || null)

  useEffect(() => {
    setCuatSel(ctx.configApp.cuatrimestre_actual || null)
    setAnioInput(ctx.configApp.anio_actual || '')
  }, [ctx.configApp.anio_actual, ctx.configApp.cuatrimestre_actual])

  const periodo = getPeriodoActual(ctx.configApp)
  const prediccion = useMemo(() => computePrediccionCursando(ctx), [ctx])
  const ruta = useMemo(() => computeRutaSugerida(ctx), [ctx])

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

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Route className="w-4 h-4 text-brand-400" />
          Camino Óptimo de Cursada
        </h2>
        <p className="text-xs text-slate-400">Sugerencia de orden de cursada priorizando lo que más te destraba, y qué podés esperar de las materias que ya estás cursando.</p>
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-brand-400" />
          Tu Momento Actual
        </h3>
        <p className="text-xs text-slate-400 mb-3">Definilo para que la ruta sugerida y las "próximas oportunidades" sean exactas. Si lo dejás vacío, el sistema estima el cuatrimestre con la fecha de tu dispositivo.</p>
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
      </div>

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
          <div className="glass-panel rounded-2xl p-4 border border-sky-500/20">
            <div className="text-xs text-slate-400 mb-2">
              Estás cursando:{' '}
              {prediccion.cursando.map((m, i) => (
                <span key={m.id}>
                  <span className="font-semibold text-sky-300">{m.nombre}</span>
                  {i < prediccion.cursando.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
            {prediccion.desbloqueadas.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-slate-800/60">
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Si las apruebas, vas a poder cursar:</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {prediccion.desbloqueadas.map(m => (
                    <span key={m.id} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <Unlock className="w-3 h-3" /> {m.nombre}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-[11px] text-slate-500 italic">Aprobarlas no desbloquea materias nuevas todavía (puede que otras correlativas también estén pendientes).</div>
            )}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Map className="w-4 h-4 text-emerald-400" />
          Ruta Sugerida
        </h3>
        <p className="text-xs text-slate-400 mb-3">Ordenada por impacto en cascada: primero lo que más materias futuras destraba.</p>
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">1</span> Cursá esto ahora
            </h4>
            <RutaGrid items={ruta.paso1} colorClass="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30" emptyText='No hay materias habilitadas para este período. Revisá "¿Qué Puedo Cursar?".' />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-2 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-[10px]">2</span> Con eso, el próximo período vas a poder cursar
            </h4>
            <RutaGrid items={ruta.paso2} colorClass="bg-brand-500/15 text-brand-300 border border-brand-500/30" emptyText="Sin datos suficientes todavía para proyectar el próximo período." />
          </div>
        </div>
      </div>
    </div>
  )
}

function RutaGrid({ items, colorClass, emptyText }) {
  if (items.length === 0) {
    return <div className="col-span-full py-6 text-center text-xs text-slate-500 italic glass-panel rounded-xl border border-slate-800">{emptyText}</div>
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ materia, atraso }) => (
        <div key={materia.id} className="glass-card rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
            {atraso.cantidad > 0 && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colorClass}`}>Destraba {atraso.cantidad}</span>}
          </div>
          <h4 className="text-sm font-bold text-white leading-snug">{materia.nombre}</h4>
          <p className="text-[11px] text-slate-500 mt-1">{materia.anio ? `Año ${materia.anio}` : ''} {materia.cuatrimestre ? `• ${materia.cuatrimestre}°C` : '• Anual'}</p>
        </div>
      ))}
    </div>
  )
}
