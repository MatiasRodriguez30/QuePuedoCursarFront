import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { getPeriodoActual } from '../../lib/businessLogic'

export default function AdminConfigPanel({ ctx, showToast, setConfigApp }) {
  const [anioInput, setAnioInput] = useState(ctx.configApp.anio_actual || '')
  const [cuatSel, setCuatSel] = useState(ctx.configApp.cuatrimestre_actual || null)

  useEffect(() => {
    setCuatSel(ctx.configApp.cuatrimestre_actual || null)
    setAnioInput(ctx.configApp.anio_actual || '')
  }, [ctx.configApp.anio_actual, ctx.configApp.cuatrimestre_actual])

  if (!ctx.carreraActual) {
    return <p className="text-xs text-slate-500 italic py-8 text-center">Elegí una carrera arriba para configurar su período actual.</p>
  }

  const periodo = getPeriodoActual(ctx.configApp)
  const periodoTexto = ctx.configApp.anio_actual && ctx.configApp.cuatrimestre_actual
    ? `✓ Configurado manualmente: ${periodo.cuatrimestre}° cuatrimestre ${periodo.anio}`
    : `Sin configurar — usando fecha del dispositivo: ${periodo.cuatrimestre || 'receso'}° cuatrimestre ${periodo.anio}`

  async function guardarPeriodo() {
    const anio = parseInt(anioInput) || null
    if (!anio || !cuatSel) {
      showToast('warning', 'Datos incompletos', 'Elegí año y cuatrimestre antes de guardar')
      return
    }
    try {
      const cfg = await apiRequest(`/config?carrera_id=${ctx.carreraActual.id}`, { method: 'PUT', body: JSON.stringify({ anio_actual: anio, cuatrimestre_actual: cuatSel }) })
      setConfigApp(cfg)
      showToast('success', 'Período Guardado', 'La ruta sugerida ya usa el momento actual')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  async function limpiarPeriodo() {
    try {
      setCuatSel(null)
      const cfg = await apiRequest(`/config?carrera_id=${ctx.carreraActual.id}`, { method: 'PUT', body: JSON.stringify({ anio_actual: null, cuatrimestre_actual: null }) })
      setConfigApp(cfg)
      showToast('info', 'Período Automático', 'Volviendo a estimar por fecha del dispositivo')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-400" />
          Período Actual — {ctx.carreraActual.nombre}
        </h3>
        <p className="text-xs text-slate-400 mt-1">Definilo para que el "Camino Óptimo" y las próximas oportunidades sean exactas para esta carrera. Si lo dejás vacío, el sistema estima el cuatrimestre con la fecha del dispositivo.</p>
      </div>
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
      </div>
      <p className="text-xs text-slate-400">{periodoTexto}</p>
    </div>
  )
}
