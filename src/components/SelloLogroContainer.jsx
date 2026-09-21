import { Award, CheckCircle2, Sparkles, X } from 'lucide-react'
import TitoAvatar from './TitoAvatar'

export default function SelloLogroContainer({ logros = [], onDescartar }) {
  if (!logros || logros.length === 0) return null

  return (
    <aside
      aria-label="Sellos de logros del grupo"
      className="fixed top-14 sm:top-16 left-3 right-3 sm:left-auto sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none pt-[env(safe-area-inset-top)]"
    >
      {logros.map((logro, index) => {
        const esAprobada = logro.estado === 'PROMOCIONADA'
        // Rotación sutil estilo sello risograph (desactivada si prefiere reducción de movimiento)
        const rotacionClass = index === 0 ? '-rotate-1' : index === 1 ? 'rotate-1' : '-rotate-0.5'

        return (
          <div
            key={logro.id}
            role="status"
            aria-live="polite"
            className={`stamp-clack-animation pointer-events-auto bg-[#fffdfa] border-3 border-[#111111] shadow-[4px_4px_0px_#111111] p-3 flex items-start gap-3 transition-transform motion-reduce:rotate-0 motion-reduce:transition-none ${rotacionClass}`}
          >
            {/* Sello gráfico con Tito Festejo */}
            <div className="w-11 h-11 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center p-0.5 flex-shrink-0">
              <TitoAvatar variant="festejo" className="w-10 h-10" />
            </div>

            {/* Contenido del logro */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                {esAprobada ? (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#ccff00] text-[#111111] border border-[#111111]">
                    <Sparkles className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>Final Aprobado</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase px-1.5 py-0.2 bg-[#ff1464] text-[#111111] border border-[#111111]">
                    <CheckCircle2 className="w-2.5 h-2.5" aria-hidden="true" />
                    <span>Cursada Regular</span>
                  </span>
                )}
                <span className="text-[10px] font-mono text-[#52525b] font-bold">¡En vivo!</span>
              </div>

              <p className="text-xs font-mono text-[#111111] leading-snug">
                <strong className="text-sm font-display uppercase tracking-wide block truncate">
                  {logro.apodo}
                </strong>
                {esAprobada ? 'aprobó' : 'regularizó'}{' '}
                <span className="font-bold underline decoration-2 decoration-[#111111]">
                  {logro.materia_nombre}
                </span>
              </p>
            </div>

            {/* Botón de cierre manual accesible */}
            <button
              type="button"
              onClick={() => onDescartar?.(logro.id)}
              aria-label={`Cerrar logro de ${logro.apodo}`}
              title="Cerrar sello"
              className="p-1 bg-white hover:bg-[#ff1464] hover:text-white text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </aside>
  )
}
