import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

const STYLES = {
  success: {
    bg: 'bg-[#f0fdf4]',
    border: 'border-2 border-emerald-600',
    titleColor: 'text-emerald-950',
    textColor: 'text-[#14532d]',
    iconColor: 'text-emerald-700',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-[#fffbeb]',
    border: 'border-2 border-amber-600',
    titleColor: 'text-amber-950',
    textColor: 'text-[#78350f]',
    iconColor: 'text-amber-700',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-[#fef2f2]',
    border: 'border-2 border-rose-600',
    titleColor: 'text-rose-950',
    textColor: 'text-[#7f1d1d]',
    iconColor: 'text-rose-700',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-[#f0f9ff]',
    border: 'border-2 border-sky-600',
    titleColor: 'text-sky-950',
    textColor: 'text-[#075985]',
    iconColor: 'text-sky-700',
    icon: Info,
  },
}

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label="Notificaciones"
      className="fixed bottom-20 md:bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
    >
      {toasts.map(t => {
        const cfg = STYLES[t.type] || STYLES.info
        const Icon = cfg.icon
        return (
          <div
            key={t.id}
            onClick={() => onDismiss(t.id)}
            title="Clic para cerrar"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`pointer-events-auto cursor-pointer flex items-start gap-3 p-3.5 rounded-xl ${cfg.bg} ${cfg.border} shadow-lg transition-all`}
          >
            <Icon className={`w-5 h-5 ${cfg.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />
            <div className="flex-1 pr-2">
              <div className={`text-xs font-bold ${cfg.titleColor}`}>{t.title}</div>
              <div className={`text-xs ${cfg.textColor} mt-0.5 font-medium leading-snug`}>
                {t.message}
              </div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                onDismiss(t.id)
              }}
              aria-label="Cerrar notificación"
              className="text-[#57534e] hover:text-[#1a1916] transition-colors p-1"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
