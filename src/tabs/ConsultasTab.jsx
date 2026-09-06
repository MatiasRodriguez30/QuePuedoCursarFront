import { useMemo, useState } from 'react'
import { Calendar, Check, CheckCircle, Clock, FileCheck, Hourglass, Loader, Lock, Search, SearchX, Sparkles, X } from 'lucide-react'
import { checkCursadaRequirements, computeImpacto, computeImpactoCascada, proximaOportunidad } from '../lib/businessLogic'

const FILTERS = [
  { id: 'todas', label: 'Todas', emoji: '' },
  { id: 'puede-cursar', label: 'Puedo Cursar', emoji: '✨' },
  { id: 'puede-rendir', label: 'Rendir Final', emoji: '📝' },
  { id: 'cursando', label: 'Cursando', emoji: '⏳' },
  { id: 'aprobadas', label: 'Aprobadas', emoji: '✅' },
  { id: 'bloqueadas', label: 'Bloqueadas', emoji: '🔒' },
]

export default function ConsultasTab({ ctx }) {
  const [filter, setFilter] = useState('todas')
  const [query, setQuery] = useState('')

  const items = useMemo(() => {
    return ctx.materias.map(m => {
      const estado = ctx.estadosMap[m.id] || 'NO_CURSADA'
      const reqCheck = checkCursadaRequirements(m.id, ctx)
      const reqs = ctx.prereqsByMateria[m.id] || []
      const impacto = (estado === 'NO_CURSADA' && reqCheck.puede) ? computeImpacto(m.id, ctx) : 0
      const atraso = estado !== 'PROMOCIONADA' ? computeImpactoCascada(m.id, ctx) : { cantidad: 0, horas: 0 }
      const oportunidad = proximaOportunidad(m, ctx)
      return { materia: m, estado, reqCheck, reqs, impacto, atraso, oportunidad }
    })
  }, [ctx])

  const counts = {
    todas: items.length,
    'puede-cursar': items.filter(i => i.estado === 'NO_CURSADA' && i.reqCheck.puede).length,
    'puede-rendir': items.filter(i => i.estado === 'REGULAR').length,
    cursando: items.filter(i => i.estado === 'CURSANDO').length,
    aprobadas: items.filter(i => i.estado === 'PROMOCIONADA').length,
    bloqueadas: items.filter(i => i.estado === 'NO_CURSADA' && !i.reqCheck.puede).length,
  }

  let filtered = items
  if (filter === 'puede-cursar') filtered = filtered.filter(i => i.estado === 'NO_CURSADA' && i.reqCheck.puede)
  else if (filter === 'puede-rendir') filtered = filtered.filter(i => i.estado === 'REGULAR')
  else if (filter === 'cursando') filtered = filtered.filter(i => i.estado === 'CURSANDO')
  else if (filter === 'aprobadas') filtered = filtered.filter(i => i.estado === 'PROMOCIONADA')
  else if (filter === 'bloqueadas') filtered = filtered.filter(i => i.estado === 'NO_CURSADA' && !i.reqCheck.puede)

  const q = query.toLowerCase().trim()
  if (q) {
    filtered = filtered.filter(i => i.materia.nombre.toLowerCase().includes(q) || i.materia.codigo.toLowerCase().includes(q))
  }

  filtered = [...filtered].sort((a, b) => b.impacto - a.impacto)
  const maxImpacto = Math.max(0, ...filtered.map(i => i.impacto))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === f.id
                  ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-500/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {f.emoji ? `${f.emoji} ` : ''}{f.label} ({counts[f.id]})
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="col-span-full py-14 text-center glass-panel rounded-2xl border border-slate-800">
          <SearchX className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No se encontraron asignaturas</h3>
          <p className="text-xs text-slate-500 mt-1">Prueba cambiando el filtro o la búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => <ConsultaCard key={item.materia.id} {...item} maxImpacto={maxImpacto} estadosMap={ctx.estadosMap} />)}
        </div>
      )}
    </div>
  )
}

