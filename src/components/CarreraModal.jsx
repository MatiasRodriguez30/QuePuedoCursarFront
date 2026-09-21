import { useEffect, useRef, useState } from 'react'
import { Edit, GraduationCap, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { nombre: '', plan_nombre: '', horas_excepcion_ultimo_anio: '' }
const MODAL_TITLE_ID = 'carrera-modal-title'

export default function CarreraModal({ carrera, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!carrera
  const closeRef = useRef(null)

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
      horas_excepcion_ultimo_anio: form.horas_excepcion_ultimo_anio === '' ? null : parseInt(form.horas_excepcion_ultimo_anio, 10),
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg border-3 border-[#111111] p-5 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
          <h3 id={MODAL_TITLE_ID} className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            {isEdit ? <Edit className="w-4 h-4 text-[#ff1464]" aria-hidden="true" /> : <GraduationCap className="w-4 h-4 text-[#ff1464]" aria-hidden="true" />}
            {isEdit ? 'Editar Carrera' : 'Nueva Carrera'}
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
            <label htmlFor="car-nombre" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Nombre de la Carrera <span className="text-[#ff1464]">*</span>
            </label>
            <input
              id="car-nombre"
              type="text"
              required
              autoFocus
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Ingeniería en Sistemas de Información"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="car-plan" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Plan de Estudios (opcional)
            </label>
            <input
              id="car-plan"
              type="text"
              value={form.plan_nombre}
              onChange={e => setForm(f => ({ ...f, plan_nombre: e.target.value }))}
              placeholder="Ej: Plan 2023"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>

          <div>
            <label htmlFor="car-horas" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Límite de horas — Excepción de Adelanto de Nivel
            </label>
            <input
              id="car-horas"
              type="number"
              min="0"
              value={form.horas_excepcion_ultimo_anio}
              onChange={e => setForm(f => ({ ...f, horas_excepcion_ultimo_anio: e.target.value }))}
              placeholder="Vacío = no aplica en esta carrera"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
            <p className="text-[11px] font-mono text-[#52525b] mt-1 leading-relaxed">
              Horas semanales totales del último año de esta carrera para habilitar el cursado adelantado de materias del año final. Dejalo vacío si no aplica.
            </p>
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
              {saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Carrera')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
