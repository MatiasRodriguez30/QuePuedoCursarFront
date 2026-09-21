import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, RotateCcw } from 'lucide-react'
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
    return (
      <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
        <p className="font-mono text-xs font-bold uppercase text-[#52525b]">
          Elegí una carrera en la barra superior para configurar su período actual.
        </p>
      </div>
    )
  }

  const periodo = getPeriodoActual(ctx.configApp)
  const esManual = Boolean(ctx.configApp.anio_actual && ctx.configApp.cuatrimestre_actual)

  async function guardarPeriodo() {
    const anio = parseInt(anioInput, 10) || null
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
    <div className="space-y-5">
      <div className="pb-3 border-b-2 border-[#111111]">
        <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#111111]" aria-hidden="true" />
          Período Académico Activo — {ctx.carreraActual.nombre}
        </h2>
        <p className="text-xs font-mono text-[#52525b] mt-0.5 leading-relaxed">
          Permite fijar el año y cuatrimestre en curso para sincronizar las oportunidades de cursada y el itinerario sugerido.
        </p>
      </div>

      {/* Estado actual del período */}
      <div className="p-3.5 bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm">
        <span className="text-[10px] font-mono font-bold uppercase text-[#71717a] block">
          Estado actual:
        </span>
        <p className="text-xs font-mono font-bold text-[#111111] mt-0.5">
          {esManual ? (
            <span className="text-[#15803d]">
              ★ Manual fijado: {periodo.cuatrimestre}º cuatrimestre {periodo.anio}
            </span>
          ) : (
            <span className="text-[#52525b]">
              Reloj automático: {periodo.cuatrimestre || 'receso'}º cuatrimestre {periodo.anio} (según fecha local)
            </span>
          )}
        </p>
      </div>

      {/* Controles de selección */}
      <div className="flex flex-wrap items-end gap-3 pt-1">
        <div>
          <label htmlFor="cfg-anio" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
            Año calendario
          </label>
          <input
            id="cfg-anio"
            type="number"
            value={anioInput}
            onChange={e => setAnioInput(e.target.value)}
            placeholder="Ej: 2026"
            className="w-32 bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
          />
        </div>

        <div>
          <span className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
            Cuatrimestre
          </span>
          <div className="flex gap-1.5 bg-[#f4f0e6] p-1 border-2 border-[#111111]">
            {[1, 2].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCuatSel(n)}
                className={`px-4 py-1.5 text-xs font-mono font-bold uppercase transition-all cursor-pointer min-h-[36px] ${
                  cuatSel === n
                    ? 'bg-[#111111] text-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#ff1464]'
                    : 'bg-white text-[#111111] border border-[#111111] hover:bg-[#fff9db]'
                }`}
              >
                {n}º Cuatrimestre
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={guardarPeriodo}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px]"
        >
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          <span>Guardar Período</span>
        </button>

        {esManual && (
          <button
            type="button"
            onClick={limpiarPeriodo}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#fee2e2] text-[#991b1b] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px]"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Volver a Automático</span>
          </button>
        )}
      </div>
    </div>
  )
}
