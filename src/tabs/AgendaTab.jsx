import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock, Edit3, MapPin, Plus, Trash2 } from 'lucide-react'
import { apiRequest } from '../lib/api'
import EventoModal from '../components/EventoModal'

// Las descripciones importadas del calendario de UTN (listas de materias por
// mesa de examen) suelen ser largas: se muestran truncadas con un toggle en
// vez de cortarlas sin forma de ver el resto (ver feedback de usuario).
const LARGO_COLAPSADO = 140

function DescripcionEvento({ texto }) {
  const [expandido, setExpandido] = useState(false)
  const esLarga = texto.length > LARGO_COLAPSADO

  return (
    <div className="mt-1.5">
      <p className={`text-xs text-slate-400 whitespace-pre-line ${esLarga && !expandido ? 'line-clamp-3' : ''}`}>{texto}</p>
      {esLarga && (
        <button
          onClick={() => setExpandido(v => !v)}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-400 hover:text-brand-300 mt-1"
        >
          {expandido ? <>Ver menos <ChevronUp className="w-3 h-3" aria-hidden="true" /></> : <>Ver detalle completo <ChevronDown className="w-3 h-3" aria-hidden="true" /></>}
        </button>
      )}
    </div>
  )
}

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const DIAS_SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Grilla de semanas completas (lunes a domingo) que cubren el mes, incluyendo
// días de relleno del mes anterior/siguiente para no dejar huecos visuales.
function construirGrilla(anio, mes) {
  const primerDia = new Date(anio, mes, 1)
  const ultimoDia = new Date(anio, mes + 1, 0)
  const offsetInicio = (primerDia.getDay() + 6) % 7 // lunes = 0
  const offsetFin = (7 - ((ultimoDia.getDay() + 6) % 7) - 1) % 7

  const dias = []
  for (let i = offsetInicio; i > 0; i--) dias.push(new Date(anio, mes, 1 - i))
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d))
  for (let i = 1; i <= offsetFin; i++) dias.push(new Date(anio, mes + 1, i))
  return dias
}

export default function AgendaTab({ ctx, showToast, showConfirm, esAdmin, cargarEventos }) {
  const hoy = useMemo(() => new Date(), [])
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => toISODate(hoy))
  const [editingEvento, setEditingEvento] = useState(undefined) // undefined = cerrado, null = nuevo, obj = editar

  const grilla = useMemo(() => construirGrilla(mesVisible.getFullYear(), mesVisible.getMonth()), [mesVisible])

  useEffect(() => {
    const desde = toISODate(grilla[0])
    const hasta = toISODate(grilla[grilla.length - 1])
    cargarEventos(desde, hasta)
  }, [grilla, cargarEventos])

  const eventosPorDia = useMemo(() => {
    const map = {}
    ctx.eventos.forEach(e => {
      if (!map[e.fecha]) map[e.fecha] = []
      map[e.fecha].push(e)
    })
    return map
  }, [ctx.eventos])

  const eventosDelDia = (eventosPorDia[diaSeleccionado] || []).slice().sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

  function cambiarMes(delta) {
    setMesVisible(m => new Date(m.getFullYear(), m.getMonth() + delta, 1))
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-brand-400" aria-hidden="true" />
            Agenda
          </h2>
          <p className="text-xs text-slate-400">Calendario institucional de UTN + eventos propios. Se sincroniza en tiempo real.</p>
        </div>
        {esAdmin && (
          <button
            onClick={() => setEditingEvento(null)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Nuevo Evento</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="glass-panel rounded-2xl border border-slate-800/80 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => cambiarMes(-1)} aria-label="Mes anterior" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <h3 className="text-sm font-bold text-white">{MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}</h3>
            <button onClick={() => cambiarMes(1)} aria-label="Mes siguiente" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DIAS_SEMANA.map(d => <div key={d} className="text-[10px] font-semibold uppercase text-slate-500 py-1">{d}</div>)}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {grilla.map(dia => {
              const iso = toISODate(dia)
              const delMes = dia.getMonth() === mesVisible.getMonth()
              const esHoy = iso === toISODate(hoy)
              const seleccionado = iso === diaSeleccionado
              const eventosDia = eventosPorDia[iso] || []
              return (
                <button
                  key={iso}
                  onClick={() => setDiaSeleccionado(iso)}
                  className={`aspect-square min-h-[52px] rounded-lg p-1 flex flex-col items-center gap-0.5 text-left transition-colors border ${
                    seleccionado ? 'border-brand-500 bg-brand-500/10' : 'border-transparent hover:bg-slate-800/60'
                  } ${!delMes ? 'opacity-30' : ''}`}
                >
                  <span className={`text-[11px] font-semibold ${esHoy ? 'w-5 h-5 flex items-center justify-center rounded-full bg-brand-500 text-white' : 'text-slate-300'}`}>
                    {dia.getDate()}
                  </span>
                  {eventosDia.length > 0 && (
                    <span className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                      {eventosDia.slice(0, 3).map(e => (
                        <span key={e.id} className={`w-1.5 h-1.5 rounded-full ${e.origen === 'IMPORTADO' ? 'bg-amber-400' : 'bg-brand-400'}`} />
                      ))}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-slate-800/80 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {eventosDelDia.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">No hay eventos este día.</p>
          ) : (
            <div className="space-y-2">
              {eventosDelDia.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white leading-snug">{ev.titulo}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {ev.hora_inicio ? ev.hora_inicio.slice(0, 5) + (ev.hora_fin ? ` - ${ev.hora_fin.slice(0, 5)}` : '') : 'Todo el día'}
                        </span>
                        {ev.ubicacion && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{ev.ubicacion}</span>
                          </span>
                        )}
                      </div>
                      {ev.descripcion && <DescripcionEvento texto={ev.descripcion} />}
                      {ev.origen === 'IMPORTADO' && (
                        <span className="inline-block mt-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Calendario UTN
                        </span>
                      )}
                    </div>
                    {esAdmin && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => setEditingEvento(ev)} title="Editar" aria-label={`Editar evento ${ev.titulo}`} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button onClick={() => handleDelete(ev)} title="Eliminar" aria-label={`Eliminar evento ${ev.titulo}`} className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
