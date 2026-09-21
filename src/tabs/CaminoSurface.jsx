import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react'
import TitoAvatar from '../components/TitoAvatar'
import {
  checkExcepcionMachete,
  computeCaminoCompleto,
  computeCreditosElectivas,
  computeCondicionalidadCandidatos,
  computePrediccionCursando
} from '../lib/businessLogic'

export default function CaminoSurface({ ctx, onNavigateToCarrera }) {
  const [expandirTodos, setExpandirTodos] = useState(false)
  const [pasosAbiertos, setPasosAbiertos] = useState({ 0: true })
  const [errorSimulado, setErrorSimulado] = useState(null)

  // 1. Cálculos de negocio puros derivados del contexto real
  const camino = useMemo(() => {
    try {
      if (errorSimulado) throw new Error('Error al computar el camino óptimo')
      return computeCaminoCompleto(ctx)
    } catch (err) {
      return { error: err.message, pasos: [], materiasRestantes: 0 }
    }
  }, [ctx, errorSimulado])

  const prediccion = useMemo(() => computePrediccionCursando(ctx), [ctx])
  const machete = useMemo(() => checkExcepcionMachete(ctx), [ctx])
  const condicionales = useMemo(() => computeCondicionalidadCandidatos(ctx), [ctx])
  const basicasCompartidas = useMemo(
    () => ctx.materias.filter(m => m.es_basica_compartida),
    [ctx.materias]
  )
  const electivasPool = useMemo(() => computeCreditosElectivas(ctx), [ctx])

  function togglePaso(idx) {
    setPasosAbiertos(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }))
  }

  // Estado de Error
  if (camino.error) {
    return (
      <div className="bg-[#fffdf5] border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-[#ff1464] border-2 border-[#111111] shadow-fanzine-sm flex items-center justify-center p-2">
          <TitoAvatar variant="urgente" className="w-16 h-16" />
        </div>
        <div className="inline-block bg-[#ff1464] text-[#111111] font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#111111] mb-2">
          ERROR DE CÁLCULO
        </div>
        <h3 className="font-display text-base sm:text-lg font-bold uppercase text-[#111111]">
          No pudimos calcular el itinerario
        </h3>
        <p className="font-mono text-xs text-[#52525b] mt-1.5 mb-6 leading-relaxed">
          {camino.error}. Verificá las correlatividades o recargá la aplicación.
        </p>
        <button
          type="button"
          onClick={() => setErrorSimulado(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>Reintentar cálculo</span>
        </button>
      </div>
    )
  }

  // Estado Vacío 1: Sin carrera o sin materias
  if (!ctx.carreraActual || ctx.materias.length === 0) {
    return (
      <div className="bg-[#f4f0e6] border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-20 h-20 mx-auto mb-4 bg-white border-2 border-[#111111] shadow-fanzine-sm flex items-center justify-center p-2">
          <TitoAvatar variant="mate" className="w-16 h-16" />
        </div>
        <div className="inline-block bg-white text-[#111111] font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#111111] mb-2">
          SIN MATERIAS
        </div>
        <h3 className="font-display text-base sm:text-lg font-bold uppercase text-[#111111]">
          No hay materias cargadas
        </h3>
        <p className="font-mono text-xs text-[#52525b] mt-1.5 mb-4 leading-relaxed">
          Elegí o configurá una carrera en el panel superior para generar la hoja de ruta y la predicción de desbloqueos.
        </p>
      </div>
    )
  }

  // Estado Vacío 2: Todas las materias aprobadas (carrera finalizada)
  if (camino.pasos.length === 0 && camino.materiasRestantes === 0) {
    return (
      <div className="bg-[#ccff00] border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-10 text-center max-w-xl mx-auto my-8">
        <div className="w-24 h-24 mx-auto mb-4 bg-white border-2 border-[#111111] shadow-fanzine-sm flex items-center justify-center p-2">
          <TitoAvatar variant="festejo" className="w-20 h-20" />
        </div>
        <div className="inline-block bg-[#111111] text-[#ccff00] font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#111111] mb-2">
          ¡PLAN COMPLETADO!
        </div>
        <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-[#111111]">
          ¡Felicitaciones, completaste el plan!
        </h3>
        <p className="font-mono text-xs text-[#111111] mt-2 leading-relaxed max-w-md mx-auto">
          No te quedan materias obligatorias pendientes por cursar en {ctx.carreraActual.nombre}. Ya podés festejar y tramitar el título.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── BANNER PRINCIPAL CON RESUMEN DE CAMINO ── */}
      <div className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="bg-[#111111] text-[#ccff00] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111]">
              ITINERARIO & ESTRATEGIA
            </span>
            <span className="bg-[#eff6ff] text-[#0047ff] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111]">
              {ctx.carreraActual.nombre}
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase text-[#111111] tracking-tight">
            Camino Óptimo de Cursada
          </h2>
          <p className="font-mono text-xs text-[#52525b] mt-1 max-w-2xl leading-relaxed">
            Secuencia cuatrimestre a cuatrimestre calculada por impacto en cascada, predicción de desbloqueos y excepciones reglamentarias.
          </p>
        </div>

        {/* Mini stats fanzine */}
        <div className="flex items-center gap-3 self-start md:self-center">
          <div className="p-2.5 bg-[#f4f0e6] border-2 border-[#111111] shadow-fanzine-sm text-center min-w-[80px]">
            <div className="font-mono text-[10px] font-bold text-[#52525b] uppercase">Cuatris</div>
            <div className="font-display text-base sm:text-lg font-bold text-[#111111]">
              {camino.pasos.length}
            </div>
          </div>
          <div className="p-2.5 bg-[#f4f0e6] border-2 border-[#111111] shadow-fanzine-sm text-center min-w-[80px]">
            <div className="font-mono text-[10px] font-bold text-[#52525b] uppercase">Restan</div>
            <div className="font-display text-base sm:text-lg font-bold text-[#111111]">
              {camino.materiasRestantes}
            </div>
          </div>
          <div className="w-14 h-14 bg-[#ccff00] border-2 border-[#111111] shadow-fanzine-sm p-1 hidden sm:flex items-center justify-center flex-shrink-0">
            <TitoAvatar variant="lupa" className="w-12 h-12" />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 1: PREDICCIÓN DE DESBLOQUEOS (SI APRUEBO LO QUE CURSO) ── */}
      <section className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 border-l-6 border-l-[#0047ff] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#111111]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#eff6ff] border border-[#111111] flex items-center justify-center text-[#0047ff]">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                Predicción de Desbloqueos
              </h3>
              <p className="font-mono text-[11px] text-[#52525b]">
                ¿Qué materias se habilitan si aprobás lo que estás cursando ahora?
              </p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-bold uppercase px-2 py-0.5 bg-[#eff6ff] text-[#0047ff] border border-[#111111] self-start sm:self-auto">
            {prediccion.cursando.length} {prediccion.cursando.length === 1 ? 'materia en curso' : 'materias en curso'}
          </span>
        </div>

        {prediccion.cursando.length === 0 ? (
          <div className="p-4 bg-[#f9f6ee] border-2 border-dashed border-[#111111] flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <TitoAvatar variant="cafe" className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-mono text-xs font-bold text-[#111111]">
                No tenés materias marcadas en estado "Cursando".
              </p>
              <p className="font-mono text-[11px] text-[#52525b] mt-0.5">
                Marcá materias como "Cursando" desde la pestaña Mi Carrera para simular qué se desbloquearía el próximo cuatrimestre.
              </p>
            </div>
            {onNavigateToCarrera && (
              <button
                type="button"
                onClick={() => onNavigateToCarrera()}
                className="px-3 py-1.5 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[11px] font-bold uppercase hover:bg-[#ccff00] cursor-pointer whitespace-nowrap min-h-[36px]"
              >
                Ir a Mi Carrera →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Lista de lo que está cursando */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] font-bold text-[#52525b] uppercase">Cursando:</span>
              {prediccion.cursando.map(m => (
                <span
                  key={m.id}
                  className="font-mono text-[11px] font-bold px-2 py-0.5 bg-[#f4f0e6] text-[#111111] border border-[#111111]"
                >
                  [{m.codigo}] {m.nombre}
                </span>
              ))}
            </div>

            {/* Dos columnas: desbloqueadas vs acercadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Desbloqueadas al 100% */}
              <div className="bg-[#f0fdf4] border-2 border-[#111111] p-3 shadow-fanzine-sm space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#166534] uppercase pb-1 border-b border-[#111111]">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Quedan 100% habilitadas ({prediccion.desbloqueadas.length})</span>
                </div>
                {prediccion.desbloqueadas.length === 0 ? (
                  <p className="font-mono text-[11px] text-[#52525b] italic py-2">
                    Ninguna materia adicional se desbloquea al 100% con sólo estas cursadas.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {prediccion.desbloqueadas.map(m => (
                      <div
                        key={m.id}
                        className="p-2 bg-white border border-[#111111] flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="font-mono text-[10px] font-bold text-[#52525b] block">
                            [{m.codigo}] • {m.anio ? `${m.anio}º Año` : 'Nivel libre'}
                          </span>
                          <span className="text-xs font-bold text-[#111111] truncate block">
                            {m.nombre}
                          </span>
                        </div>
                        {onNavigateToCarrera && (
                          <button
                            type="button"
                            onClick={() => onNavigateToCarrera(m.id)}
                            title="Ver en Mi Carrera"
                            className="p-1 hover:bg-[#f4f0e6] text-[#111111] cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Se acercan (reducen correlativas pendientes) */}
              <div className="bg-[#eff6ff] border-2 border-[#111111] p-3 shadow-fanzine-sm space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#1e40af] uppercase pb-1 border-b border-[#111111]">
                  <Zap className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Se acercan (reducen requisitos) ({prediccion.acercadas.length})</span>
                </div>
                {prediccion.acercadas.length === 0 ? (
                  <p className="font-mono text-[11px] text-[#52525b] italic py-2">
                    No hay materias que reduzcan parcialmente sus correlativas.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {prediccion.acercadas.map(({ materia, faltan }) => (
                      <div
                        key={materia.id}
                        className="p-2 bg-white border border-[#111111] space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-bold text-[#52525b]">
                            [{materia.codigo}] • {materia.anio ? `${materia.anio}º Año` : ''}
                          </span>
                          <span className="font-mono text-[9px] font-bold text-[#1e40af] bg-[#dbeafe] px-1 border border-[#1e40af]">
                            Faltan {faltan.length}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-[#111111] truncate">{materia.nombre}</div>
                        <div className="font-mono text-[10px] text-[#52525b] truncate">
                          Resta: {faltan.map(p => `${p.materia} (${p.exige})`).join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── SECCIÓN 2: LÍNEA DE TIEMPO DEL ITINERARIO POR CUATRIMESTRE ── */}
      <section className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
          <div>
            <div className="inline-block bg-[#ccff00] text-[#111111] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111] mb-1">
              PASO A PASO
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
              Línea de Tiempo del Itinerario
            </h3>
            <p className="font-mono text-[11px] text-[#52525b]">
              Ordenado secuencialmente período a período priorizando materias con mayor impacto en cascada.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                const next = !expandirTodos
                setExpandirTodos(next)
                if (next) {
                  const all = {}
                  camino.pasos.forEach((_, i) => { all[i] = true })
                  setPasosAbiertos(all)
                } else {
                  setPasosAbiertos({ 0: true })
                }
              }}
              className="px-2.5 py-1 bg-[#f4f0e6] hover:bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[11px] font-bold uppercase cursor-pointer min-h-[36px]"
            >
              {expandirTodos ? 'Plegar lista' : 'Expandir todos'}
            </button>
            <span className="font-mono text-[11px] font-bold uppercase px-2 py-1 bg-[#111111] text-[#ccff00] border border-[#111111]">
              {camino.pasos.length} períodos
            </span>
          </div>
        </div>

        {/* Línea de tiempo vertical fanzine */}
        <div className="space-y-4 relative pl-4 sm:pl-6 border-l-3 border-[#111111] ml-2 sm:ml-3">
          {camino.pasos.map((paso, idx) => {
            const abierto = Boolean(expandirTodos || pasosAbiertos[idx])
            const totalHs = paso.materias.reduce((s, c) => s + (c.materia.horas_semanales || 0), 0)
            const cuatriLabel = paso.periodo.cuatrimestre
              ? `${paso.periodo.cuatrimestre}° Cuatrimestre ${paso.periodo.anio}`
              : `Ciclo Anual ${paso.periodo.anio}`
            const esPrimero = idx === 0

            return (
              <div key={idx} className="relative">
                {/* Marcador en la línea de tiempo */}
                <span
                  className={`absolute -left-[23px] sm:-left-[31px] top-3.5 w-3.5 h-3.5 border-2 border-[#111111] ${
                    esPrimero ? 'bg-[#ff1464]' : 'bg-[#ccff00]'
                  }`}
                  aria-hidden="true"
                />

                <div className="bg-[#fbf9f4] border-2 border-[#111111] shadow-fanzine-sm overflow-hidden">
                  {/* Cabecera del paso */}
                  <button
                    type="button"
                    aria-expanded={abierto}
                    onClick={() => togglePaso(idx)}
                    className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-2 text-left bg-[#f4efe4] hover:bg-[#ece5d5] border-b-2 border-[#111111] cursor-pointer select-none"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#111111] text-white">
                        Paso {idx + 1}
                      </span>
                      <span className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                        {cuatriLabel} {esPrimero && '(Período Actual)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#52525b] hidden sm:inline">
                        {paso.materias.length} {paso.materias.length === 1 ? 'materia' : 'materias'} • {totalHs} hs/sem
                      </span>
                      <span className="p-1 border border-[#111111] bg-white text-[#111111]">
                        {abierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </div>
                  </button>

                  {/* Detalle de materias del período */}
                  {abierto && (
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {paso.materias.map(({ materia, atraso }) => (
                          <div
                            key={materia.id}
                            className="bg-white border-2 border-[#111111] p-3 flex flex-col justify-between gap-2 shadow-[2px_2px_0px_#111111]"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-mono text-xs font-bold px-1.5 py-0.2 bg-[#111111] text-[#ccff00]">
                                  {materia.codigo}
                                </span>
                                <span className="font-mono text-[10px] text-[#52525b] font-bold">
                                  {materia.horas_semanales || 4} hs/sem
                                </span>
                              </div>
                              <h4 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">
                                {materia.nombre}
                              </h4>
                            </div>

                            <div className="pt-2 border-t border-[#e4e4e7] flex items-center justify-between gap-1">
                              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#111111] bg-[#ff1464]/15 px-1.5 py-0.5 border border-[#ff1464]">
                                <Flame className="w-3 h-3 text-[#ff1464]" aria-hidden="true" />
                                <span>Atrasa {atraso.cantidad} {atraso.cantidad === 1 ? 'materia' : 'materias'}</span>
                              </span>
                              {onNavigateToCarrera && (
                                <button
                                  type="button"
                                  onClick={() => onNavigateToCarrera(materia.id)}
                                  className="text-[11px] font-mono font-bold text-[#0047ff] hover:underline cursor-pointer"
                                >
                                  Ver ficha
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Materias disponibles por excepción en este período */}
                      {paso.porExcepcion && paso.porExcepcion.length > 0 && (
                        <div className="p-3 bg-[#fffbeb] border-2 border-dashed border-[#b45309] space-y-1.5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#b45309] uppercase">
                            <Lightbulb className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Oportunidades por Cursado Condicional en este período</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {paso.porExcepcion.map(c => (
                              <span
                                key={c.materia.id}
                                className="font-mono text-[11px] bg-white text-[#111111] px-2 py-0.5 border border-[#111111]"
                              >
                                <strong>[{c.materia.codigo}] {c.materia.nombre}</strong> (falta {c.correlativa?.nombre || 'correlativa'})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Oportunidades finales si el camino se traba antes de agotar el plan */}
        {camino.oportunidadesFinales && camino.oportunidadesFinales.length > 0 && (
          <div className="p-4 bg-[#eff6ff] border-2 border-[#0047ff] space-y-2 mt-4">
            <h4 className="font-display text-xs font-bold uppercase text-[#0047ff]">
              Materias dependientes de excepción para culminar el plan
            </h4>
            <p className="font-mono text-xs text-[#52525b]">
              Estas asignaturas requieren cursado condicional para no extender cuatrimestres adicionales:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {camino.oportunidadesFinales.map(c => (
                <span
                  key={c.materia.id}
                  className="font-mono text-xs px-2 py-1 bg-white border border-[#111111] text-[#111111]"
                >
                  [{c.materia.codigo}] {c.materia.nombre} — Falta: {c.correlativa?.nombre || 'correlativa'}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── SECCIÓN 3: ATAJOS Y EXCEPCIONES (3 BLOQUES DISTINTOS) ── */}
      <section className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 space-y-4">
        <div className="pb-3 border-b-2 border-[#111111]">
          <div className="inline-block bg-[#ff1464] text-[#111111] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111] mb-1">
            REGLAMENTO Y ATAJOS
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
            Atajos y Excepciones Académicas
          </h3>
          <p className="font-mono text-[11px] text-[#52525b]">
            Tres vías reglamentarias para acelerar o flexibilizar tu cursada sin trabarte por correlatividades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bloque 1: Excepción de correlatividades / Adelanto de Nivel */}
          <div className="bg-[#f9f6ee] border-2 border-[#111111] p-4 shadow-fanzine-sm flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#111111] text-[#ff1464]">
                  Bloque 1
                </span>
                <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase">
                  Adelanto Nivel
                </span>
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                Excepción Último Año ({machete.anioMax || 5}º)
              </h4>
              <p className="font-mono text-[11px] text-[#52525b] leading-relaxed">
                Permite cursar materias del último nivel si adeudás menos del umbral de horas de años inferiores.
              </p>
            </div>

            <div className="pt-3 border-t border-[#111111] space-y-2">
              <div className="font-mono text-xs text-[#111111]">
                {machete.umbral == null ? (
                  <span className="text-[#71717a] italic">No aplica umbral para esta carrera.</span>
                ) : machete.elegible ? (
                  <div className="p-2 bg-[#ccff00] border border-[#111111] font-bold">
                    ✓ ¡Elegible! Faltan {machete.horasFaltantes} hs (límite: {machete.umbral} hs).
                  </div>
                ) : (
                  <div className="p-2 bg-white border border-[#111111]">
                    <strong>Adeudás:</strong> {machete.horasFaltantes} hs de años inferiores. Necesitás adeudar menos de {machete.umbral} hs (te faltan {Math.max(0, machete.horasFaltantes - machete.umbral + 1)} hs).
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 2: Candidatos a Cursado Condicional */}
          <div className="bg-[#f9f6ee] border-2 border-[#111111] p-4 shadow-fanzine-sm flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#111111] text-[#ccff00]">
                  Bloque 2
                </span>
                <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase">
                  Condicionalidad
                </span>
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                Cursado Condicional (Falta 1)
              </h4>
              <p className="font-mono text-[11px] text-[#52525b] leading-relaxed">
                Aplica a materias de 4º/5º año donde sólo te falta 1 correlativa y la pauta cuatrimestral lo autoriza.
              </p>
            </div>

            <div className="pt-3 border-t border-[#111111] space-y-2">
              {condicionales.length === 0 ? (
                <p className="font-mono text-xs text-[#52525b] italic bg-white p-2 border border-[#111111]">
                  Ninguna materia califica como condicional en tu estado actual.
                </p>
              ) : (
                <div className="space-y-1">
                  {condicionales.map(c => (
                    <div
                      key={c.materia.id}
                      className="p-1.5 bg-white border border-[#111111] font-mono text-[10px]"
                    >
                      <strong className="text-[#111111]">[{c.materia.codigo}] {c.materia.nombre}</strong>
                      <span className="text-[#b45309] block">
                        Falta rendir: {c.correlativa?.nombre || 'Correlativa'} ({c.tipo})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bloque 3: Materias con Comisión Compartida */}
          <div className="bg-[#f9f6ee] border-2 border-[#111111] p-4 shadow-fanzine-sm flex flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase px-1.5 py-0.5 bg-[#111111] text-[#0047ff]">
                  Bloque 3
                </span>
                <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase">
                  Cursado Cruzado
                </span>
              </div>
              <h4 className="font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
                Comisiones Compartidas ({basicasCompartidas.length})
              </h4>
              <p className="font-mono text-[11px] text-[#52525b] leading-relaxed">
                Ciencias básicas compartidas con otras carreras. Si te coincide el horario, podés cursarlas en otra especialidad.
              </p>
            </div>

            <div className="pt-3 border-t border-[#111111] space-y-1.5">
              <div className="max-h-28 overflow-y-auto pr-1 space-y-1">
                {basicasCompartidas.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-1 bg-white border border-[#111111] text-[10px] font-mono"
                  >
                    <span className="font-bold text-[#111111] truncate">[{m.codigo}] {m.nombre}</span>
                    <span className="text-[#52525b] flex-shrink-0 ml-1">{m.horas_semanales || 4} hs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 4: CRÉDITOS DE ELECTIVAS POR NIVEL ── */}
      <section className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#111111]">
          <div>
            <div className="inline-block bg-[#111111] text-[#ccff00] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111] mb-1">
              BOLSA DE CRÉDITOS
            </div>
            <h3 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
              Créditos de Electivas por Nivel (3º a 5º Año)
            </h3>
            <p className="font-mono text-[11px] text-[#52525b]">
              Horas requeridas vs cursadas. Las electivas forman una bolsa general según la oferta anual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {electivasPool.map(pool => {
            const pct = Math.min(100, Math.round((pool.logradas / (pool.requeridas || 1)) * 100))
            return (
              <div
                key={pool.nivel}
                className="bg-[#f9f6ee] border-2 border-[#111111] p-4 shadow-fanzine-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold uppercase text-[#111111]">
                    Nivel {pool.nivel}º Año
                  </span>
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border border-[#111111] ${
                      pool.cumplido ? 'bg-[#ccff00] text-[#111111]' : 'bg-white text-[#52525b]'
                    }`}
                  >
                    {pool.cumplido ? 'Cumplido' : `${pool.logradas}/${pool.requeridas} hs`}
                  </span>
                </div>

                {/* Barra de progreso fanzine */}
                <div>
                  <div className="w-full h-3 bg-white border-2 border-[#111111] overflow-hidden">
                    <div
                      className="h-full bg-[#ccff00] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-[#52525b] mt-1 font-bold">
                    <span>{pct}% completado</span>
                    <span>Meta: {pool.requeridas} hs/sem</span>
                  </div>
                </div>

                {/* Materias electivas de este nivel */}
                <div className="pt-2 border-t border-[#111111] space-y-1">
                  <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase block">
                    Oferta disponible ({pool.disponibles.length}):
                  </span>
                  {pool.disponibles.length === 0 ? (
                    <p className="font-mono text-[10px] text-[#71717a] italic">
                      No hay electivas cargadas en este nivel.
                    </p>
                  ) : (
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                      {pool.disponibles.map(m => {
                        const st = ctx.estadosMap[m.id] || 'NO_CURSADA'
                        const aprobada = st === 'PROMOCIONADA'
                        const cursando = st === 'CURSANDO'
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-1 bg-white border border-[#111111] text-[10px] font-mono"
                          >
                            <span className="font-bold text-[#111111] truncate mr-1">
                              {m.nombre}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1 border border-[#111111] flex-shrink-0 ${
                                aprobada
                                  ? 'bg-[#ccff00] text-[#111111]'
                                  : cursando
                                  ? 'bg-[#eff6ff] text-[#0047ff]'
                                  : 'bg-[#f4f0e6] text-[#52525b]'
                              }`}
                            >
                              {aprobada ? 'Aprobada' : cursando ? 'Cursando' : `${m.horas_semanales || 4} hs`}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
