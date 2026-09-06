import { useEffect, useState } from 'react'
import { BookPlus, Edit, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const EMPTY = { nombre: '', anio: '', cuatrimestre: '', horas_semanales: '', es_basica_compartida: false, descripcion: '' }

export default function MateriaModal({ materia, onClose, showToast }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const isEdit = !!materia

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
        await apiRequest('/materias', { method: 'POST', body: JSON.stringify(payload) })
      }
      onClose()
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            {isEdit ? <Edit className="w-5 h-5 text-brand-400" /> : <BookPlus className="w-5 h-5 text-brand-400" />}
            {isEdit ? 'Editar Asignatura' : 'Nueva Materia'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre de la Asignatura <span className="text-rose-400">*</span></label>
            <input
              type="text" required autoFocus
              value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
              placeholder="Ej: Álgebra y Geometría Analítica"
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Año Curricular</label>
              <input type="number" min="1" max="7" value={form.anio} onChange={e => setForm(f => ({ ...f, anio: e.target.value }))} placeholder="1 a 6"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cuatrimestre</label>
              <select value={form.cuatrimestre} onChange={e => setForm(f => ({ ...f, cuatrimestre: e.target.value }))}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500">
                <option value="">Anual / Sin definir</option>
                <option value="1">1° Cuatrimestre</option>
                <option value="2">2° Cuatrimestre</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Horas Semanales</label>
              <input type="number" min="0" max="20" value={form.horas_semanales} onChange={e => setForm(f => ({ ...f, horas_semanales: e.target.value }))} placeholder="Ej: 4"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
            </div>
            <label className="flex items-center gap-2 pb-2 cursor-pointer select-none">
              <input type="checkbox" checked={form.es_basica_compartida} onChange={e => setForm(f => ({ ...f, es_basica_compartida: e.target.checked }))}
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-600" />
              <span className="text-xs font-semibold text-slate-300">Comisión compartida</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción u Observaciones</label>
            <textarea rows={2} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Opcional: carga horaria, temas relevantes..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-60">
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar Asignatura' : 'Guardar Asignatura')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
