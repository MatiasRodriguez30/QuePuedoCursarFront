import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ state, onResolve }) {
  if (!state) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onResolve(false) }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      <div className="bg-[#fffdfa] w-full max-w-sm border-3 border-[#111111] p-6 shadow-[6px_6px_0px_#111111] relative">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 bg-[#fee2e2] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" aria-hidden="true" />
          </div>
          <div>
            <h3 id="confirm-dialog-title" className="text-sm font-bold uppercase tracking-tight text-[#111111]">
              {state.title}
            </h3>
            <p id="confirm-dialog-message" className="text-xs text-[#27272a] mt-1.5 leading-relaxed font-medium">
              {state.message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t-2 border-[#111111]">
          <button
            type="button"
            onClick={() => onResolve(false)}
            className="px-4 py-2 text-xs font-bold uppercase text-[#111111] bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4e4e7] transition-all min-h-[44px] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onResolve(true)}
            className="px-5 py-2 bg-[#ff1464] hover:bg-[#e00050] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-bold uppercase transition-all min-h-[44px] cursor-pointer"
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
