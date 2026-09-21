import { useState, useMemo, useEffect } from 'react'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Flame,
  Lock,
  Sparkles
} from 'lucide-react'
import TitoAvatar from '../components/TitoAvatar'
import {
  checkCursadaRequirements,
  computeImpacto,
  computeImpactoCascada,
  proximaOportunidad,
  esElectiva,
  checkExcepcionMachete,
  computeCondicionalidadCandidatos
} from '../lib/businessLogic'

const ROTATING_HEADLINES = [
  '¿Qué carajo metemos este cuatri?',
  'Llegó la hora de mover fichas.',
  'Al que madruga, Dios le aprueba los TPs.',
  'Modo combate de cursada: activado.',
  'A destrabar correlativas se ha dicho.',
]

export default function HoySurface({
  ctx,
  onNavigateToCarrera,
  onNavigateToCamino,
  onNavigateToAgenda,
  onActualizarEstado,
  cargarEventos,
}) {
  // Titular rotativo por sesión para evitar repetición idéntica diaria
  const [headline] = useState(() => {
    try {
      const saved = sessionStorage.getItem('qpc_headline_idx')
      if (saved !== null) {
        const next = (parseInt(saved, 10) + 1) % ROTATING_HEADLINES.length
        sessionStorage.setItem('qpc_headline_idx', String(next))
        return ROTATING_HEADLINES[next]
      }
      sessionStorage.setItem('qpc_headline_idx', '0')
      return ROTATING_HEADLINES[0]
    } catch (_) {
      return ROTATING_HEADLINES[0]
    }
  })

  // Eventos de hoy y mañana
  const [eventosProximos, setEventosProximos] = useState([])
  const [eventosLoading, setEventosLoading] = useState(false)

  useEffect(() => {
    let active = true
    const hoy = new Date()
    const pasadoManana = new Date(hoy)
    pasadoManana.setDate(pasadoManana.getDate() + 2)
    const desde = hoy.toISOString().split('T')[0]
    const hasta = pasadoManana.toISOString().split('T')[0]

    setEventosLoading(true)
    cargarEventos(desde, hasta)
      .then(evs => {
        if (active) setEventosProximos(evs || [])
      })
      .catch(() => {
        if (active) setEventosProximos([])
      })
      .finally(() => {
        if (active) setEventosLoading(false)
      })

    return () => { active = false }
  }, [cargarEventos])

  // Métricas de avance sobre materias obligatorias (excluyendo electivas "E-")
  const obligatorias = useMemo(() => {
    return ctx.materias.filter(m => !esElectiva(m))
  }, [ctx.materias])

  const totalObligatorias = obligatorias.length || 1

  const metricas = useMemo(() => {
    let aprobadas = 0
    let regulares = 0
    let cursando = 0
    let horasAprobadas = 0
    let horasTotal = 0

    for (const m of obligatorias) {
      const st = ctx.estadosMap[m.id] || 'NO_CURSADA'
      const hs = m.horas_semanales || 0
      horasTotal += hs
      if (st === 'PROMOCIONADA') {
        aprobadas++
        horasAprobadas += hs
      } else if (st === 'REGULAR') {
        regulares++
      } else if (st === 'CURSANDO') {
        cursando++
      }
    }

    const bloqueadas = totalObligatorias - aprobadas - regulares - cursando
    const porcentaje = Math.round((aprobadas / totalObligatorias) * 100)

    return {
      aprobadas,
      regulares,
      cursando,
      bloqueadas: Math.max(0, bloqueadas),
      horasAprobadas,
      horasTotal,
      porcentaje,
    }
  }, [obligatorias, ctx.estadosMap, totalObligatorias])

  // 1. "Podés cursar ya": materias no cursadas con correlativas cumplidas, ordenadas por impacto cascada
  const [verMasListas, setVerMasListas] = useState(false)
  const materiasListas = useMemo(() => {
    return ctx.materias
      .filter(m => {
        const st = ctx.estadosMap[m.id] || 'NO_CURSADA'
        return st === 'NO_CURSADA' && checkCursadaRequirements(m.id, ctx).puede
      })
      .map(m => {
        const cascada = computeImpactoCascada(m.id, ctx)
        const impactoDirecto = computeImpacto(m.id, ctx)
        const oportunidad = proximaOportunidad(m, ctx)
        const prereqs = ctx.prereqsByMateria[m.id] || []
        const regPrereqs = prereqs
          .filter(p => p.tipo === 'REGULARIZADA')
          .map(p => p.materia_requerida?.nombre || ctx.materiasById?.get(p.materia_requerida_id)?.nombre || `Materia #${p.materia_requerida_id}`)
        const aprPrereqs = prereqs
          .filter(p => p.tipo === 'APROBADA')
          .map(p => p.materia_requerida?.nombre || ctx.materiasById?.get(p.materia_requerida_id)?.nombre || `Materia #${p.materia_requerida_id}`)

        return {
          ...m,
          cascada,
          impactoDirecto,
          oportunidad,
          regPrereqs,
          aprPrereqs,
        }
      })
      .sort((a, b) => (b.cascada.cantidad || 0) - (a.cascada.cantidad || 0))
  }, [ctx])

  const listasVisibles = verMasListas ? materiasListas : materiasListas.slice(0, 4)

  // 2. "Finales pendientes": materias en estado REGULAR
  const finalesPendientes = useMemo(() => {
    return ctx.materias.filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') === 'REGULAR')
  }, [ctx.materias, ctx.estadosMap])

  // 3. "En curso": materias en estado CURSANDO
  const enCurso = useMemo(() => {
    return ctx.materias.filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') === 'CURSANDO')
  }, [ctx.materias, ctx.estadosMap])

  // 4. Machete de excepciones y cursado condicional
  const machete = useMemo(() => checkExcepcionMachete(ctx), [ctx])
  const condicionales = useMemo(() => computeCondicionalidadCandidatos(ctx), [ctx])
  const tieneAtajos = machete.elegible || condicionales.length > 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── HEADER / HERO CON TITO Y TITULAR ROTATIVO ───────────────────────── */}
      <section className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-5 relative">
        <div className="absolute -top-3.5 left-4 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111] rotate-[-1deg]">
          {ctx.configApp.anio_actual
            ? `Ciclo ${ctx.configApp.anio_actual} • ${ctx.configApp.cuatrimestre_actual ? `${ctx.configApp.cuatrimestre_actual}º Cuatrimestre` : 'Período Activo'}`
            : 'Período de Cursada Activo'}
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-2">
          {/* Tito Avatar WebP */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#ccff00] border-3 border-[#111111] shadow-[3px_3px_0px_#111111] flex-shrink-0 flex items-center justify-center p-0.5">
            <TitoAvatar
              variant={finalesPendientes.length > 0 ? 'urgente' : (materiasListas.length === 0 ? 'mate' : 'cafe')}
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="font-display text-lg sm:text-2xl font-bold uppercase text-[#111111] leading-tight break-words">
              {headline}
            </h1>
            <p className="text-xs sm:text-sm font-mono text-[#27272a] mt-1.5 leading-relaxed">
              {materiasListas.length > 0 ? (
                <>
                  Tenés <strong>{materiasListas.length} materias listas</strong> para cursar ya con correlativas al día.
                </>
              ) : (
                <>No tenés materias habilitadas ahora mismo. Buen momento para meter finales pendientes.</>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── REGLA DE AVANCE Y SELLOS (EXCLUSIVO DE HOY) ────────────────────── */}
      <section className="bg-[#111111] text-white border-3 border-[#111111] shadow-[5px_5px_0px_#ccff00] p-4 sm:p-5">
        <div className="flex justify-between items-baseline mb-2">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#ccff00]">
            Balance de Cursada
          </span>
          <span className="font-mono text-xs text-[#d4d4d8]">
            {metricas.aprobadas} de {totalObligatorias} obligatorias
          </span>
        </div>

        {/* Escala colosal de porcentaje */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 my-2">
          <div className="font-display text-5xl sm:text-6xl font-bold text-[#ff1464] leading-none">
            {metricas.porcentaje}%
          </div>
          <div className="text-xs font-mono text-[#a1a1aa] leading-snug">
            <div><strong>{metricas.horasAprobadas} de {metricas.horasTotal} hs/sem</strong> acumuladas del plan</div>
            <div>{metricas.horasTotal > 0 ? `${metricas.horasTotal - metricas.horasAprobadas} hs/sem restantes de cursada` : ''}</div>
          </div>
        </div>

        {/* Barra estilo regla métrica graduada */}
        <div className="w-full h-3 bg-[#27272a] border-2 border-white overflow-hidden my-3 relative">
          <div
            className="h-full bg-[#ccff00] transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, metricas.porcentaje))}%` }}
          />
        </div>

        {/* Sellos de estado resumen */}
        <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold uppercase select-none">
          <span className="px-2 py-1 bg-[#ccff00] text-[#111111] border border-[#111111]">
            ✓ {metricas.aprobadas} Aprobadas
          </span>
          <span className="px-2 py-1 bg-white text-[#111111] border border-[#111111]">
            ✎ {metricas.regulares} Finales
          </span>
          <span className="px-2 py-1 bg-[#0047ff] text-white border border-[#111111]">
            ⚡ {metricas.cursando} Cursando
          </span>
          <span className="px-2 py-1 bg-[#27272a] text-[#a1a1aa] border border-[#52525b] flex items-center gap-1">
            <Lock className="w-3 h-3" aria-hidden="true" />
            <span>{metricas.bloqueadas} Bloqueadas</span>
          </span>
        </div>
      </section>

      {/* ── CUADRO 1: PODÉS CURSAR YA (ORDENADO POR CASCADA) ────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-[#111111] text-white px-2 py-0.5 text-xs font-mono font-bold uppercase rotate-[-1deg]">
              Listas ({materiasListas.length})
            </span>
            <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
              Podés cursar ya
            </h2>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase text-[#52525b] hidden sm:inline">
            Orden: impacto en cascada
          </span>
        </div>

        {materiasListas.length === 0 ? (
          <div className="bg-white border-2 border-[#111111] p-6 text-center shadow-fanzine-sm">
            <TitoAvatar variant="mate" className="w-14 h-14 mx-auto mb-2" />
            <p className="font-display text-sm font-bold uppercase text-[#111111]">No hay materias listas por ahora</p>
            <p className="text-xs font-mono text-[#52525b] mt-1">
              Rendí los finales pendientes o regularizá las cursadas activas para desbloquear el siguiente nivel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {listasVisibles.map(m => {
              const atrasa = m.cascada.totalMateriasAtrasadas
              return (
                <div
                  key={m.id}
                  className="bg-white border-2 border-[#111111] shadow-fanzine p-3.5 flex flex-col justify-between relative group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-fanzine-sm transition-all"
                >
                  <div>
                    {atrasa > 0 && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#ff1464] text-[#111111] px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#111111]">
                        <Flame className="w-3 h-3" aria-hidden="true" />
                        <span>Atrasa {atrasa}</span>
                      </div>
                    )}
                    <div className="text-[10px] font-mono font-bold text-[#52525b]">
                      {m.codigo} • {m.anio}º AÑO • {m.horas_semanales || 4} HS/SEM
                    </div>
                    <h3 className="text-sm font-bold text-[#111111] mt-0.5 pr-20 leading-tight">
                      {m.nombre}
                    </h3>

                    {/* Indicadores clave de impacto y dictado */}
                    <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-[#e4e4e7] text-[10px] font-mono">
                      <div className="bg-[#f4f0e6] p-1.5 border border-[#111111]">
                        <span className="text-[#71717a] block font-bold uppercase text-[9px]">Desbloquea</span>
                        <span className="font-bold text-[#111111] leading-tight block">
                          {m.impactoDirecto} {m.impactoDirecto === 1 ? 'materia' : 'materias'}
                          {m.cascada.cantidad > m.impactoDirecto ? ` (${m.cascada.cantidad} en cadena)` : ''}
                        </span>
                      </div>
                      <div className="bg-[#f4f0e6] p-1.5 border border-[#111111]">
                        <span className="text-[#71717a] block font-bold uppercase text-[9px]">Oportunidad</span>
                        <span className="font-bold text-[#111111] truncate block leading-tight" title={m.oportunidad.texto}>
                          {m.oportunidad.ahora ? '★ Se dicta ahora' : m.oportunidad.texto}
                        </span>
                      </div>
                    </div>

                    {/* Requisitos previos cumplidos */}
                    <div className="text-[10px] font-mono text-[#52525b] mt-2 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a] shrink-0 mt-0.5" aria-hidden="true" />
                      <div className="leading-tight">
                        {m.regPrereqs.length === 0 && m.aprPrereqs.length === 0 ? (
                          <span className="text-[#15803d] font-bold">Sin correlativas previas (ingreso directo)</span>
                        ) : (
                          <span>
                            {m.regPrereqs.length > 0 && <span className="mr-2"><strong>REG:</strong> {m.regPrereqs.join(', ')}</span>}
                            {m.aprPrereqs.length > 0 && <span><strong>APR:</strong> {m.aprPrereqs.join(', ')}</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#111111] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => onActualizarEstado(m.id, 'CURSANDO')}
                      className="px-3 py-1.5 bg-[#ccff00] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      Empezar a cursar
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToCarrera(m.id)}
                      className="text-xs font-mono font-bold text-[#111111] hover:text-[#ff1464] underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver ficha</span>
                      <ArrowRight className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {materiasListas.length > 3 && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setVerMasListas(prev => !prev)}
              className="text-xs font-mono font-bold uppercase text-[#111111] hover:bg-[#fff9db] px-3 py-1.5 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer"
            >
              {verMasListas ? 'Mostrar menos' : `Ver las ${materiasListas.length} listas`}
            </button>
          </div>
        )}
      </section>

      {/* ── CUADRO 2: FINALES PENDIENTES & EN CURSO ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Finales Pendientes */}
        <section className="bg-white border-2 border-[#111111] shadow-fanzine p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#111111]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#fef08a] border border-[#111111]" aria-hidden="true" />
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                Finales Pendientes ({finalesPendientes.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#52525b]">Regularizadas</span>
          </div>

          {finalesPendientes.length === 0 ? (
            <p className="text-xs font-mono text-[#52525b] py-3">No tenés finales pendientes. ¡Al día!</p>
          ) : (
            <ul className="space-y-2.5">
              {finalesPendientes.map(m => (
                <li
                  key={m.id}
                  className="flex items-center justify-between p-2 bg-[#f4f0e6] border border-[#111111] gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-[#52525b]">{m.codigo}</div>
                    <div className="text-xs font-bold text-[#111111] truncate">{m.nombre}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onActualizarEstado(m.id, 'PROMOCIONADA')}
                    className="px-2 py-1 bg-white text-[#111111] border border-[#111111] text-[11px] font-mono font-bold uppercase hover:bg-[#ccff00] flex-shrink-0 cursor-pointer"
                  >
                    Aprobé final
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* En Curso */}
        <section className="bg-white border-2 border-[#111111] shadow-fanzine p-4">
          <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#111111]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-[#0047ff] border border-[#111111]" aria-hidden="true" />
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                En Curso ({enCurso.length})
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#52525b]">Cursando hoy</span>
          </div>

          {enCurso.length === 0 ? (
            <p className="text-xs font-mono text-[#52525b] py-3">No estás cursando ninguna materia actualmente.</p>
          ) : (
            <ul className="space-y-2.5">
              {enCurso.map(m => (
                <li
                  key={m.id}
                  className="flex items-center justify-between p-2 bg-[#f4f0e6] border border-[#111111] gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono font-bold text-[#52525b]">{m.codigo}</div>
                    <div className="text-xs font-bold text-[#111111] truncate">{m.nombre}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onActualizarEstado(m.id, 'REGULAR')}
                    className="px-2 py-1 bg-white text-[#111111] border border-[#111111] text-[11px] font-mono font-bold uppercase hover:bg-[#ccff00] flex-shrink-0 cursor-pointer"
                  >
                    Regularicé
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* ── CUADRO 3: AGENDA INMEDIATA (HOY Y MAÑANA) ───────────────────────── */}
      <section className="bg-white border-2 border-[#111111] shadow-fanzine p-4">
        <div className="flex items-center justify-between pb-2 mb-3 border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
              Agenda Próximas 48hs
            </h3>
          </div>
          <button
            type="button"
            onClick={onNavigateToAgenda}
            className="text-xs font-mono font-bold text-[#111111] hover:text-[#ff1464] underline underline-offset-2 cursor-pointer"
          >
            Ver agenda completa →
          </button>
        </div>

        {eventosLoading ? (
          <div className="text-xs font-mono text-[#52525b] py-3 text-center">Cargando compromisos próximos...</div>
        ) : eventosProximos.length === 0 ? (
          <div className="text-xs font-mono text-[#52525b] py-3 text-center">
            No hay exámenes ni entregas registradas para hoy y mañana.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {eventosProximos.map(ev => (
              <div key={ev.id} className="p-2.5 bg-[#f4f0e6] border-2 border-[#111111] text-xs">
                <div className="flex justify-between font-mono text-[10px] font-bold uppercase text-[#ff1464]">
                  <span>{ev.fecha}</span>
                  <span>{ev.hora_inicio || ''}</span>
                </div>
                <div className="font-bold text-[#111111] mt-0.5">{ev.titulo}</div>
                {ev.descripcion && (
                  <div className="text-[#52525b] text-[11px] mt-1 line-clamp-2">{ev.descripcion}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CALLOUT DISCRETO DE ATAJOS Y EXCEPCIONES ────────────────────────── */}
      {tieneAtajos && (
        <section className="bg-[#ccff00] border-3 border-[#111111] shadow-fanzine-md p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center sm:text-left">
            <Sparkles className="w-5 h-5 text-[#111111] flex-shrink-0" aria-hidden="true" />
            <div className="text-xs font-mono text-[#111111]">
              <strong>Tenés atajos y excepciones académicas disponibles:</strong> podés solicitar cursado condicional o excepción de correlatividades.
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToCamino}
            className="px-3 py-1.5 bg-[#111111] text-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase hover:bg-white hover:text-[#111111] flex-shrink-0 cursor-pointer transition-colors"
          >
            Revisar en Camino →
          </button>
        </section>
      )}
    </div>
  )
}
