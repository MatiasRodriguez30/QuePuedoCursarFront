import { useEffect, useRef, useState } from 'react'
import { Award, BookOpen, CheckCircle2, Clock, Compass, Loader2 } from 'lucide-react'
import { checkCursadaRequirements, esElectiva } from '../lib/businessLogic'

/** Anima un número del 0 al valor `target` usando requestAnimationFrame. */
function useCountUp(target, duration = 650) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  const prev = useRef(target)

  useEffect(() => {
    if (prev.current === target && value !== 0) return
    prev.current = target
    const start = performance.now()
    const from = 0

    function step(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(from + (target - from) * eased))
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }

    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(step)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return value
}

export default function HeroMetrics({ ctx }) {
  const { estadosMap } = ctx
  // Las electivas (código "E-") no cuentan en el avance general de la carrera
  // (ver esElectiva en businessLogic.js). Se contabilizan por separado en RutaTab.
  const materias = ctx.materias.filter(m => !esElectiva(m))
  const total = materias.length
  let countPromo = 0, countReg = 0, countCursando = 0, countDisponibles = 0

  materias.forEach(m => {
    const st = estadosMap[m.id] || 'NO_CURSADA'
    if (st === 'PROMOCIONADA') countPromo++
    else if (st === 'REGULAR') countReg++
    else if (st === 'CURSANDO') countCursando++
    else if (checkCursadaRequirements(m.id, ctx).puede) countDisponibles++
  })

  const pct = total > 0 ? Math.round((countPromo / total) * 100) : 0
  const pctOf = (n) => total > 0 ? (n / total) * 100 : 0

  const animPromo = useCountUp(countPromo)
  const animReg = useCountUp(countReg)
  const animCursando = useCountUp(countCursando)
  const animDisponibles = useCountUp(countDisponibles)
  const animTotal = useCountUp(total)
  const animPct = useCountUp(pct)

  return (
    <section
      aria-label="Resumen de avance de carrera"
      className="notebook-panel rounded-2xl p-4 sm:p-5 border border-[#e2dcce] bg-white shadow-xs"
    >
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5">
        {/* Barra de progreso e indicadores */}
        <div className="space-y-2.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                <Award className="w-4 h-4" aria-hidden="true" />
              </span>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-[#57534e] block">
                  Avance de Carrera
                </span>
                <span className="text-[11px] text-[#78716c] font-medium hidden sm:inline">
                  {countPromo} de {total} materias aprobadas
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-1" aria-label={`${animPct} por ciento aprobado`}>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-[#1a1916] tracking-tight">
                {animPct}%
              </span>
            </div>
          </div>

          {/* Barra de progreso principal estilo regla */}
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Porcentaje de materias aprobadas"
            className="w-full h-3 bg-[#f4efe6] rounded-full overflow-hidden border border-[#d6cebf] relative"
          >
            <div
              style={{ width: `${pct}%` }}
              className="h-full bg-emerald-600 rounded-full transition-all duration-700"
            />
          </div>

          {/* Barra segmentada por condición */}
          <div className="w-full h-2 bg-[#f4efe6] rounded-full overflow-hidden flex border border-[#e2dcce] gap-0.5">
            <div
              style={{ width: `${pctOf(countPromo)}%` }}
              className="h-full bg-emerald-600 rounded-l-full transition-all duration-500"
              title={`Aprobadas: ${countPromo}`}
            />
            <div
              style={{ width: `${pctOf(countReg)}%` }}
              className="h-full bg-amber-500 transition-all duration-500"
              title={`Regulares: ${countReg}`}
            />
            <div
              style={{ width: `${pctOf(countCursando)}%` }}
              className="h-full bg-sky-500 transition-all duration-500"
              title={`Cursando: ${countCursando}`}
            />
            <div
              style={{ width: `${pctOf(countDisponibles)}%` }}
              className="h-full bg-orange-500 transition-all duration-500"
              title={`Disponibles para cursar: ${countDisponibles}`}
            />
          </div>

          {/* Referencias al pie de la barra */}
          <p className="text-[11px] text-[#57534e] flex items-center gap-x-3.5 gap-y-1 pt-0.5 flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block border border-emerald-800" aria-hidden="true" />
              Aprobadas
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block border border-amber-700" aria-hidden="true" />
              Regulares
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-sky-500 inline-block border border-sky-700" aria-hidden="true" />
              Cursando
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-orange-500 inline-block border border-orange-700" aria-hidden="true" />
              Disponibles
            </span>
          </p>
        </div>

        {/* Fichas de métricas con formato de sellos */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-[#e2dcce]">
          {/* Aprobadas */}
          <div className="bg-[#f0fdf4] border-2 border-emerald-600 rounded-xl p-2.5 sm:p-3 text-center min-w-[85px] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-emerald-800 mb-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Aprobadas</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-emerald-950 tabular-nums">
              {animPromo}
            </div>
          </div>

          {/* Regulares */}
          <div className="bg-[#fefce8] border-2 border-amber-600 rounded-xl p-2.5 sm:p-3 text-center min-w-[85px] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-amber-900 mb-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Regulares</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-amber-950 tabular-nums">
              {animReg}
            </div>
          </div>

          {/* Cursando */}
          <div className="bg-[#f0f9ff] border-2 border-sky-600 rounded-xl p-2.5 sm:p-3 text-center min-w-[85px] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-sky-900 mb-0.5">
              <Loader2 className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Cursando</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-sky-950 tabular-nums">
              {animCursando}
            </div>
          </div>

          {/* Disponibles */}
          <div className="bg-[#fff7ed] border-2 border-orange-600 rounded-xl p-2.5 sm:p-3 text-center min-w-[85px] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-orange-900 mb-0.5">
              <Compass className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Listas</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-orange-950 tabular-nums">
              {animDisponibles}
            </div>
          </div>

          {/* Total */}
          <div className="bg-[#f5f5f4] border-2 border-[#78716c] rounded-xl p-2.5 sm:p-3 text-center min-w-[85px] shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[#44403c] mb-0.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Total</span>
            </div>
            <div className="text-lg sm:text-xl font-mono font-black text-[#1a1916] tabular-nums">
              {animTotal}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
