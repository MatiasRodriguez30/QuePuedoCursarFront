import { useEffect, useMemo, useState } from 'react'
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
  Trash2
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import EventoModal from '../components/EventoModal'

// Las descripciones largas se muestran colapsadas con opción de expandir
// para no cortar texto sin forma de verlo completo (commit b498987).
const LARGO_COLAPSADO = 140

function DescripcionEvento({ texto }) {
  const [expandido, setExpandido] = useState(false)
  const esLarga = texto.length > LARGO_COLAPSADO

  return (
    <div className="mt-1.5">
      <p className={`text-xs text-[#57534e] whitespace-pre-line leading-relaxed font-medium ${esLarga && !expandido ? 'line-clamp-3' : ''}`}>
        {texto}
      </p>
      {esLarga && (
        <button
          onClick={() => setExpandido(v => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-800 hover:text-orange-950 mt-1 min-h-[32px]"
        >
          {expandido ? (
            <>
              Ver menos <ChevronUp className="w-3 h-3" aria-hidden="true" />
            </>
          ) : (
            <>
              Ver detalle completo <ChevronDown className="w-3 h-3" aria-hidden="true" />
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

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function construirGrilla(anio, mes) {
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

export default function AgendaTab({ ctx, showToast, showConfirm, esAdmin, cargarEventos }) {
  const hoy = useMemo(() => new Date(), [])
  const [mesVisible, setMesVisible] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [diaSeleccionado, setDiaSeleccionado] = useState(() => toISODate(hoy))
  const [editingEvento, setEditingEvento] = useState(undefined)

  const grilla = useMemo(
    () => construirGrilla(mesVisible.getFullYear(), mesVisible.getMonth()),
    [mesVisible]
  )

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

  const eventosDelDia = (eventosPorDia[diaSeleccionado] || [])
    .slice()
    .sort((a, b) => (a.hora_inicio || '').localeCompare(b.hora_inicio || ''))

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#e2dcce]">
        <div>
          <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-orange-700" aria-hidden="true" />
            Agenda Universitaria
          </h2>
          <p className="text-xs text-[#57534e]">
            Calendario de la facu y fechas importantes. Se sincroniza en tiempo real.
          </p>
        </div>
        {esAdmin && (
          <button
            onClick={() => setEditingEvento(null)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Nuevo Evento</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-5">
        {/* Calendario mensual */}
        <div className="notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-4">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e2dcce]">
            <button
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
              className="p-2 text-[#57534e] hover:text-[#1a1916] hover:bg-[#f4efe6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <h3 className="text-sm sm:text-base font-bold text-[#1a1916]">
              {MESES[mesVisible.getMonth()]} {mesVisible.getFullYear()}
            </h3>
            <button
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
              className="p-2 text-[#57534e] hover:text-[#1a1916] hover:bg-[#f4efe6] rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DIAS_SEMANA.map(d => (
              <div key={d} className="text-[11px] font-bold uppercase text-[#78716c] py-1">
                {d}
              </div>
            ))}
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
                  className={`aspect-square min-h-[48px] rounded-xl p-1 flex flex-col items-center justify-start gap-0.5 transition-colors border-2 ${
                    seleccionado
                      ? 'border-orange-600 bg-orange-50 font-bold'
                      : esHoy
                      ? 'border-[#78716c] bg-[#f4efe6]'
                      : 'border-transparent hover:bg-[#fbf9f4]'
                  } ${!delMes ? 'opacity-35' : ''}`}
                >
                  <span
                    className={`text-xs font-mono font-bold ${
                      esHoy
                        ? 'w-5 h-5 flex items-center justify-center rounded-full bg-orange-700 text-white'
                        : 'text-[#1a1916]'
                    }`}
                  >
                    {dia.getDate()}
                  </span>
                  {eventosDia.length > 0 && (
                    <span className="flex flex-wrap justify-center gap-1 mt-0.5">
                      {eventosDia.slice(0, 3).map(e => (
                        <span
                          key={e.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            e.origen === 'IMPORTADO' ? 'bg-amber-600' : 'bg-orange-600'
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

        {/* Detalle de eventos del día seleccionado */}
        <div className="notebook-panel rounded-2xl border border-[#e2dcce] bg-white p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-orange-900 border-b border-[#e2dcce] pb-2">
            {new Date(diaSeleccionado + 'T00:00:00').toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h3>

          {eventosDelDia.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#57534e] italic">
              No hay eventos para este día.
            </div>
          ) : (
            <div className="space-y-2.5">
              {eventosDelDia.map(ev => (
                <div key={ev.id} className="p-3 rounded-xl bg-[#fbf9f4] border border-[#e2dcce]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#1a1916] leading-snug">{ev.titulo}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#57534e] font-medium">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#78716c]" aria-hidden="true" />
                          {ev.hora_inicio
                            ? ev.hora_inicio.slice(0, 5) + (ev.hora_fin ? ` - ${ev.hora_fin.slice(0, 5)}` : '')
                            : 'Todo el día'}
                        </span>
                        {ev.ubicacion && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-[#78716c]" aria-hidden="true" />
                            <span className="truncate">{ev.ubicacion}</span>
                          </span>
                        )}
                      </div>
                      {ev.descripcion && <DescripcionEvento texto={ev.descripcion} />}
                      {ev.origen === 'IMPORTADO' && (
                        <span className="inline-block mt-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-400">
                          Calendario oficial
                        </span>
                      )}
                    </div>
                    {esAdmin && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingEvento(ev)}
                          title="Editar"
                          aria-label={`Editar evento ${ev.titulo}`}
                          className="p-1.5 text-[#57534e] hover:text-[#1a1916] rounded-lg hover:bg-white border border-transparent hover:border-[#d6cebf] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
                          <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev)}
                          title="Eliminar"
                          aria-label={`Eliminar evento ${ev.titulo}`}
                          className="p-1.5 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-300 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                        >
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