function ConsultaCard({ materia, estado, reqCheck, reqs, impacto, atraso, oportunidad, maxImpacto, estadosMap }) {
  let cardBorder = 'border-slate-800'
  let statusBadge = null
  let actionBadge = null
  const esTopPrioridad = impacto > 0 && impacto === maxImpacto

  if (estado === 'PROMOCIONADA') {
    cardBorder = 'border-emerald-500/30 bg-emerald-950/10'
    statusBadge = <Badge color="emerald" icon={CheckCircle}>Aprobada</Badge>
  } else if (estado === 'REGULAR') {
    cardBorder = 'border-amber-500/30 bg-amber-950/10'
    statusBadge = <Badge color="amber" icon={Clock}>Regular</Badge>
    actionBadge = <div className="mt-2 text-xs font-semibold text-amber-300 flex items-center gap-1.5"><FileCheck className="w-3.5 h-3.5" /> Habilitado para rendir Examen Final</div>
  } else if (estado === 'CURSANDO') {
    cardBorder = 'border-sky-500/30 bg-sky-950/10'
    statusBadge = <Badge color="sky" icon={Loader}>Cursando</Badge>
    actionBadge = <div className="mt-2 text-xs font-semibold text-sky-300 flex items-center gap-1.5"><Hourglass className="w-3.5 h-3.5" /> Resultado pendiente este cuatrimestre</div>
  } else if (reqCheck.puede) {
    cardBorder = 'border-brand-500/40 bg-brand-950/15 shadow-lg shadow-brand-500/5'
    statusBadge = <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">No Cursada</span>
    actionBadge = (
      <>
        <div className="mt-2 text-xs font-semibold text-brand-300 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-brand-400" /> ¡Habilitado para Cursar!</div>
        {impacto > 0 && (
          <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${esTopPrioridad ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-slate-800/80 text-slate-300 border border-slate-700'}`}>
            {esTopPrioridad ? '🔥' : '🔓'} Desbloquea {impacto} materia{impacto === 1 ? '' : 's'}{esTopPrioridad ? ' · Prioridad' : ''}
          </div>
        )}
        {atraso.cantidad > impacto && (
          <div className="mt-1 text-[10px] text-slate-500">(en cascada: {atraso.cantidad} materias{atraso.horas ? `, ${atraso.horas} hs/sem` : ''} si se demora)</div>
        )}
      </>
    )
  } else {
    cardBorder = 'border-slate-800/80 bg-slate-900/30 opacity-80'
    statusBadge = <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/50 text-slate-400 border border-slate-700">No Cursada</span>
    actionBadge = (
      <>
        <div className="mt-2 text-xs font-medium text-rose-400 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Correlatividades bloqueadas</div>
        {atraso.cantidad > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700">
            ⏳ Si no la aprobás, atrasa {atraso.cantidad} materia{atraso.cantidad === 1 ? '' : 's'}{atraso.horas ? ` (${atraso.horas} hs/sem)` : ''}
          </div>
        )}
      </>
    )
  }

  const oportunidadHtml = estado !== 'PROMOCIONADA' && (
    <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {oportunidad.texto}</p>
  )

  return (
    <div className={`glass-card rounded-xl p-4 border ${cardBorder} flex flex-col justify-between`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
          {statusBadge}
        </div>
        <h3 className="text-sm font-bold text-white mb-1 leading-snug">{materia.nombre}</h3>
        <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
          {materia.anio && <span>Año {materia.anio}</span>}
          <span>• {materia.cuatrimestre ? `${materia.cuatrimestre}° Cuatrimestre` : 'Anual'}</span>
          {materia.horas_semanales && <span>• {materia.horas_semanales} hs/sem</span>}
        </p>
        {oportunidadHtml}
        {actionBadge}
      </div>

      {reqs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Requisitos exigidos:</span>
          <div className="flex flex-wrap gap-1.5">
            {reqs.map(p => <ReqChip key={p.id} p={p} estadosMap={estadosMap} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function ReqChip({ p, estadosMap }) {
  const reqEstado = estadosMap[p.materia_requerida_id] || 'NO_CURSADA'
  const isOk = (p.tipo === 'REGULARIZADA' && (reqEstado === 'REGULAR' || reqEstado === 'PROMOCIONADA')) ||
               (p.tipo === 'APROBADA' && reqEstado === 'PROMOCIONADA')
  const chipColor = isOk ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
  const Icon = isOk ? Check : X
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border ${chipColor}`} title={`${p.tipo}: ${reqEstado}`}>
      <Icon className="w-2.5 h-2.5" />
      <span>{p.materia_requerida ? p.materia_requerida.nombre : 'Materia'}</span>
      <span className="text-[9px] font-mono uppercase px-1 py-0.5 bg-black/30 rounded font-semibold">{p.tipo === 'REGULARIZADA' ? 'REG' : 'APR'}</span>
    </span>
  )
}

function Badge({ color, icon: Icon, children }) {
  const colors = {
    emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    sky: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[color]}`}>
      <Icon className="w-3 h-3" /> {children}
    </span>
  )
}
