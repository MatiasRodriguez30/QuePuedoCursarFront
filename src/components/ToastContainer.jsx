import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

const STYLES = {
  success: { border: 'border-emerald-500/40', icon: CheckCircle, color: 'text-emerald-400' },
  warning: { border: 'border-amber-500/40', icon: AlertTriangle, color: 'text-amber-400' },
  error: { border: 'border-rose-500/40', icon: AlertCircle, color: 'text-rose-400' },
  info: { border: 'border-brand-500/40', icon: Info, color: 'text-brand-400' },
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map(t => {
        const cfg = STYLES[t.type] || STYLES.info
        const Icon = cfg.icon
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            title="Clic para cerrar"
            role="status"
            className={`pointer-events-auto cursor-pointer flex items-start gap-3 p-3.5 rounded-xl border ${cfg.border} bg-slate-900/95 shadow-2xl backdrop-blur-md transition-all duration-300`}
          >
            <Icon className={`w-5 h-5 ${cfg.color} flex-shrink-0 mt-0.5`} />
            <div className="flex-1 pr-2">
              <div className="text-xs font-bold text-white">{t.title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{t.message}</div>
            </div>
            <X className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          </div>
        )
      })}
    </div>
  )
}
