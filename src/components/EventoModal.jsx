import { useEffect, useState } from 'react'
import { CalendarPlus, Edit, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { titulo: '', fecha: '', hora_inicio: '', hora_fin: '', ubicacion: '', descripcion: '' }
const MODAL_TITLE_ID = 'evento-modal-title'

export default function EventoModal({ evento, fechaPorDefecto, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!evento

  useEffect(() => {
    if (evento) {
      setForm({
        titulo: evento.titulo || '',
        fecha: evento.fecha || '',
        hora_inicio: evento.hora_inicio ? evento.hora_inicio.slice(0, 5) : '',
        hora_fin: evento.hora_fin ? evento.hora_fin.slice(0, 5) : '',
        ubicacion: evento.ubicacion || '',
        descripcion: evento.descripcion || '',
      })
    } else {
      setForm({ ...EMPTY, fecha: fechaPorDefecto || '' })
    }
  }, [evento, fechaPorDefecto])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        titulo: form.titulo,
        fecha: form.fecha,
        hora_inicio: form.hora_inicio || null,
        hora_fin: form.hora_fin || null,
        ubicacion: form.ubicacion || null,
        descripcion: form.descripcion || null,
      }
      if (isEdit) {
        await apiRequest(`/eventos/${evento.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/eventos', { method: 'POST', body: JSON.stringify(payload) })
      }
      // No mostramos toast de éxito acá: el WebSocket ya lo emite para todos los clientes (commit d062eb5)
      onClose()
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border-2 border-[#78716c] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#e2dcce]">
          <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-orange-700" aria-hidden="true" /> : <CalendarPlus className="w-5 h-5 text-orange-700" aria-hidden="true" />}
            {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-[#57534e] hover:text-[#1a1916] p-1.5 rounded-lg hover:bg-[#f4efe6] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="ev-titulo" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Título del Evento <span className="text-rose-600" aria-hidden="true">*</span>
            </label>
            <input
              id="ev-titulo"
              type="text"
              required
              autoFocus
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Mesa de Examen Final - Álgebra"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="ev-fecha" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Fecha <span className="text-rose-600" aria-hidden="true">*</span>
              </label>
              <input
                id="ev-fecha"
                type="date"
                required
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="ev-inicio" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Hora Inicio
              </label>
              <input
                id="ev-inicio"
                type="time"
                value={form.hora_inicio}
                onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="ev-fin" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Hora Fin
              </label>
              <input
                id="ev-fin"
                type="time"
                value={form.hora_fin}
                onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="ev-ubicacion" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Ubicación o Aula
            </label>
            <input
              id="ev-ubicacion"
              type="text"
              value={form.ubicacion}
              onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
              placeholder="Ej: Aula Magna / Laboratorio 3"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="ev-desc" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Detalle / Materias incluidas
            </label>
            <textarea
              id="ev-desc"
              rows={3}
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Opcional: información adicional, materias evaluadas..."
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[72px]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e2dcce]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-[#57534e] hover:text-[#1a1916] transition-colors min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px] disabled:opacity-60"
            >
              {saving ? 'Guardando...' : isEdit ? 'Actualizar Evento' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
