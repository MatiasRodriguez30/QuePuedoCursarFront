import { useState } from 'react'
import { Edit3, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import CarreraModal from '../../components/CarreraModal'

export default function AdminCarrerasPanel({ ctx, showToast, showConfirm }) {
  const [editingCarrera, setEditingCarrera] = useState(undefined) // undefined = cerrado, null = nueva, obj = editar

  async function handleDelete(c) {
    const ok = await showConfirm(
      `¿Eliminar "${c.nombre}"?`,
      'Se eliminarán TODAS sus materias, correlatividades y el progreso que cualquier usuario tenga en ellas. Esta acción no se puede deshacer.'
    )
    if (!ok) return
    try {
      await apiRequest(`/carreras/${c.id}`, { method: 'DELETE' })
    } catch (err) {
      showToast('error', 'Error', 'No se pudo eliminar: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-400" />
            Carreras
          </h3>
          <p className="text-xs text-slate-400">Cada carrera tiene su propio plan de materias y correlatividades, totalmente independiente de las demás.</p>
        </div>
        <button onClick={() => setEditingCarrera(null)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/25 transition-all whitespace-nowrap">
          <Plus className="w-4 h-4" />
          <span>Nueva Carrera</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ctx.carreras.map(c => (
          <div key={c.id} className="glass-card rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-white leading-snug">{c.nombre}</h4>
              {c.plan_nombre && <p className="text-xs text-slate-400 mt-0.5">{c.plan_nombre}</p>}
              <p className="text-[11px] text-slate-500 mt-2">
                {c.horas_excepcion_ultimo_anio != null
                  ? `Excepción de Adelanto de Nivel: ${c.horas_excepcion_ultimo_anio} hs`
                  : 'Sin excepción de Adelanto de Nivel configurada'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-slate-800/80">
              <button onClick={() => setEditingCarrera(c)} title="Editar Carrera" className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(c)} title="Eliminar Carrera" className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingCarrera !== undefined && (
        <CarreraModal carrera={editingCarrera} onClose={() => setEditingCarrera(undefined)} showToast={showToast} />
      )}
    </div>
  )
}
