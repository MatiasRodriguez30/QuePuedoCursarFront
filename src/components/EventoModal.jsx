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
        showToast('success', 'Evento Actualizado', `"${form.titulo}" se guardó correctamente`)
      } else {
        await apiRequest('/eventos', { method: 'POST', body: JSON.stringify(payload) })
        showToast('success', 'Evento Agregado', `"${form.titulo}" se agregó a la agenda`)
      }
      onClose()
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-brand-400" aria-hidden="true" /> : <CalendarPlus className="w-5 h-5 text-brand-400" aria-hidden="true" />}
            {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h3>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="ev-titulo" className="block text-xs font-semibold text-slate-300 mb-1.5">Título <span className="text-rose-400" aria-hidden="true">*</span></label>
            <input
              id="ev-titulo"
              type="text" required autoFocus
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              placeholder="Ej: Parcial de Base de Datos"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="ev-fecha" className="block text-xs font-semibold text-slate-300 mb-1.5">Fecha <span className="text-rose-400" aria-hidden="true">*</span></label>
            <input id="ev-fecha" type="date" required value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ev-hora-inicio" className="block text-xs font-semibold text-slate-300 mb-1.5">Hora de Inicio</label>
              <input id="ev-hora-inicio" type="time" value={form.hora_inicio} onChange={e => setForm(f => ({ ...f, hora_inicio: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500" />
              <p className="text-[10px] text-slate-500 mt-1">Vacío = evento de todo el día</p>
            </div>
            <div>
              <label htmlFor="ev-hora-fin" className="block text-xs font-semibold text-slate-300 mb-1.5">Hora de Fin</label>
              <input id="ev-hora-fin" type="time" value={form.hora_fin} onChange={e => setForm(f => ({ ...f, hora_fin: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500" />
            </div>
          </div>

          <div>
            <label htmlFor="ev-ubicacion" className="block text-xs font-semibold text-slate-300 mb-1.5">Ubicación</label>
            <input id="ev-ubicacion" type="text" value={form.ubicacion} onChange={e => setForm(f => ({ ...f, ubicacion: e.target.value }))} placeholder="Opcional"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
          </div>

          <div>
            <label htmlFor="ev-desc" className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción</label>
            <textarea id="ev-desc" rows={3} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Opcional: detalles del evento..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} aria-disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar Evento' : 'Guardar Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
