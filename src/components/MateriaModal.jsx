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
      anio: parseInt(form.anio) || null,
      cuatrimestre: parseInt(form.cuatrimestre) || null,
      horas_semanales: parseInt(form.horas_semanales) || null,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl border-2 border-[#78716c] p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#e2dcce]">
          <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-[#1a1916] flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-orange-700" aria-hidden="true" /> : <BookPlus className="w-5 h-5 text-orange-700" aria-hidden="true" />}
            {isEdit ? 'Editar Materia' : 'Nueva Materia'}
          </h3>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-[#57534e] hover:text-[#1a1916] p-1.5 rounded-lg hover:bg-[#f4efe6] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="mat-nombre" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Nombre de la Materia <span className="text-rose-600" aria-hidden="true">*</span>
            </label>
            <input
              id="mat-nombre"
              type="text"
              required
              autoFocus
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Álgebra y Geometría Analítica"
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="mat-anio" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Año Curricular
              </label>
              <input
                id="mat-anio"
                type="number"
                min="1"
                max="7"
                value={form.anio}
                onChange={e => setForm(f => ({ ...f, anio: e.target.value }))}
                placeholder="1 a 6"
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
            <div>
              <label htmlFor="mat-cuatri" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Cuatrimestre
              </label>
              <select
                id="mat-cuatri"
                value={form.cuatrimestre}
                onChange={e => setForm(f => ({ ...f, cuatrimestre: e.target.value }))}
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1916] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              >
                <option value="">Anual / Sin definir</option>
                <option value="1">1° Cuatrimestre</option>
                <option value="2">2° Cuatrimestre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label htmlFor="mat-horas" className="block text-xs font-bold text-[#1a1916] mb-1.5">
                Horas Semanales
              </label>
              <input
                id="mat-horas"
                type="number"
                min="0"
                max="20"
                value={form.horas_semanales}
                onChange={e => setForm(f => ({ ...f, horas_semanales: e.target.value }))}
                placeholder="Ej: 4"
                className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[44px]"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 cursor-pointer select-none min-h-[44px]">
              <input
                id="mat-compartida"
                type="checkbox"
                checked={form.es_basica_compartida}
                onChange={e => setForm(f => ({ ...f, es_basica_compartida: e.target.checked }))}
                className="w-4 h-4 rounded bg-white border-2 border-[#78716c] text-orange-700"
              />
              <span className="text-xs font-bold text-[#1a1916]">Comisión compartida</span>
            </label>
          </div>

          <div>
            <label htmlFor="mat-desc" className="block text-xs font-bold text-[#1a1916] mb-1.5">
              Descripción u Observaciones
            </label>
            <textarea
              id="mat-desc"
              rows={2}
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Opcional: carga horaria, temas relevantes..."
              className="w-full bg-[#fbf9f4] border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs text-[#1a1916] placeholder-[#78716c] focus:outline-none focus:border-orange-600 focus:bg-white min-h-[64px]"
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
              {saving ? 'Guardando...' : isEdit ? 'Actualizar Materia' : 'Guardar Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
