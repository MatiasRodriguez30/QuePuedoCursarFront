import { useEffect, useState } from 'react'
import { GitFork, Plus, Trash2, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const MODAL_TITLE_ID = 'prereqs-modal-title'

export default function PrereqsModal({ materia, materias, prereqsByMateria, onClose, showToast }) {
  const [materiaReqId, setMateriaReqId] = useState('')
  const [tipo, setTipo] = useState('REGULARIZADA')

  const reqs = prereqsByMateria[materia.id] || []
  const opciones = materias.filter(m => m.id !== materia.id)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleAdd() {
    if (!materiaReqId) return
    try {
      await apiRequest('/prerequisitos', {
        method: 'POST',
        body: JSON.stringify({ materia_id: materia.id, materia_requerida_id: parseInt(materiaReqId), tipo }),
      })
      setMateriaReqId('')
    } catch (err) {
      showToast('error', 'Error', err.message)
    }
  }

  async function handleDelete(prereqId) {
    try {
      await apiRequest(`/prerequisitos/${prereqId}`, { method: 'DELETE' })
    } catch (err) {
      showToast('error', 'Error', err.message)
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
      <div className="bg-white w-full max-w-lg rounded-2xl border-2 border-[#78716c] p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-[#e2dcce]">
          <div>
            <h3 id={MODAL_TITLE_ID} className="text-base font-bold text-[#1a1916] flex items-center gap-2">
              <GitFork className="w-5 h-5 text-orange-700" aria-hidden="true" />
              Correlatividades Requeridas
            </h3>
            <p className="text-xs text-orange-800 font-bold mt-0.5">
              {materia.codigo} — {materia.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-[#57534e] hover:text-[#1a1916] p-1.5 rounded-lg hover:bg-[#f4efe6] transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 pt-4 flex-1 overflow-y-auto">
          {/* Formulario para agregar correlativa */}
          <div className="p-3.5 bg-[#fbf9f4] rounded-xl border border-[#d6cebf] space-y-3">
            <span className="text-xs font-bold text-[#1a1916] block">Agregar Requisito</span>
            <div className="space-y-2">
              <select
                value={materiaReqId}
                onChange={e => setMateriaReqId(e.target.value)}
                className="w-full bg-white border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1916] focus:outline-none focus:border-orange-600 min-h-[44px]"
              >
                <option value="">Seleccionar materia correlativa...</option>
                {opciones.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.codigo}] {m.nombre}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <select
                  value={tipo}
                  onChange={e => setTipo(e.target.value)}
                  className="w-full bg-white border-2 border-[#78716c] rounded-xl px-3 py-2 text-xs font-semibold text-[#1a1916] focus:outline-none focus:border-orange-600 min-h-[44px]"
                >
                  <option value="REGULARIZADA">Para Cursar: Regularizada (REG)</option>
                  <option value="APROBADA">Para Cursar: Aprobada con Final (APR)</option>
                </select>

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!materiaReqId}
                  className="px-4 py-2 bg-orange-700 hover:bg-orange-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 flex-shrink-0 disabled:opacity-40 min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de correlatividades existentes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#57534e] block">
              Correlativas configuradas ({reqs.length})
            </span>
            {reqs.length === 0 ? (
              <p className="text-xs text-[#78716c] italic py-3 text-center">
                Esta materia no tiene requisitos previos (es inicial).
              </p>
            ) : (
              <div className="space-y-1.5">
                {reqs.map(p => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white border border-[#e2dcce]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                          p.tipo === 'REGULARIZADA'
                            ? 'bg-amber-100 text-amber-950 border border-amber-400'
                            : 'bg-emerald-100 text-emerald-950 border border-emerald-500'
                        }`}
                      >
                        {p.tipo === 'REGULARIZADA' ? 'REG' : 'APR'}
                      </span>
                      <span className="text-xs font-bold text-[#1a1916] truncate">
                        {p.materia_requerida ? p.materia_requerida.nombre : 'Materia'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(p.id)}
                      title="Eliminar requisito"
                      aria-label="Eliminar requisito"
                      className="p-1.5 text-rose-700 hover:text-rose-900 rounded-lg hover:bg-rose-50 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 mt-2 border-t border-[#e2dcce] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#f4efe6] hover:bg-[#ede6d8] text-[#1a1916] border border-[#d6cebf] rounded-xl text-xs font-bold transition-colors min-h-[44px]"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}
