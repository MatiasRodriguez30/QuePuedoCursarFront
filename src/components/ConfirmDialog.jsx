import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ state, onResolve }) {
  if (!state) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onResolve(false) }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="bg-white w-full max-w-sm rounded-2xl border-2 border-[#78716c] p-6 shadow-2xl relative">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-rose-100 border border-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-700" aria-hidden="true" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-sm font-bold text-[#1a1916]">
              {state.title}
            </h3>
            <p id="confirm-dialog-message" className="text-xs text-[#57534e] mt-1.5 leading-relaxed font-medium">
              {state.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-[#e2dcce]">
          <button
            onClick={() => onResolve(false)}
            className="px-4 py-2 text-xs font-bold text-[#57534e] hover:text-[#1a1916] transition-colors min-h-[44px]"
          >
            Cancelar
          </button>
          <button
            onClick={() => onResolve(true)}
            className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors min-h-[44px]"
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
