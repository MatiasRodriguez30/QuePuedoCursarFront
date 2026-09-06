import { Award } from 'lucide-react'
import { checkCursadaRequirements } from '../lib/businessLogic'

export default function HeroMetrics({ ctx }) {
  const { materias, estadosMap } = ctx
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

  return (
    <section className="glass-panel rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800/80 relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 flex-1 w-full">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-brand-400" />
              Avance de Carrera
            </span>
            <span className="text-sm font-mono font-bold text-white">{pct}%</span>
          </div>

          <div className="w-full h-3 bg-slate-900/90 rounded-full overflow-hidden flex p-0.5 border border-slate-800 gap-0.5">
            <div style={{ width: `${pctOf(countPromo)}%` }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-l-full transition-all duration-500" title="Aprobadas" />
            <div style={{ width: `${pctOf(countReg)}%` }} className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" title="Regulares" />
            <div style={{ width: `${pctOf(countCursando)}%` }} className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-500" title="Cursando" />
            <div style={{ width: `${pctOf(countDisponibles)}%` }} className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 transition-all duration-500" title="Disponibles para cursar" />
          </div>

          <p className="text-xs text-slate-400 flex items-center gap-3 pt-1 flex-wrap">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Aprobadas</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Regulares</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Cursando</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-400 inline-block" /> Disponibles para cursar</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-600 inline-block" /> Bloqueadas</span>
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 w-full lg:w-auto">
          {[
            ['Aprobadas', countPromo, 'text-emerald-400'],
            ['Regulares', countReg, 'text-amber-400'],
            ['Cursando', countCursando, 'text-sky-400'],
            ['Disponibles', countDisponibles, 'text-brand-400'],
            ['Total Materias', total, 'text-slate-200'],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 text-center min-w-[90px]">
              <div className={`text-xl font-mono font-extrabold ${color}`}>{value}</div>
              <div className="text-[11px] font-medium text-slate-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
