import { useEffect, useRef, useState } from 'react'
import { User, X } from 'lucide-react'
import TitoAvatar from './TitoAvatar'
import GraficoAnualBarras from './GraficoAnualBarras'
import { apiRequest } from '../lib/api'

function formatearFecha(fechaStr) {
  if (!fechaStr) return ''
  // Extraer año-mes-día si es formato ISO o similar para evitar desfasajes de zona horaria
  const match = String(fechaStr).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, anio, mes, dia] = match
    return `${dia}/${mes}/${anio}`
  }
  try {
    const d = new Date(fechaStr)
    if (isNaN(d.getTime())) return String(fechaStr)
    const dia = String(d.getDate()).padStart(2, '0')
    const mes = String(d.getMonth() + 1).padStart(2, '0')
    const anio = d.getFullYear()
    return `${dia}/${mes}/${anio}`
  } catch (_) {
    return String(fechaStr)
  }
}

export default function PerfilModal({ isOpen, onClose, usuarioId }) {
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null) // { status: number, message: string }
  const closeButtonRef = useRef(null)

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Cargar perfil al abrirse o al cambiar usuarioId
  useEffect(() => {
    if (!isOpen || !usuarioId) {
      setPerfil(null)
      setError(null)
      setCargando(false)
      return
    }

    let cancelado = false
    setCargando(true)
    setError(null)
    setPerfil(null)

    // Foco en botón cerrar por accesibilidad
    setTimeout(() => closeButtonRef.current?.focus(), 50)

    apiRequest(`/grupos/mio/perfil/${usuarioId}`)
      .then((data) => {
        if (!cancelado) {
          setPerfil(data)
          setCargando(false)
        }
      })
      .catch((err) => {
        if (!cancelado) {
          setError({
            status: err.status,
            message: err.message || 'No se pudo cargar el perfil',
          })
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [isOpen, usuarioId])

  if (!isOpen) return null

  const esError403 = error?.status === 403

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="perfil-modal-title"
    >
      <div className="bg-[#fffdfa] w-full max-w-lg border-3 border-[#111111] p-4 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[92vh] overflow-y-auto my-auto select-none">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            </div>
            <h2
              id="perfil-modal-title"
              className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] truncate"
            >
              Perfil de Estudiante
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de perfil"
            className="p-1.5 bg-white hover:bg-[#fee2e2] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* ── CUERPO: CARGANDO / ERROR / ÉXITO ── */}
        <div className="pt-4">
          {cargando ? (
            <div className="py-10 text-center space-y-2">
              <TitoAvatar variant="lupa" className="w-12 h-12 mx-auto" />
              <p className="text-xs font-mono font-bold uppercase text-[#111111]">
                Cargando perfil...
              </p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-3">
              <TitoAvatar variant="cafe" className="w-16 h-16 mx-auto" />
              <div
                className={`p-3 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] max-w-sm mx-auto ${
                  esError403 ? 'bg-[#fff9db]' : 'bg-[#fee2e2]'
                }`}
                role="alert"
              >
                <p
                  className={`text-xs font-mono font-bold leading-snug ${
                    esError403 ? 'text-[#111111]' : 'text-[#b91c1c]'
                  }`}
                >
                  {error.message || 'No se pudo cargar el perfil'}
                </p>
              </div>
            </div>
          ) : perfil ? (
            <div className="space-y-4">
              {/* 1. Apodo grande + total de materias aprobadas */}
              <div className="border-b-2 border-[#111111] pb-3">
                <h3 className="font-display text-lg sm:text-xl font-bold uppercase text-[#111111] truncate">
                  {perfil.apodo || 'Estudiante'}
                </h3>
                <p className="text-xs font-mono text-[#52525b] mt-0.5">
                  {perfil.total_aprobadas ?? 0}{' '}
                  {perfil.total_aprobadas === 1
                    ? 'materia aprobada'
                    : 'materias aprobadas'}
                </p>
              </div>

              {/* 2. Gráfico anual de barras */}
              <div className="border-2 border-[#111111] bg-[#f4f0e6] p-3 shadow-[2px_2px_0px_#111111]">
                <span className="block text-[10px] font-mono font-bold uppercase text-[#71717a] tracking-wider mb-1">
                  Aprobadas por Año
                </span>
                <GraficoAnualBarras datos={perfil.por_anio} />
              </div>

              {/* 3. Lista de materias aprobadas */}
              <div className="border-2 border-[#111111] bg-white p-3 shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center justify-between pb-2 border-b border-[#111111] mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#71717a] tracking-wider">
                    Materias Aprobadas ({perfil.materias?.length || 0})
                  </span>
                </div>

                {!perfil.materias || perfil.materias.length === 0 ? (
                  <p className="text-xs font-mono text-[#71717a] py-3 text-center">
                    Todavía no hay materias aprobadas registradas.
                  </p>
                ) : (
                  <ul
                    className="space-y-1.5 max-h-48 overflow-y-auto pr-1"
                    aria-label="Lista de materias aprobadas"
                  >
                    {perfil.materias.map((m, idx) => (
                      <li
                        key={m.materia_id ?? m.codigo ?? idx}
                        className="flex items-center justify-between p-1.5 bg-[#f4f0e6] border border-[#111111] text-xs font-mono gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {m.codigo && (
                            <span className="font-bold text-[#111111] bg-white border border-[#111111] px-1 py-0.5 text-[10px] flex-shrink-0">
                              {m.codigo}
                            </span>
                          )}
                          <span className="font-bold text-[#111111] truncate">
                            {m.nombre}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#52525b] font-bold flex-shrink-0">
                          {formatearFecha(m.fecha_aprobacion)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
