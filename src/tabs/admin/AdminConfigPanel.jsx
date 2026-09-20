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
    return <p className="text-xs text-[#57534e] italic py-8 text-center">Elegí una carrera arriba para configurar su período actual.</p>
  }

  const periodo = getPeriodoActual(ctx.configApp)
  const periodoTexto = ctx.configApp.anio_actual && ctx.configApp.cuatrimestre_actual
    ? `Configurado manualmente: ${periodo.cuatrimestre}° cuatrimestre ${periodo.anio}`
    : `Sin configurar — usando fecha del dispositivo: ${periodo.cuatrimestre || 'receso'}° cuatrimestre ${periodo.anio}`

  async function guardarPeriodo() {
    const anio = parseInt(anioInput) || null
    if (!anio || !cuatSel) {
      showToast('warning', 'Datos incompletos', 'Elegí año y cuatrimestre antes de guardar')
      return
    }
    try {
      const cfg = await apiRequest(`/config?carrera_id=${ctx.carreraActual.id}`, {
        method: 'PUT',
        body: JSON.stringify({ anio_actual: anio, cuatrimestre_actual: cuatSel }),
      })
      setConfigApp(cfg)
      showToast('success', 'Período Guardado', 'La ruta sugerida ya usa el momento actual')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  async function limpiarPeriodo() {
    try {
      setCuatSel(null)
      const cfg = await apiRequest(`/config?carrera_id=${ctx.carreraActual.id}`, {
        method: 'PUT',
        body: JSON.stringify({ anio_actual: null, cuatrimestre_actual: null }),
      })
      setConfigApp(cfg)
      showToast('info', 'Período Automático', 'Volviendo a estimar por fecha del dispositivo')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-700" />
          Período Actual — {ctx.carreraActual.nombre}
        </h3>
        <p className="text-xs text-[#57534e] mt-1 leading-relaxed">
          Definilo para que el "Camino Óptimo" y las próximas fechas de cursada sean exactas para esta carrera. Si lo dejás vacío, el sistema calcula el cuatrimestre con la fecha de la tablet/celular.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3 pt-2">
        <div>
          <label className="block text-xs font-bold text-[#44403c] mb-1">Año calendario</label>
          <input
            type="number"
            value={anioInput}
            onChange={e => setAnioInput(e.target.value)}
            placeholder="Ej: 2026"
            className="w-28 bg-white border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#44403c] mb-1">Cuatrimestre</label>
          <div className="flex gap-1.5 bg-[#f4efe6] p-1 rounded-xl border border-[#d6cebf]">
            {[1, 2].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCuatSel(n)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all min-h-[38px] ${
                  cuatSel === n
                    ? 'bg-orange-700 text-white shadow-xs'
                    : 'text-[#57534e] hover:text-[#1a1916] hover:bg-white'
                }`}
              >
                {n}°
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={guardarPeriodo}
          className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px]"
        >
          Guardar Período
        </button>

        <button
          onClick={limpiarPeriodo}
          className="px-3.5 py-2 text-xs font-bold text-[#57534e] hover:text-[#1a1916] hover:bg-[#f4efe6] rounded-xl border border-[#d6cebf] transition-colors min-h-[44px]"
        >
          Usar fecha automática
        </button>
      </div>

      <p className="text-xs text-[#57534e] font-medium pt-1">{periodoTexto}</p>
    </div>
  )
}
