import { useEffect, useRef, useState } from 'react'
import { CalendarPlus, Edit, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { titulo: '', fecha: '', hora_inicio: '', hora_fin: '', ubicacion: '', descripcion: '' }
const MODAL_TITLE_ID = 'evento-modal-title'

export default function EventoModal({ evento, fechaPorDefecto, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!evento
  const closeRef = useRef(null)

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
        titulo: form.titulo.trim(),
        fecha: form.fecha,
        hora_inicio: form.hora_inicio || null,
        hora_fin: form.hora_fin || null,
        ubicacion: form.ubicacion ? form.ubicacion.trim() : null,
        descripcion: form.descripcion ? form.descripcion.trim() : null,
      }
      if (isEdit) {
        await apiRequest(`/eventos/${evento.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/eventos', { method: 'POST', body: JSON.stringify(payload) })
      }
      // No mostramos toast de éxito acá: el WebSocket ya lo emite para todos los clientes
      onClose()
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg border-3 border-[#111111] p-5 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
          <h3 id={MODAL_TITLE_ID} className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            {isEdit ? <Edit className="w-4 h-4 text-[#ff1464]" aria-hidden="true" /> : <CalendarPlus className="w-4 h-4 text-[#ff1464]" aria-hidden="true" />}
            {isEdit ? 'Editar Evento de Agenda' : 'Nuevo Evento'}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 bg-white hover:bg-[#fee2e2] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="evt-titulo" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Título del Evento <span className="text-[#ff1464]">*</span>
            </label>
            <input
              id="evt-titulo"
              type="text"
              required
              autoFocus
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Entrega TP 1 - Algoritmos"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="evt-fecha" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Fecha <span className="text-[#ff1464]">*</span>
              </label>
              <input
                id="evt-fecha"
                type="date"
                required
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="evt-hinicio" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Inicio (opc.)
              </label>
              <input
                id="evt-hinicio"
                type="time"
                value={form.hora_inicio}
                onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="evt-hfin" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Fin (opc.)
              </label>
              <input
                id="evt-hfin"
                type="time"
                value={form.hora_fin}
                onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="evt-ubi" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Aula / Lugar / Enlace
            </label>
            <input
              id="evt-ubi"
              type="text"
              value={form.ubicacion}
              onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))}
              placeholder="Ej: Aula 302 o Meet"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="evt-desc" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Descripción / Notas
            </label>
            <textarea
              id="evt-desc"
              rows="2"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Detalles sobre temas que entran, requisitos..."
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-[#111111]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#e4e4e7] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px] disabled:opacity-50"
            >
              {saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
