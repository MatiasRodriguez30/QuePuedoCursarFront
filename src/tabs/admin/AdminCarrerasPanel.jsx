import { useState } from 'react'
import { Edit3, GraduationCap, Plus, Trash2 } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import CarreraModal from '../../components/CarreraModal'

export default function AdminCarrerasPanel({ ctx, showToast, showConfirm }) {
  const [editingCarrera, setEditingCarrera] = useState(undefined)

  async function handleDelete(c) {
    const ok = await showConfirm(
      `¿Eliminar "${c.nombre}"?`,
      'Se eliminarán todas sus materias, correlatividades y el progreso que cualquier usuario tenga en ellas. Esta acción no se puede deshacer.'
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#e2dcce]">
        <div>
          <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-orange-700" />
            Carreras
          </h3>
          <p className="text-xs text-[#57534e]">
            Cada carrera tiene su propio plan de materias y correlatividades, totalmente independiente.
          </p>
        </div>
        <button
          onClick={() => setEditingCarrera(null)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Carrera</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ctx.carreras.map(c => (
          <div
            key={c.id}
            className="notebook-card rounded-xl p-4 border-2 border-[#e2dcce] bg-white flex flex-col justify-between gap-3"
          >
            <div>
              <h4 className="text-sm font-bold text-[#1a1916] leading-snug">{c.nombre}</h4>
              {c.plan_nombre && <p className="text-xs text-[#57534e] mt-0.5">{c.plan_nombre}</p>}
              <p className="text-[11px] text-[#78716c] mt-2 font-medium">
                {c.horas_excepcion_ultimo_anio != null
                  ? `Excepción de Adelanto de Nivel: ${c.horas_excepcion_ultimo_anio} hs`
                  : 'Sin excepción de Adelanto de Nivel configurada'}
              </p>
            </div>
            <div className="flex items-center justify-end gap-1 pt-2 border-t border-[#e2dcce]">
              <button
                onClick={() => setEditingCarrera(c)}
                title="Editar Carrera"
                aria-label={`Editar carrera ${c.nombre}`}
                className="p-1.5 text-[#57534e] hover:text-[#1a1916] rounded-lg hover:bg-[#f4efe6] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c)}
                title="Eliminar Carrera"
                aria-label={`Eliminar carrera ${c.nombre}`}
                className="p-1.5 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
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
