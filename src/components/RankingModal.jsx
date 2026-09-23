import { useEffect, useRef, useState } from 'react'
import { Trophy, X } from 'lucide-react'
import TitoAvatar from './TitoAvatar'
import { apiRequest } from '../lib/api'

export default function RankingModal({ isOpen, onClose, usuario }) {
  const [ranking, setRanking] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    let cancelado = false
    setCargando(true)
    setError(null)
    setRanking([])

    setTimeout(() => closeButtonRef.current?.focus(), 50)

    async function fetchRanking() {
      try {
        const data = await apiRequest('/grupos/mio/ranking')
        if (!cancelado) {
          setRanking(Array.isArray(data) ? data : [])
          setCargando(false)
        }
      } catch (err) {
        if (!cancelado) {
          setError({
            status: err.status,
            message: err.message || 'No se pudo cargar el ranking',
          })
          setCargando(false)
        }
      }
    }

    fetchRanking()

    return () => {
      cancelado = true
    }
  }, [isOpen])

  // Manejo de tecla Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ranking-modal-title"
    >
      <div className="bg-[#fffdfa] w-full max-w-lg border-3 border-[#111111] p-4 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[92vh] overflow-y-auto my-auto select-none">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            </div>
            <h2
              id="ranking-modal-title"
              className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] truncate"
            >
              Ranking del Grupo
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de ranking"
            className="p-1.5 bg-white hover:bg-[#fee2e2] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo del modal según estado */}
        {cargando ? (
          <div className="py-10 text-center space-y-2">
            <TitoAvatar variant="lupa" className="w-12 h-12 mx-auto" />
            <p className="text-xs font-mono font-bold uppercase text-[#111111]">
              Cargando ranking...
            </p>
          </div>
        ) : error ? (
          error.status === 403 ? (
            <div className="py-8 text-center space-y-3">
              <TitoAvatar variant="cafe" className="w-16 h-16 mx-auto" />
              <div className="p-3 bg-[#fff9db] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] max-w-sm mx-auto">
                <p className="text-xs font-mono font-bold text-[#111111] leading-snug">
                  {error.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center space-y-3">
              <TitoAvatar variant="cafe" className="w-16 h-16 mx-auto" />
              <div className="p-3 bg-[#fee2e2] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] max-w-sm mx-auto">
                <p className="text-xs font-mono font-bold text-[#b91c1c]">
                  No se pudo cargar el ranking
                </p>
              </div>
            </div>
          )
        ) : (
          <div className="space-y-3 pt-4">
            {ranking.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <TitoAvatar variant="mate" className="w-12 h-12 mx-auto" />
                <p className="text-xs font-mono text-[#52525b]">
                  No hay miembros en el ranking todavía.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5 max-h-80 overflow-y-auto pr-1" aria-label="Ranking de miembros del grupo">
                {ranking.map((item, index) => {
                  const pos = item.posicion ?? index + 1
                  const esYo = Boolean(item.soy_yo ?? (usuario && item.usuario_id === usuario.id))
                  let posDisplay = `${pos}°`
                  if (pos === 1) posDisplay = '🥇'
                  else if (pos === 2) posDisplay = '🥈'
                  else if (pos === 3) posDisplay = '🥉'

                  const materias = item.materias_aprobadas ?? 0
                  const materiasTexto = `${materias} ${materias === 1 ? 'materia' : 'materias'}`

                  return (
                    <li
                      key={item.usuario_id ?? index}
                      className={`flex items-center justify-between p-2 border-2 border-[#111111] text-xs font-mono shadow-[2px_2px_0px_#111111] ${
                        esYo ? 'bg-[#ccff00]' : 'bg-[#f4f0e6]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 bg-[#fffdfa] border border-[#111111] flex items-center justify-center font-bold text-xs text-[#111111] flex-shrink-0">
                          {posDisplay}
                        </div>
                        <span className="font-bold text-[#111111] truncate max-w-[130px] sm:max-w-[200px]">
                          {item.apodo || 'Cobayo'}
                        </span>
                        {esYo && (
                          <span className="text-[9px] font-bold px-1 py-0.2 bg-[#111111] text-[#ccff00] border border-[#111111] flex-shrink-0">
                            VOS
                          </span>
                        )}
                      </div>

                      <div className="font-bold text-[#111111] text-xs flex-shrink-0">
                        {materiasTexto}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
