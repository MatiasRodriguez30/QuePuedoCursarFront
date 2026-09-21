import { useEffect, useRef, useState } from 'react'
import { BookPlus, Edit, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { nombre: '', anio: '', cuatrimestre: '', horas_semanales: '', es_basica_compartida: false, descripcion: '' }
const MODAL_TITLE_ID = 'materia-modal-title'

export default function MateriaModal({ materia, carreraId, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!materia
  const closeRef = useRef(null)

  useEffect(() => {
    if (materia) {
      setForm({
        nombre: materia.nombre || '',
        anio: materia.anio || '',
        cuatrimestre: materia.cuatrimestre || '',
        horas_semanales: materia.horas_semanales || '',
        es_basica_compartida: !!materia.es_basica_compartida,
        descripcion: materia.descripcion || '',
      })
    } else {
      setForm(EMPTY)
    }
  }, [materia])

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
      anio: parseInt(form.anio, 10) || null,
      cuatrimestre: parseInt(form.cuatrimestre, 10) || null,
      horas_semanales: parseInt(form.horas_semanales, 10) || null,
      es_basica_compartida: form.es_basica_compartida,
      descripcion: form.descripcion.trim() || null,
    }
    try {
      if (isEdit) {
        await apiRequest(`/materias/${materia.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      } else {
        await apiRequest('/materias', { method: 'POST', body: JSON.stringify({ ...payload, carrera_id: carreraId }) })
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
            {isEdit ? <Edit className="w-4 h-4 text-[#ff1464]" aria-hidden="true" /> : <BookPlus className="w-4 h-4 text-[#ff1464]" aria-hidden="true" />}
            {isEdit ? 'Editar Materia' : 'Nueva Materia'}
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
            <label htmlFor="mat-nombre" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Nombre de la Materia <span className="text-[#ff1464]">*</span>
            </label>
            <input
              id="mat-nombre"
              type="text"
              required
              autoFocus
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Álgebra y Geometría Analítica"
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="mat-anio" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Año / Nivel
              </label>
              <input
                id="mat-anio"
                type="number"
                min="1"
                max="6"
                value={form.anio}
                onChange={e => setForm(f => ({ ...f, anio: e.target.value }))}
                placeholder="1 a 5"
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="mat-cuat" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Régimen
              </label>
              <select
                id="mat-cuat"
                value={form.cuatrimestre}
                onChange={e => setForm(f => ({ ...f, cuatrimestre: e.target.value }))}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px] cursor-pointer"
              >
                <option value="">Anual</option>
                <option value="1">1º Cuatrimestre</option>
                <option value="2">2º Cuatrimestre</option>
              </select>
            </div>

            <div>
              <label htmlFor="mat-hs" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
                Horas / sem
              </label>
              <input
                id="mat-hs"
                type="number"
                min="1"
                max="20"
                value={form.horas_semanales}
                onChange={e => setForm(f => ({ ...f, horas_semanales: e.target.value }))}
                placeholder="Ej: 4"
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2.5 p-2.5 bg-[#f4f0e6] border-2 border-[#111111] cursor-pointer">
              <input
                type="checkbox"
                checked={form.es_basica_compartida}
                onChange={e => setForm(f => ({ ...f, es_basica_compartida: e.target.checked }))}
                className="w-4 h-4 accent-[#111111] cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-[#111111]">
                Materia básica con comisión compartida (permite cursado cruzado)
              </span>
            </label>
          </div>

          <div>
            <label htmlFor="mat-desc" className="block text-xs font-mono font-bold uppercase text-[#111111] mb-1">
              Descripción / Notas de cátedra
            </label>
            <textarea
              id="mat-desc"
              rows="2"
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Notas opcionales sobre el contenido o régimen..."
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
              {saving ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Materia')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
