import { memo, useDeferredValue, useMemo, useState } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  Hourglass,
  Lock,
  Search,
  Sparkles,
  X
} from 'lucide-react'
import { checkCursadaRequirements, computeImpacto, computeImpactoCascada, proximaOportunidad } from '../lib/businessLogic'
import TitoAvatar from '../components/TitoAvatar'

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'puede-cursar', label: 'Listas para Cursar' },
  { id: 'puede-rendir', label: 'Rendir Final' },
  { id: 'cursando', label: 'Cursando' },
  { id: 'aprobadas', label: 'Aprobadas' },
  { id: 'bloqueadas', label: 'Bloqueadas' },
]

export default function ConsultasTab({ ctx }) {
  const [filter, setFilter] = useState('todas')
  const [query, setQuery] = useState('')
  // Filtrar sobre el valor diferido para que el input responda fluido en tablet/móvil
  const queryDiferida = useDeferredValue(query)

  const items = useMemo(() => {
    return ctx.materias.map(m => {
      const estado = ctx.estadosMap[m.id] || 'NO_CURSADA'
      const reqCheck = checkCursadaRequirements(m.id, ctx)
      const reqs = ctx.prereqsByMateria[m.id] || []
      const impacto = estado === 'NO_CURSADA' && reqCheck.puede ? computeImpacto(m.id, ctx) : 0
      const atraso = estado !== 'PROMOCIONADA' ? computeImpactoCascada(m.id, ctx) : { cantidad: 0, horas: 0 }
      const oportunidad = proximaOportunidad(m, ctx)
      return { materia: m, estado, reqCheck, reqs, impacto, atraso, oportunidad }
    })
  }, [ctx])

  const counts = useMemo(
    () => ({
      todas: items.length,
      'puede-cursar': items.filter(i => i.estado === 'NO_CURSADA' && i.reqCheck.puede).length,
      'puede-rendir': items.filter(i => i.estado === 'REGULAR').length,
      cursando: items.filter(i => i.estado === 'CURSANDO').length,
      aprobadas: items.filter(i => i.estado === 'PROMOCIONADA').length,
      bloqueadas: items.filter(i => i.estado === 'NO_CURSADA' && !i.reqCheck.puede).length,
    }),
    [items]
  )

  const filtered = useMemo(() => {
    let resultado = items
    if (filter === 'puede-cursar') resultado = resultado.filter(i => i.estado === 'NO_CURSADA' && i.reqCheck.puede)
    else if (filter === 'puede-rendir') resultado = resultado.filter(i => i.estado === 'REGULAR')
    else if (filter === 'cursando') resultado = resultado.filter(i => i.estado === 'CURSANDO')
    else if (filter === 'aprobadas') resultado = resultado.filter(i => i.estado === 'PROMOCIONADA')
    else if (filter === 'bloqueadas') resultado = resultado.filter(i => i.estado === 'NO_CURSADA' && !i.reqCheck.puede)

    const q = queryDiferida.toLowerCase().trim()
    if (q) {
      resultado = resultado.filter(
        i => i.materia.nombre.toLowerCase().includes(q) || i.materia.codigo.toLowerCase().includes(q)
      )
    }
    return [...resultado].sort((a, b) => b.impacto - a.impacto)
  }, [items, filter, queryDiferida])

  const maxImpacto = useMemo(() => filtered.reduce((max, i) => Math.max(max, i.impacto), 0), [filtered])

  return (
    <div className="space-y-5">
      {/* Barra de filtros y buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-[#e2dcce]">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Filtros de materias">
          {FILTERS.map(f => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors min-h-[44px] flex items-center ${
                  active
                    ? 'bg-orange-700 text-white border-orange-800 shadow-2xs'
                    : 'bg-white text-[#44403c] border-[#78716c] hover:bg-[#f4efe6]'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`ml-1.5 text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    active ? 'bg-orange-900 text-orange-100' : 'bg-[#f4efe6] text-[#44403c]'
                  }`}
                >
                  {counts[f.id]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Buscador de materias */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-[#78716c] absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por código o nombre..."
            className="w-full bg-white border-2 border-[#78716c] rounded-xl pl-9 pr-8 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 transition-colors min-h-[44px]"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-[#1a1916] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Lista de asignaturas o estado vacío */}
      {filtered.length === 0 ? (
        <div className="py-14 text-center notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-6">
          <TitoAvatar className="w-16 h-16 mx-auto mb-3" variant="empty-search" />
          <h3 className="text-sm font-bold text-[#1a1916]">No encontramos ninguna materia</h3>
          <p className="text-xs text-[#57534e] mt-1 max-w-sm mx-auto">
            Probá cambiando la búsqueda o eligiendo otro filtro en las solapas de arriba.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ConsultaCard
              key={item.materia.id}
              {...item}
              maxImpacto={maxImpacto}
              estadosMap={ctx.estadosMap}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const ConsultaCard = memo(function ConsultaCard({
  materia,
  estado,
  reqCheck,
  reqs,
  impacto,
  atraso,
  oportunidad,
  maxImpacto,
  estadosMap,
}) {
  let cardBorder = 'border-[#e2dcce]'
  let statusBadge = null
  let actionBadge = null
  const esTopPrioridad = impacto > 0 && impacto === maxImpacto

  if (estado === 'PROMOCIONADA') {
    cardBorder = 'border-emerald-600 bg-emerald-50/30'
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dcfce7] text-[#14532d] border border-emerald-600">
        <CheckCircle2 className="w-3 h-3" /> Aprobada
      </span>
    )
  } else if (estado === 'REGULAR') {
    cardBorder = 'border-amber-600 bg-amber-50/30'
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fef3c7] text-[#78350f] border border-amber-600">
        <Clock className="w-3 h-3" /> Regular
      </span>
    )
    actionBadge = (
      <div className="mt-2 text-xs font-bold text-[#78350f] flex items-center gap-1.5">
        <FileCheck className="w-3.5 h-3.5 text-amber-700" />
        Habilitado para rendir examen final
      </div>
    )
  } else if (estado === 'CURSANDO') {
    cardBorder = 'border-sky-600 bg-sky-50/30'
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e0f2fe] text-[#075985] border border-sky-600">
        <Hourglass className="w-3 h-3" /> Cursando
      </span>
    )
    actionBadge = (
      <div className="mt-2 text-xs font-bold text-[#075985] flex items-center gap-1.5">
        <Hourglass className="w-3.5 h-3.5 text-sky-700" />
        Resultado pendiente este cuatrimestre
      </div>
    )
  } else if (reqCheck.puede) {
    cardBorder = 'border-orange-600 bg-orange-50/30 shadow-xs'
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffedd5] text-[#7c2d12] border border-orange-500">
        <Compass className="w-3 h-3" /> No Cursada
      </span>
    )
    actionBadge = (
      <>
        <div className="mt-2 text-xs font-bold text-[#7c2d12] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          ¡Lista para cursar!
        </div>
        {impacto > 0 && (
          <div
            className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              esTopPrioridad
                ? 'bg-amber-100 text-amber-950 border border-amber-500'
                : 'bg-[#f4efe6] text-[#44403c] border border-[#d6cebf]'
            }`}
          >
            <span>Desbloquea {impacto} materia{impacto === 1 ? '' : 's'}{esTopPrioridad ? ' · Prioridad' : ''}</span>
          </div>
        )}
        {atraso.cantidad > impacto && (
          <div className="mt-1 text-[11px] text-[#57534e]">
            (en cascada: {atraso.cantidad} materias{atraso.horas ? `, ${atraso.horas} hs/sem` : ''} si se atrasa)
          </div>
        )}
      </>
    )
  } else {
    cardBorder = 'border-[#d6cebf] bg-[#fbf9f4] opacity-90'
    statusBadge = (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f5f5f4] text-[#292524] border border-[#78716c]">
        No Cursada
      </span>
    )
    actionBadge = (
      <>
        <div className="mt-2 text-xs font-semibold text-rose-800 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-rose-700" />
          Correlatividades bloqueadas
        </div>
        {atraso.cantidad > 0 && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#f4efe6] text-[#57534e] border border-[#d6cebf]">
            <span>Atrasa {atraso.cantidad} materia{atraso.cantidad === 1 ? '' : 's'}{atraso.horas ? ` (${atraso.horas} hs/sem)` : ''}</span>
          </div>
        )}
      </>
    )
  }

  const oportunidadHtml = estado !== 'PROMOCIONADA' && (
    <p className="text-[11px] text-[#57534e] mt-1.5 flex items-center gap-1.5 font-medium">
      <Calendar className="w-3 h-3 text-[#78716c]" /> {oportunidad.texto}
    </p>
  )

  return (
    <div className={`notebook-card rounded-xl p-4 border-2 ${cardBorder} flex flex-col justify-between bg-white`}>
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
            {materia.codigo}
          </span>
          {statusBadge}
        </div>
        <h3 className="text-sm font-bold text-[#1a1916] mb-1 leading-snug">{materia.nombre}</h3>
        <p className="text-xs text-[#57534e] flex items-center gap-2 flex-wrap font-medium">
          {materia.anio && <span>Año {materia.anio}</span>}
          <span>• {materia.cuatrimestre ? `${materia.cuatrimestre}° Cuatrimestre` : 'Anual'}</span>
          {materia.horas_semanales && <span>• {materia.horas_semanales} hs/sem</span>}
        </p>
        {oportunidadHtml}
        {actionBadge}
      </div>

      {reqs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#e2dcce] space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[#78716c] block tracking-wider">
            Requisitos exigidos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {reqs.map(p => (
              <ReqChip key={p.id} p={p} estadosMap={estadosMap} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

function ReqChip({ p, estadosMap }) {
  const reqEstado = estadosMap[p.materia_requerida_id] || 'NO_CURSADA'
  const isOk =
    (p.tipo === 'REGULARIZADA' && (reqEstado === 'REGULAR' || reqEstado === 'PROMOCIONADA')) ||
    (p.tipo === 'APROBADA' && reqEstado === 'PROMOCIONADA')

  const chipColor = isOk
    ? 'bg-[#dcfce7] text-[#14532d] border-emerald-600'
    : 'bg-[#fee2e2] text-[#7f1d1d] border-rose-600'

  const Icon = isOk ? Check : X
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${chipColor}`}
      title={`${p.tipo}: ${reqEstado}`}
    >
      <Icon className="w-3 h-3 stroke-[2.5]" />
      <span>{p.materia_requerida ? p.materia_requerida.nombre : 'Materia'}</span>
      <span className="text-[9px] font-mono uppercase px-1 py-0.5 bg-black/10 rounded font-bold">
        {p.tipo === 'REGULARIZADA' ? 'REG' : 'APR'}
      </span>
    </span>
  )
}
