import { useState } from 'react'
import { GitFork, Plus, PlusCircle, Trash2, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

export default function PrereqsModal({ materia, materias, prereqsByMateria, onClose, showToast }) {
  const [materiaReqId, setMateriaReqId] = useState('')
  const [tipo, setTipo] = useState('REGULARIZADA')

  const reqs = prereqsByMateria[materia.id] || []
  const opciones = materias.filter(m => m.id !== materia.id)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-brand-400" />
              Correlatividades Requeridas
            </h3>
            <p className="text-xs text-brand-400 font-medium mt-0.5">{materia.codigo} — {materia.nombre}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">Requisitos actuales para cursarla:</h4>
          {reqs.length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-slate-800">
              Esta asignatura no posee correlatividades obligatorias para cursar.
            </div>
          ) : (
            <div className="space-y-2">
              {reqs.map(p => {
                const badgeColor = p.tipo === 'REGULARIZADA' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                return (
                  <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{p.materia_requerida?.codigo}</span>
                      <span className="text-xs font-semibold text-slate-200">{p.materia_requerida?.nombre}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>{p.tipo}</span>
                    </div>
                    <button onClick={() => handleDelete(p.id)} title="Eliminar requisito" className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-800/90 bg-slate-900/50 rounded-xl p-3 mt-2">
          <h4 className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5 text-brand-400" />
            Agregar Requisito Previo
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Materia Predecesora</label>
              <select value={materiaReqId} onChange={e => setMateriaReqId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500">
                <option value="">Seleccionar...</option>
                {opciones.map(m => <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Condición Exigida</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-brand-500">
                  <option value="REGULARIZADA">🟡 Regularizada</option>
                  <option value="APROBADA">🟢 Aprobada (Final)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="button" onClick={handleAdd} className="w-full py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Vincular
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
