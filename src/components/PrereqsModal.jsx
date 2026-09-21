import { useEffect, useRef, useState } from 'react'
import { GitFork, Plus, Trash2, X } from 'lucide-react'
import { apiRequest } from '../lib/api'

const MODAL_TITLE_ID = 'prereqs-modal-title'

export default function PrereqsModal({ materia, materias, prereqsByMateria, onClose, showToast }) {
  const [materiaReqId, setMateriaReqId] = useState('')
  const [tipo, setTipo] = useState('REGULARIZADA')
  const [adding, setAdding] = useState(false)
  const closeRef = useRef(null)

  const reqs = prereqsByMateria[materia.id] || []
  const opciones = materias.filter(m => m.id !== materia.id)

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleAdd(e) {
    e.preventDefault()
    if (!materiaReqId) return
    setAdding(true)
    try {
      await apiRequest('/prerequisitos', {
        method: 'POST',
        body: JSON.stringify({ materia_id: materia.id, materia_requerida_id: parseInt(materiaReqId, 10), tipo }),
      })
      setMateriaReqId('')
    } catch (err) {
      showToast('error', 'Error', err.message)
    } finally {
      setAdding(false)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={MODAL_TITLE_ID}
    >
      <div className="bg-white w-full max-w-lg border-3 border-[#111111] p-5 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111]">
          <div>
            <h3 id={MODAL_TITLE_ID} className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] flex items-center gap-2">
              <GitFork className="w-4 h-4 text-[#ff1464]" aria-hidden="true" />
              Correlatividades Requeridas
            </h3>
            <p className="text-xs font-mono font-bold text-[#52525b] mt-0.5">
              {materia.codigo} — {materia.nombre}
            </p>
          </div>
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

        {/* Lista de correlativas actuales (con scroll si hay muchas) */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 max-h-[45vh]">
          {reqs.length === 0 ? (
            <div className="p-4 bg-[#f4f0e6] border-2 border-dashed border-[#111111] text-center">
              <p className="text-xs font-mono text-[#52525b]">
                Esta materia no tiene correlatividades previas configuradas (ingreso directo).
              </p>
            </div>
          ) : (
            reqs.map(r => {
              const nombreReq = r.materia_requerida?.nombre || `Materia #${r.materia_requerida_id}`
              const codigoReq = r.materia_requerida?.codigo || ''
              const esAprobada = r.tipo === 'APROBADA'

              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 p-2.5 bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase border border-[#111111] shrink-0 ${
                        esAprobada ? 'bg-[#ccff00] text-[#111111]' : 'bg-white text-[#111111]'
                      }`}
                    >
                      {esAprobada ? 'Final Aprobado' : 'Cursada Regular'}
                    </span>
                    <span className="text-xs font-bold font-mono text-[#111111] truncate">
                      {codigoReq && `${codigoReq} - `}{nombreReq}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(r.id)}
                    title="Eliminar correlatividad"
                    aria-label={`Eliminar requisito ${nombreReq}`}
                    className="p-1 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#991b1b] border border-[#111111] cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Formulario para agregar nuevo requisito */}
        <form onSubmit={handleAdd} className="pt-3 border-t-2 border-[#111111] space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-[#111111]">
            + Agregar Requisito Previo
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label htmlFor="req-materia" className="sr-only">Materia Requerida</label>
              <select
                id="req-materia"
                value={materiaReqId}
                onChange={e => setMateriaReqId(e.target.value)}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-2.5 py-1.5 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[40px] cursor-pointer"
              >
                <option value="">Seleccionar materia previa...</option>
                {opciones.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.codigo ? `[${o.codigo}] ` : ''}{o.nombre} ({o.anio || 0}º año)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="req-tipo" className="sr-only">Tipo de Exigencia</label>
              <select
                id="req-tipo"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-2 py-1.5 text-xs font-mono font-bold text-[#111111] focus:outline-none focus:bg-white min-h-[40px] cursor-pointer"
              >
                <option value="REGULARIZADA">Cursada Regular</option>
                <option value="APROBADA">Final Aprobado</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white hover:bg-[#e4e4e7] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[38px]"
            >
              Listo
            </button>
            <button
              type="submit"
              disabled={!materiaReqId || adding}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[38px] disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Agregar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
