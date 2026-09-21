import { AlertCircle, AlertTriangle, CheckCircle2, Info, Undo2, X } from 'lucide-react'

const STYLES = {
  success: {
    bg: 'bg-[#ccff00]',
    border: 'border-2 border-[#111111]',
    titleColor: 'text-[#111111]',
    textColor: 'text-[#111111]',
    iconColor: 'text-[#111111]',
    shadow: 'shadow-[4px_4px_0px_#111111]',
    icon: CheckCircle2,
  },
  warning: {
    bg: 'bg-[#fffbeb]',
    border: 'border-2 border-[#111111]',
    titleColor: 'text-[#111111]',
    textColor: 'text-[#111111]',
    iconColor: 'text-[#d97706]',
    shadow: 'shadow-[4px_4px_0px_#111111]',
    icon: AlertTriangle,
  },
  error: {
    bg: 'bg-[#fee2e2]',
    border: 'border-2 border-[#111111]',
    titleColor: 'text-[#111111]',
    textColor: 'text-[#111111]',
    iconColor: 'text-[#dc2626]',
    shadow: 'shadow-[4px_4px_0px_#111111]',
    icon: AlertCircle,
  },
  info: {
    bg: 'bg-[#dbeafe]',
    border: 'border-2 border-[#111111]',
    titleColor: 'text-[#111111]',
    textColor: 'text-[#111111]',
    iconColor: 'text-[#0047ff]',
    shadow: 'shadow-[4px_4px_0px_#111111]',
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
      className="fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:right-6 z-50 flex flex-col gap-3 max-w-md pointer-events-none"
    >
      {toasts.map(t => {
        const cfg = STYLES[t.type] || STYLES.info
        const Icon = cfg.icon
        return (
          <div
            key={t.id}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 ${cfg.bg} ${cfg.border} ${cfg.shadow} transition-all`}
          >
            <Icon className={`w-5 h-5 ${cfg.iconColor} flex-shrink-0 mt-0.5`} aria-hidden="true" />
            <div className="flex-1 pr-1 min-w-0">
              <div className={`text-xs font-bold uppercase tracking-wider ${cfg.titleColor}`}>{t.title}</div>
              <div className={`text-xs ${cfg.textColor} mt-0.5 font-medium leading-snug break-words`}>
                {t.message}
              </div>
              {t.action && (
                <button
                  type="button"
                  onClick={() => {
                    t.action.onClick?.()
                    onDismiss(t.id)
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase bg-[#111111] text-[#ccff00] hover:bg-[#ff1464] hover:text-white border border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer transition-colors"
                >
                  <Undo2 className="w-3 h-3" aria-hidden="true" />
                  <span>{t.action.label || 'Deshacer'}</span>
                </button>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Cerrar notificación"
              className="text-[#111111] hover:text-[#ff1464] transition-colors p-1"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
