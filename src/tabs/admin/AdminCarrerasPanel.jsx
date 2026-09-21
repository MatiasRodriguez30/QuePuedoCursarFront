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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#111111]">
        <div>
          <h2 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            Carreras Registradas
          </h2>
          <p className="text-xs font-mono text-[#52525b] mt-0.5">
            Cada carrera dispone de su propio plan de estudios y correlatividades independiente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditingCarrera(null)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>Nueva Carrera</span>
        </button>
      </div>

      {ctx.carreras.length === 0 ? (
        <div className="p-8 text-center bg-[#f4f0e6] border-2 border-dashed border-[#111111]">
          <p className="font-display text-sm font-bold uppercase text-[#111111]">No hay carreras cargadas</p>
          <p className="text-xs font-mono text-[#52525b] mt-1">Usá el botón "+ Nueva Carrera" para dar de alta la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ctx.carreras.map(c => (
            <div
              key={c.id}
              className="bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm p-3.5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#111111] leading-snug">{c.nombre}</h3>
                  <span className="bg-[#111111] text-[#ccff00] px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase shrink-0">
                    ID #{c.id}
                  </span>
                </div>
                {c.plan_nombre && (
                  <p className="text-xs font-mono text-[#52525b] mt-1">Plan: {c.plan_nombre}</p>
                )}
                <div className="mt-2.5 p-2 bg-white border border-[#111111] text-[11px] font-mono text-[#27272a]">
                  {c.horas_excepcion_ultimo_anio != null
                    ? `Adelanto de nivel: ${c.horas_excepcion_ultimo_anio} hs/sem`
                    : 'Sin excepción de adelanto'}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#111111]">
                <button
                  type="button"
                  onClick={() => setEditingCarrera(c)}
                  title="Editar Carrera"
                  aria-label={`Editar carrera ${c.nombre}`}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#fff9db] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer min-h-[38px]"
                >
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c)}
                  title="Eliminar Carrera"
                  aria-label={`Eliminar carrera ${c.nombre}`}
                  className="px-2.5 py-1.5 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#991b1b] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase flex items-center gap-1 cursor-pointer min-h-[38px]"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Borrar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingCarrera !== undefined && (
        <CarreraModal carrera={editingCarrera} onClose={() => setEditingCarrera(undefined)} showToast={showToast} />
      )}
    </div>
  )
}
