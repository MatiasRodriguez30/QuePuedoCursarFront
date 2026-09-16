import { useEffect, useState } from 'react'
import { Edit, GraduationCap, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { nombre: '', plan_nombre: '', horas_excepcion_ultimo_anio: '' }

const MODAL_TITLE_ID = 'carrera-modal-title'

export default function CarreraModal({ carrera, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!carrera

  useEffect(() => {
    if (carrera) {
      setForm({
        nombre: carrera.nombre || '',
        plan_nombre: carrera.plan_nombre || '',
        horas_excepcion_ultimo_anio: carrera.horas_excepcion_ultimo_anio ?? '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [carrera])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      plan_nombre: form.plan_nombre.trim() || null,
      horas_excepcion_ultimo_anio: form.horas_excepcion_ultimo_anio === '' ? null : parseInt(form.horas_excepcion_ultimo_anio),
    }
    try {
      if (isEdit) {
        await apiRequest(`/carreras/${carrera.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/carreras', { method: 'POST', body: JSON.stringify(payload) })
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
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-brand-400" aria-hidden="true" /> : <GraduationCap className="w-5 h-5 text-brand-400" aria-hidden="true" />}
            {isEdit ? 'Editar Carrera' : 'Nueva Carrera'}
          </h3>
          <button onClick={onClose} aria-label="Cerrar modal" className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="car-nombre" className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de la Carrera <span className="text-rose-400" aria-hidden="true">*</span></label>
            <input
              id="car-nombre" type="text" required autoFocus
              value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Ingeniería Civil"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="car-plan" className="block text-xs font-semibold text-slate-300 mb-1.5">Plan de Estudios</label>
            <input
              id="car-plan" type="text"
              value={form.plan_nombre} onChange={e => setForm(f => ({ ...f, plan_nombre: e.target.value }))}
              placeholder="Ej: Plan 2023 (opcional, sólo descriptivo)"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label htmlFor="car-horas" className="block text-xs font-semibold text-slate-300 mb-1.5">Límite de horas — Excepción de Adelanto de Nivel</label>
            <input
              id="car-horas" type="number" min="0"
              value={form.horas_excepcion_ultimo_anio} onChange={e => setForm(f => ({ ...f, horas_excepcion_ultimo_anio: e.target.value }))}
              placeholder="Vacío = esta carrera no tiene esta excepción"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Ordenanza 1872 (general para Ingenierías de UTN): horas semanales totales del último año de esta carrera. Dejalo vacío si no aplica.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar Carrera' : 'Crear Carrera')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
