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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border-2 border-[#78716c] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#e2dcce]">
          <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-orange-700" aria-hidden="true" /> : <GraduationCap className="w-5 h-5 text-orange-700" aria-hidden="true" />}
            {isEdit ? 'Editar Carrera' : 'Nueva Carrera'}
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
            <label htmlFor="car-nombre" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Nombre de la Carrera <span className="text-rose-600" aria-hidden="true">*</span>
            </label>
            <input
              id="car-nombre"
              type="text"
              required
              autoFocus
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Ingeniería en Sistemas de Información"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="car-plan" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Plan de Estudios
            </label>
            <input
              id="car-plan"
              type="text"
              value={form.plan_nombre}
              onChange={e => setForm(f => ({ ...f, plan_nombre: e.target.value }))}
              placeholder="Ej: Plan 2023 (opcional)"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="car-horas" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Límite de horas — Excepción de Adelanto de Nivel
            </label>
            <input
              id="car-horas"
              type="number"
              min="0"
              value={form.horas_excepcion_ultimo_anio}
              onChange={e => setForm(f => ({ ...f, horas_excepcion_ultimo_anio: e.target.value }))}
              placeholder="Vacío = no aplica en esta carrera"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
            <p className="text-[11px] text-[#57534e] mt-1 leading-relaxed">
              Regla general de correlativas: horas semanales totales del último año de esta carrera. Dejalo vacío si no aplica.
            </p>
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
              {saving ? 'Guardando...' : isEdit ? 'Actualizar Carrera' : 'Crear Carrera'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
