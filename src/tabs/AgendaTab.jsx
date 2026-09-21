import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Edit3,
  MapPin,
  Plus,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import EventoModal from '../components/EventoModal'
import TitoAvatar from '../components/TitoAvatar'

const LARGO_COLAPSADO = 140

function DescripcionEvento({ texto }) {
  const [expandido, setExpandido] = useState(false)
  const esLarga = texto && texto.length > LARGO_COLAPSADO

  if (!texto) return null

  return (
    <div className="mt-1.5">
      <p className={`text-xs text-[#52525b] whitespace-pre-line leading-relaxed font-mono ${esLarga && !expandido ? 'line-clamp-3' : ''}`}>
        {texto}
      </p>
      {esLarga && (
        <button
          type="button"
          onClick={() => setExpandido(v => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#0047ff] hover:text-[#ff1464] mt-1 cursor-pointer min-h-[32px]"
        >
          {expandido ? (
            <>
              <span>Plegar detalle</span>
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>Ver detalle completo</span>
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    </div>
  )
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

// Obtiene fecha actual en Argentina (UTC-3) sin desfasaje horario
function getHoyArgentina() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date()).split('-')
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
}

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function construirGrillaMes(anio, mes) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const offsetInicio = (primerDia.getDay() + 6) % 7
  const offsetFin = (7 - ((ultimoDia.getDay() + 6) % 7) - 1) % 7

  const dias = []
  for (let i = offsetInicio; i > 0; i--) dias.push(new Date(anio, mes, 1 - i))
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d))
  for (let i = 1; i <= offsetFin; i++) dias.push(new Date(anio, mes + 1, i))
  return dias
}

function getInicioSemana(d) {
  const dia = (d.getDay() + 6) % 7
  const inicio = new Date(d)
  inicio.setDate(d.getDate() - dia)
  return inicio
}

export default function AgendaTab({ ctx, showToast, showConfirm, esAdmin, cargarEventos }) {
  const hoy = useMemo(() => getHoyArgentina(), [])
  const hoyISO = useMemo(() => toISODate(hoy), [hoy])

  const [fechaReferencia, setFechaReferencia] = useState(hoy)
  const [diaSeleccionado, setDiaSeleccionado] = useState(hoyISO)
  const [vistaMovil, setVistaMovil] = useState('dia') // 'dia' | 'mes'
  const [editingEvento, setEditingEvento] = useState(undefined)
  const [loading, setLoading] = useState(false)
  const [errorCarga, setErrorCarga] = useState(null)

  // Token para descartar respuestas fuera de orden al cambiar de mes/semana rápido (commit d03c020)
  const fetchIdRef = useRef(0)

  // Grilla mensual del mes de referencia
  const grillaMes = useMemo(
    () => construirGrillaMes(fechaReferencia.getFullYear(), fechaReferencia.getMonth()),
    [fechaReferencia]
  )

  // Semana de 7 días (Lunes a Domingo) alrededor de la fecha de referencia
  const diasSemana = useMemo(() => {
    const inicio = getInicioSemana(fechaReferencia)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      return d
    })
  }, [fechaReferencia])

  // Cargar eventos del rango visible cubriendo la grilla mensual completa
  useEffect(() => {
    const desde = toISODate(grillaMes[0])
    const hasta = toISODate(grillaMes[grillaMes.length - 1])
    const fetchId = ++fetchIdRef.current

    setLoading(true)
    setErrorCarga(null)

    cargarEventos(desde, hasta)
      .catch(err => {
        if (fetchId === fetchIdRef.current) {
          setErrorCarga(err.message)
        }
      })
      .finally(() => {
        if (fetchId === fetchIdRef.current) {
          setLoading(false)
        }
      })
  }, [grillaMes, cargarEventos])

  // Agrupación de eventos por fecha ISO
  const eventosPorDia = useMemo(() => {
    const map = {}
    ;(ctx.eventos || []).forEach(e => {
      if (!map[e.fecha]) map[e.fecha] = []
      map[e.fecha].push(e)
    })
    return map
  }, [ctx.eventos])

  const eventosDelDia = (eventosPorDia[diaSeleccionado] || [])
    .slice()
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

  function cambiarSemana(delta) {
    setFechaReferencia(f => {
      const n = new Date(f)
      n.setDate(f.getDate() + delta * 7)
      return n
    })
  }

  function cambiarMes(delta) {
    setFechaReferencia(f => new Date(f.getFullYear(), f.getMonth() + delta, 1))
  }

  function irAHoy() {
    setFechaReferencia(hoy)
    setDiaSeleccionado(hoyISO)
  }

  async function handleDelete(ev) {
    const ok = await showConfirm(`¿Eliminar "${ev.titulo}"?`, 'Esta acción no se puede deshacer.')
    if (!ok) return
    try {
      await apiRequest(`/eventos/${ev.id}`, { method: 'DELETE' })
    } catch (err) {
      showToast('error', 'Error', 'No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ── CABECERA DE AGENDA ── */}
      <div className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="bg-[#111111] text-[#ccff00] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#111111]">
              CALENDARIO ACADÉMICO
            </span>
            <span className="bg-[#fef3c7] text-[#92400e] text-[10px] font-mono font-bold uppercase px-2 py-0.5 border border-[#b45309]">
              EN VIVO (WS)
            </span>
          </div>
          <h2 className="font-display text-lg sm:text-2xl font-bold uppercase text-[#111111] tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-[#111111]" aria-hidden="true" />
            Agenda Universitaria
          </h2>
          <p className="font-mono text-xs text-[#52525b] mt-1">
            Fechas de parciales, finales, receso y eventos institucionales en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* Botón "+ Nuevo Evento" condicionado a rol Admin */}
          {esAdmin && (
            <button
              type="button"
              onClick={() => setEditingEvento(null)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px] whitespace-nowrap"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Nuevo Evento</span>
            </button>
          )}
        </div>
      </div>

      {/* Estado de Error en Carga de Agenda */}
      {errorCarga && (
        <div className="bg-[#fffdf5] border-3 border-[#111111] shadow-fanzine-md p-6 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 mx-auto mb-3 bg-[#ff1464] border-2 border-[#111111] flex items-center justify-center p-2 shadow-fanzine-sm">
            <TitoAvatar variant="urgente" className="w-12 h-12" />
          </div>
          <h3 className="font-display text-sm font-bold uppercase text-[#111111]">
            Error al sincronizar la agenda
          </h3>
          <p className="font-mono text-xs text-[#52525b] mt-1 mb-4">{errorCarga}</p>
          <button
            type="button"
            onClick={() => {
              const desde = toISODate(grillaMes[0])
              const hasta = toISODate(grillaMes[grillaMes.length - 1])
              cargarEventos(desde, hasta)
            }}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#ccff00] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* ── BARRA DE CONTROLES DE FECHA Y NAVEGACIÓN ── */}
      <div className="bg-[#f4f0e6] border-2 border-[#111111] shadow-fanzine-sm p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => cambiarMes(-1)}
            aria-label="Mes anterior"
            className="p-2 bg-white hover:bg-[#f9f6ee] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <div className="px-3 py-1.5 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-display text-xs sm:text-sm font-bold uppercase text-[#111111]">
            {MESES[fechaReferencia.getMonth()]} {fechaReferencia.getFullYear()}
          </div>
          <button
            type="button"
            onClick={() => cambiarMes(1)}
            aria-label="Mes siguiente"
            className="p-2 bg-white hover:bg-[#f9f6ee] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={irAHoy}
            className="px-3 py-1.5 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer min-h-[40px]"
          >
            Hoy
          </button>
        </div>

        {/* Selector de vista en móvil */}
        <div className="flex md:hidden items-center gap-1">
          <button
            type="button"
            onClick={() => setVistaMovil('dia')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer min-h-[40px] ${
              vistaMovil === 'dia'
                ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-[#111111]'
            }`}
          >
            Vista Día
          </button>
          <button
            type="button"
            onClick={() => setVistaMovil('mes')}
            className={`px-3 py-1.5 font-mono text-xs font-bold uppercase border-2 border-[#111111] cursor-pointer min-h-[40px] ${
              vistaMovil === 'mes'
                ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-[#111111]'
            }`}
          >
            Vista Mes
          </button>
        </div>
      </div>

      {/* ── SELECTOR HORIZONTAL DE SEMANA MÓVIL (7 DÍAS LUN-DOM CON S/D EN TINTA SOBRE MAGENTA) ── */}
      <div className="block md:hidden bg-white border-2 border-[#111111] shadow-fanzine-sm p-2.5">
        <div className="flex items-center justify-between gap-1 mb-2 pb-1 border-b border-[#111111]">
          <button
            type="button"
            onClick={() => cambiarSemana(-1)}
            className="p-1 text-[#111111] hover:bg-[#f4f0e6] border border-[#111111] font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" /> Sem. Ant.
          </button>
          <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase">
            Semana 7 Días
          </span>
          <button
            type="button"
            onClick={() => cambiarSemana(1)}
            className="p-1 text-[#111111] hover:bg-[#f4f0e6] border border-[#111111] font-mono text-[10px] font-bold uppercase cursor-pointer flex items-center gap-1"
          >
            Sem. Sig. <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {diasSemana.map(d => {
            const iso = toISODate(d)
            const esHoy = iso === hoyISO
            const seleccionado = iso === diaSeleccionado
            const eventosCount = (eventosPorDia[iso] || []).length
            const diaSemanaIndex = (d.getDay() + 6) % 7 // 0=Lun, 5=Sáb, 6=Dom
            const esFinde = diaSemanaIndex >= 5
            const inicial = DIAS_SEMANA[diaSemanaIndex].charAt(0)

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDiaSeleccionado(iso)}
                className={`py-1.5 px-0.5 border-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer min-h-[50px] transition-colors ${
                  seleccionado
                    ? 'border-[#111111] bg-[#ccff00] shadow-[2px_2px_0px_#111111] font-bold'
                    : esHoy
                    ? 'border-[#111111] bg-[#fef3c7]'
                    : 'border-[#111111] bg-[#f9f6ee] hover:bg-white'
                }`}
              >
                {/* Letras S/D en tinta #111 sobre fondo magenta con contraste >= 4.5:1 */}
                {esFinde ? (
                  <span className="text-[10px] font-mono font-bold px-1 bg-[#ff1464] text-[#111111] border border-[#111111]">
                    {inicial}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-[#52525b]">
                    {inicial}
                  </span>
                )}
                <span className="text-xs font-mono font-bold text-[#111111]">{d.getDate()}</span>
                {eventosCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── VISTA MÓVIL: MES COMPACTO CON PUNTOS DE EVENTOS (SI SELECCIONADA) ── */}
      {vistaMovil === 'mes' && (
        <div className="block md:hidden bg-white border-2 border-[#111111] shadow-fanzine-sm p-3 space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#111111]">
            <span className="font-display text-xs font-bold uppercase text-[#111111]">
              Grilla Mensual • {MESES[fechaReferencia.getMonth()]} {fechaReferencia.getFullYear()}
            </span>
            <span className="font-mono text-[10px] text-[#52525b]">Tocá un día para ver eventos</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] font-bold">
            {DIAS_SEMANA.map((d, i) => (
              <div
                key={d}
                className={`py-1 border border-[#111111] ${
                  i >= 5 ? 'bg-[#ff1464] text-[#111111]' : 'bg-[#f4f0e6] text-[#111111]'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grillaMes.map(dia => {
              const iso = toISODate(dia)
              const delMes = dia.getMonth() === fechaReferencia.getMonth()
              const esHoy = iso === hoyISO
              const seleccionado = iso === diaSeleccionado
              const eventosDia = eventosPorDia[iso] || []

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    setDiaSeleccionado(iso)
                    setVistaMovil('dia')
                  }}
                  className={`aspect-square p-1 flex flex-col items-center justify-start gap-0.5 border ${
                    seleccionado
                      ? 'border-2 border-[#111111] bg-[#ccff00] font-bold shadow-[2px_2px_0px_#111111]'
                      : esHoy
                      ? 'border-2 border-[#111111] bg-[#fef3c7]'
                      : 'border-[#111111] bg-[#f9f6ee] hover:bg-white'
                  } ${!delMes ? 'opacity-35' : ''}`}
                >
                  <span className="text-[11px] font-mono font-bold text-[#111111]">{dia.getDate()}</span>
                  {eventosDia.length > 0 && (
                    <span className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {eventosDia.slice(0, 3).map(e => (
                        <span
                          key={e.id}
                          className={`w-1 h-1 rounded-full ${
                            e.origen === 'IMPORTADO' ? 'bg-[#b45309]' : 'bg-[#111111]'
                          }`}
                        />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── GRILLA PRINCIPAL (ESCRITORIO: SEMANA 7 DÍAS + CALENDARIO LATERAL / MÓVIL: EVENTOS DEL DÍA) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Columna Principal: Grilla Semanal de 7 Días (Lunes a Domingo) en Escritorio */}
        <div className="hidden md:block bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold uppercase text-[#111111]">
                Semana del {diasSemana[0].getDate()} de {MESES[diasSemana[0].getMonth()]} al {diasSemana[6].getDate()} de {MESES[diasSemana[6].getMonth()]}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => cambiarSemana(-1)}
                className="px-2 py-1 bg-white hover:bg-[#f4f0e6] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
              >
                ◀ Sem. Anterior
              </button>
              <button
                type="button"
                onClick={() => cambiarSemana(1)}
                className="px-2 py-1 bg-white hover:bg-[#f4f0e6] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
              >
                Sem. Siguiente ▶
              </button>
            </div>
          </div>

          {/* 7 Columnas de días (Lunes a Domingo) */}
          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia, idx) => {
              const iso = toISODate(dia)
              const esHoy = iso === hoyISO
              const esFinde = idx >= 5
              const eventosDia = (eventosPorDia[iso] || [])
                .slice()
                .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))
              const seleccionado = iso === diaSeleccionado

              return (
                <div
                  key={iso}
                  onClick={() => setDiaSeleccionado(iso)}
                  className={`border-2 flex flex-col min-h-[360px] cursor-pointer transition-colors ${
                    seleccionado
                      ? 'border-[#111111] bg-[#fbf9f4] shadow-[3px_3px_0px_#111111]'
                      : 'border-[#111111] bg-[#fdfcf9] hover:bg-[#f9f6ee]'
                  }`}
                >
                  {/* Encabezado del día: SÁB y DOM con marcador/fondo magenta y texto tinta #111 */}
                  <div
                    className={`p-2 border-b-2 border-[#111111] flex flex-col items-center justify-center text-center ${
                      esHoy ? 'bg-[#ccff00]' : esFinde ? 'bg-[#fff0f5]' : 'bg-[#f4f0e6]'
                    }`}
                  >
                    {esFinde ? (
                      <span className="px-1.5 py-0.2 bg-[#ff1464] text-[#111111] font-mono text-[10px] font-bold uppercase border border-[#111111] shadow-[1px_1px_0px_#111111]">
                        {DIAS_SEMANA[idx]}
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] font-bold text-[#52525b] uppercase">
                        {DIAS_SEMANA[idx]}
                      </span>
                    )}
                    <span className="font-display text-sm font-bold text-[#111111] mt-0.5">
                      {dia.getDate()}
                    </span>
                  </div>

                  {/* Lista de eventos del día en la columna */}
                  <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto max-h-[380px]">
                    {eventosDia.length === 0 ? (
                      <div className="h-full flex items-center justify-center py-6">
                        <span className="font-mono text-[10px] text-[#a1a1aa] uppercase italic">
                          Libre
                        </span>
                      </div>
                    ) : (
                      eventosDia.map(ev => {
                        const esImportado = ev.origen === 'IMPORTADO'
                        return (
                          <div
                            key={ev.id}
                            className={`p-1.5 border border-[#111111] text-left text-xs font-mono shadow-[1px_1px_0px_#111111] ${
                              esImportado
                                ? 'bg-[#fef3c7] border-l-4 border-l-[#b45309]'
                                : 'bg-white border-l-4 border-l-[#ccff00]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[9px] text-[#52525b] font-bold">
                              <span>{ev.hora_inicio ? ev.hora_inicio.slice(0, 5) : 'Todo el día'}</span>
                              {esImportado && <span className="text-[#92400e]">Oficial</span>}
                            </div>
                            <div className="font-bold text-[#111111] text-[11px] leading-tight line-clamp-2 mt-0.5">
                              {ev.titulo}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel Lateral: Detalle de Eventos del Día Seleccionado */}
        <div className="bg-white border-3 border-[#111111] shadow-fanzine-md p-4 sm:p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="pb-2 border-b-2 border-[#111111] flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-[#52525b] block">
                  Eventos del Día
                </span>
                <h3 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
                  {new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 bg-[#111111] text-[#ccff00] border border-[#111111]">
                {eventosDelDia.length} {eventosDelDia.length === 1 ? 'evento' : 'eventos'}
              </span>
            </div>

            {/* Listado de tarjetas de eventos */}
            {loading ? (
              <div className="py-12 text-center space-y-2">
                <TitoAvatar variant="lupa" className="w-14 h-14 mx-auto" />
                <p className="font-display text-xs font-bold uppercase text-[#111111]">
                  Consultando la agenda...
                </p>
                <p className="font-mono text-[11px] text-[#52525b]">
                  Sincronizando fechas de la facultad
                </p>
              </div>
            ) : eventosDelDia.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <TitoAvatar variant="mate" className="w-14 h-14 mx-auto" />
                <p className="font-display text-xs font-bold uppercase text-[#111111]">
                  Sin eventos para este día
                </p>
                <p className="font-mono text-[11px] text-[#52525b] max-w-xs mx-auto">
                  Aprovechá para descansar, tomar un mate o adelantar apuntes.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {eventosDelDia.map(ev => {
                  const esImportado = ev.origen === 'IMPORTADO'
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 border-2 border-[#111111] shadow-fanzine-sm space-y-2 ${
                        esImportado ? 'bg-[#fffbeb]' : 'bg-[#fbf9f4]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[#111111] leading-snug">
                            {ev.titulo}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-[#52525b] font-bold">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#111111]" aria-hidden="true" />
                              {ev.hora_inicio
                                ? ev.hora_inicio.slice(0, 5) + (ev.hora_fin ? ` - ${ev.hora_fin.slice(0, 5)}` : '')
                                : 'Todo el día'}
                            </span>
                            {ev.ubicacion && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-[#111111]" aria-hidden="true" />
                                <span className="truncate">{ev.ubicacion}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción sólo para Admin */}
                        {esAdmin && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditingEvento(ev)}
                              title="Editar evento"
                              aria-label={`Editar evento ${ev.titulo}`}
                              className="p-1.5 bg-white hover:bg-[#ccff00] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(ev)}
                              title="Eliminar evento"
                              aria-label={`Eliminar evento ${ev.titulo}`}
                              className="p-1.5 bg-white hover:bg-[#ff1464] hover:text-white text-[#ff1464] border border-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expandir / Colapsar sin recortar descripciones largas (commit b498987) */}
                      <DescripcionEvento texto={ev.descripcion} />

                      {/* Badge de distinción evento propio vs importado */}
                      <div className="pt-1.5 border-t border-[#111111] flex items-center justify-between">
                        {esImportado ? (
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-[#fef3c7] text-[#92400e] border border-[#b45309]">
                            Calendario oficial
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 bg-[#ccff00] text-[#111111] border border-[#111111]">
                            Evento personal
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Mini Calendario Mensual Secundario en Escritorio */}
          <div className="hidden lg:block pt-3 border-t-2 border-[#111111] space-y-2">
            <div className="flex items-center justify-between font-mono text-[11px] font-bold text-[#111111]">
              <span>Mes de {MESES[fechaReferencia.getMonth()]}</span>
              <span className="text-[#52525b]">Navegación</span>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center font-mono text-[9px] font-bold">
              {DIAS_SEMANA.map((d, i) => (
                <div
                  key={d}
                  className={`p-0.5 ${i >= 5 ? 'bg-[#ff1464] text-[#111111]' : 'text-[#52525b]'}`}
                >
                  {d.charAt(0)}
                </div>
              ))}
              {grillaMes.map(dia => {
                const iso = toISODate(dia)
                const delMes = dia.getMonth() === fechaReferencia.getMonth()
                const esHoy = iso === hoyISO
                const seleccionado = iso === diaSeleccionado
                const tieneEventos = (eventosPorDia[iso] || []).length > 0

                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setDiaSeleccionado(iso)}
                    className={`aspect-square flex flex-col items-center justify-center p-0.5 border cursor-pointer ${
                      seleccionado
                        ? 'border-2 border-[#111111] bg-[#ccff00] font-bold'
                        : esHoy
                        ? 'border border-[#111111] bg-[#fef3c7]'
                        : 'border-transparent hover:border-[#111111]'
                    } ${!delMes ? 'opacity-25' : ''}`}
                  >
                    <span>{dia.getDate()}</span>
                    {tieneEventos && <span className="w-1 h-1 rounded-full bg-[#111111]" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Crear o Editar Eventos */}
      {editingEvento !== undefined && (
        <EventoModal
          evento={editingEvento}
          fechaPorDefecto={diaSeleccionado}
          onClose={() => setEditingEvento(undefined)}
          showToast={showToast}
        />
      )}
    </div>
  )
}
