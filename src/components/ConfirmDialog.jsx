import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ state, onResolve }) {
  if (!state) return null
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onResolve(false) }}
    >
      <div className="glass-panel w-full max-w-sm rounded-2xl border border-slate-700/80 p-6 shadow-2xl relative">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{state.title}</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{state.message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-slate-800">
          <button onClick={() => onResolve(false)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={() => onResolve(true)} className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-500/25 transition-all">
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
