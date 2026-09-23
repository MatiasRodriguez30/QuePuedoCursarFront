import { useEffect, useRef, useState } from 'react'
import { Check, Copy, LogOut, Radio, Trophy, Users, X } from 'lucide-react'
import TitoAvatar from './TitoAvatar'
import {
  copiarAlPortapapeles,
  validarApodo,
  validarCodigoGrupo,
  validarNombreGrupo,
} from '../lib/logrosLogic'

export default function GrupoModal({
  isOpen,
  onClose,
  grupo,
  cargando,
  disponible,
  usuario,
  onCrearGrupo,
  onUnirseGrupo,
  onCambiarPreferencia,
  onSalirGrupo,
  onActualizarApodo,
  onAbrirRanking,
  showConfirm,
  showToast,
}) {
  const [tab, setTab] = useState('crear') // 'crear' | 'unirse'
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [codigoUnirse, setCodigoUnirse] = useState('')
  const [apodoNuevo, setApodoNuevo] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState(null)
  const closeButtonRef = useRef(null)

  // Sincronizar apodo al abrir o al cambiar usuario/grupo
  useEffect(() => {
    if (isOpen) {
      setApodoNuevo(usuario?.apodo || grupo?.yo?.apodo || '')
      setErrorMensaje(null)
      // Focus accesible en el botón de cerrar o primer elemento
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    }
  }, [isOpen, usuario?.apodo, grupo?.yo?.apodo])

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

  // ── Acciones ──────────────────────────────────────────────────────────────

  async function handleCopiarCodigo() {
    const codigo = grupo?.codigo
    if (!codigo) return
    const exito = await copiarAlPortapapeles(codigo)
    if (exito) {
      setCopiado(true)
      showToast?.('success', '¡Copiado!', 'Código copiado al portapapeles')
      setTimeout(() => setCopiado(false), 2000)
    } else {
      showToast?.('error', 'Error', 'No se pudo copiar el código')
    }
  }

  async function handleCrearSubmit(e) {
    e.preventDefault()
    setErrorMensaje(null)
    const validacion = validarNombreGrupo(nombreNuevo)
    if (!validacion.valido) {
      setErrorMensaje(validacion.error)
      return
    }

    setSubmitting(true)
    const res = await onCrearGrupo(validacion.valor)
    setSubmitting(false)

    if (res?.ok) {
      setNombreNuevo('')
    } else if (res?.error) {
      setErrorMensaje(res.error)
    }
  }

  async function handleUnirseSubmit(e) {
    e.preventDefault()
    setErrorMensaje(null)
    const validacion = validarCodigoGrupo(codigoUnirse)
    if (!validacion.valido) {
      setErrorMensaje(validacion.error)
      return
    }

    setSubmitting(true)
    const res = await onUnirseGrupo(validacion.valor)
    setSubmitting(false)

    if (res?.ok) {
      setCodigoUnirse('')
    } else if (res?.error) {
      setErrorMensaje(res.error)
    }
  }

  async function handleGuardarApodo(e) {
    e.preventDefault()
    setErrorMensaje(null)
    const validacion = validarApodo(apodoNuevo)
    if (!validacion.valido) {
      setErrorMensaje(validacion.error)
      return
    }

    setSubmitting(true)
    const res = await onActualizarApodo(validacion.valor)
    setSubmitting(false)

    if (!res?.ok && res?.error) {
      setErrorMensaje(res.error)
    }
  }

  async function handleSalir() {
    if (!showConfirm) {
      await onSalirGrupo()
      return
    }

    const confirmado = await showConfirm({
      title: '¿Salir del grupo?',
      message: `Vas a abandonar "${grupo.nombre}". Dejarás de compartir tus logros y ya no recibirás los del grupo.`,
      confirmLabel: 'Sí, salir del grupo',
    })

    if (confirmado) {
      await onSalirGrupo()
    }
  }

  const comparteProgreso = Boolean(grupo?.yo?.comparte ?? true)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="grupo-modal-title"
    >
      <div className="bg-[#fffdfa] w-full max-w-lg border-3 border-[#111111] p-4 sm:p-6 shadow-[6px_6px_0px_#111111] relative max-h-[92vh] overflow-y-auto my-auto select-none">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#111111] gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-[#111111]" aria-hidden="true" />
            </div>
            <h2
              id="grupo-modal-title"
              className="font-display text-sm sm:text-base font-bold uppercase text-[#111111] truncate"
            >
              {grupo ? grupo.nombre : 'Grupo de Estudio'}
            </h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de grupo"
            className="p-1.5 bg-white hover:bg-[#fee2e2] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center transition-all flex-shrink-0"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Mensaje de error general si ocurrió */}
        {errorMensaje && (
          <div
            className="mt-3 p-2.5 bg-[#fee2e2] border-2 border-[#111111] text-xs font-mono font-bold text-[#b91c1c] shadow-[2px_2px_0px_#111111] flex items-start justify-between gap-2"
            role="alert"
          >
            <span>{errorMensaje}</span>
            <button
              type="button"
              onClick={() => setErrorMensaje(null)}
              className="text-[#111111] font-bold px-1 hover:bg-white"
              aria-label="Descartar mensaje de error"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── CUERPO: 3 CASOS (NO DISPONIBLE / SIN GRUPO / CON GRUPO) ── */}

        {!disponible ? (
          <div className="py-8 text-center space-y-3">
            <TitoAvatar variant="cafe" className="w-16 h-16 mx-auto" />
            <h3 className="font-display text-sm font-bold uppercase text-[#111111]">
              Grupos en mantenimiento
            </h3>
            <p className="text-xs font-mono text-[#52525b] max-w-xs mx-auto">
              La funcionalidad de grupos no está disponible en este momento en el servidor.
            </p>
          </div>
        ) : cargando ? (
          <div className="py-10 text-center space-y-2">
            <TitoAvatar variant="lupa" className="w-12 h-12 mx-auto" />
            <p className="text-xs font-mono font-bold uppercase text-[#111111]">
              Consultando tu grupo...
            </p>
          </div>
        ) : !grupo ? (
          /* ── ESTADO A: SIN GRUPO ────────────────────────────────────────── */
          <div className="space-y-4 pt-4">
            {/* Empty state fanzine */}
            <div className="flex items-center gap-3 p-3 bg-[#f4f0e6] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <TitoAvatar variant="mate" className="w-14 h-14 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-mono font-bold text-[#111111] leading-snug">
                  Estudiar con amigos rinde el doble.
                </p>
                <p className="text-[11px] font-mono text-[#52525b] mt-0.5">
                  Creá tu grupo o sumate con un código para ver y festejar logros en vivo cuando aprueben materias.
                </p>
              </div>
            </div>

            {/* Selector de modo: Crear vs Unirse */}
            <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Opciones de grupo">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'crear'}
                onClick={() => { setTab('crear'); setErrorMensaje(null) }}
                className={`py-2 px-3 text-xs font-mono font-bold uppercase border-2 border-[#111111] transition-all min-h-[44px] cursor-pointer ${
                  tab === 'crear'
                    ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464] translate-x-0.5'
                    : 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#fff9db]'
                }`}
              >
                Crear Grupo
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'unirse'}
                onClick={() => { setTab('unirse'); setErrorMensaje(null) }}
                className={`py-2 px-3 text-xs font-mono font-bold uppercase border-2 border-[#111111] transition-all min-h-[44px] cursor-pointer ${
                  tab === 'unirse'
                    ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464] translate-x-0.5'
                    : 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#fff9db]'
                }`}
              >
                Unirse con Código
              </button>
            </div>

            {/* Formulario Crear */}
            {tab === 'crear' && (
              <form onSubmit={handleCrearSubmit} className="space-y-3 pt-1">
                <div>
                  <label
                    htmlFor="nombre-grupo-input"
                    className="block text-[11px] font-mono font-bold uppercase text-[#111111] mb-1"
                  >
                    Nombre del grupo <span className="text-[#ff1464]">*</span>
                  </label>
                  <input
                    id="nombre-grupo-input"
                    type="text"
                    required
                    maxLength={40}
                    value={nombreNuevo}
                    onChange={e => setNombreNuevo(e.target.value)}
                    placeholder="Ej: Los Cobayos de Sistemas"
                    className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
                  />
                  <span className="block text-[10px] font-mono text-[#71717a] mt-1">
                    Entre 2 y 40 caracteres. Podrás invitar compañeros compartiendo un código.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-[#ccff00] hover:bg-[#b8e600] active:translate-x-0.5 active:translate-y-0.5 text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer min-h-[44px] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creando grupo...' : '★ Fundar Grupo'}
                </button>
              </form>
            )}

            {/* Formulario Unirse */}
            {tab === 'unirse' && (
              <form onSubmit={handleUnirseSubmit} className="space-y-3 pt-1">
                <div>
                  <label
                    htmlFor="codigo-grupo-input"
                    className="block text-[11px] font-mono font-bold uppercase text-[#111111] mb-1"
                  >
                    Código de Invitación <span className="text-[#ff1464]">*</span>
                  </label>
                  <input
                    id="codigo-grupo-input"
                    type="text"
                    required
                    value={codigoUnirse}
                    onChange={e => setCodigoUnirse(e.target.value.toUpperCase())}
                    placeholder="Ej: A8F2K9"
                    className="w-full bg-[#f4f0e6] border-2 border-[#111111] px-3 py-2 text-xs font-mono font-bold text-[#111111] tracking-widest placeholder-[#71717a] focus:outline-none focus:bg-white min-h-[44px]"
                  />
                  <span className="block text-[10px] font-mono text-[#71717a] mt-1">
                    Pedile el código al creador o a cualquier miembro de tu grupo.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 bg-[#ff1464] hover:bg-[#e00050] active:translate-x-0.5 active:translate-y-0.5 text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] text-xs font-mono font-bold uppercase tracking-wider cursor-pointer min-h-[44px] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Uniendo...' : '★ Unirse al Grupo'}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* ── ESTADO B: CON GRUPO ────────────────────────────────────────── */
          <div className="space-y-4 pt-4">
            {/* 1. Tarjeta Código de Invitación con botón Copiar */}
            <div className="p-3.5 bg-[#f4f0e6] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono font-bold uppercase text-[#71717a] tracking-wider">
                  Código de Invitación
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-[#ccff00] text-[#111111] border border-[#111111]">
                  {grupo.miembros?.length || 1} {grupo.miembros?.length === 1 ? 'miembro' : 'miembros'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white border-2 border-[#111111] px-3 py-2 font-mono text-sm font-bold tracking-widest text-[#111111] select-all truncate">
                  {grupo.codigo}
                </div>
                <button
                  type="button"
                  onClick={handleCopiarCodigo}
                  aria-label="Copiar código de invitación"
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-bold uppercase border-2 border-[#111111] cursor-pointer min-h-[44px] transition-all shadow-[2px_2px_0px_#111111] ${
                    copiado
                      ? 'bg-[#ccff00] text-[#111111]'
                      : 'bg-white hover:bg-[#fff9db] text-[#111111]'
                  }`}
                >
                  {copiado ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#15803d]" aria-hidden="true" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#111111]" aria-hidden="true" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] font-mono text-[#52525b] mt-1.5">
                Compartí este código para que otros estudiantes se sumen a tu grupo.
              </p>
            </div>

            {/* 2. Lista de Miembros con estado Online accesible */}
            <div className="border-2 border-[#111111] bg-white p-3 shadow-[2px_2px_0px_#111111]">
              <div className="flex items-center justify-between pb-2 border-b border-[#111111] mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#71717a] tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#111111]" aria-hidden="true" />
                  Compañeros del Grupo
                </span>
                {onAbrirRanking && (
                  <button
                    type="button"
                    onClick={onAbrirRanking}
                    aria-label="Ver ranking del grupo"
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono font-bold uppercase bg-white hover:bg-[#fff9db] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#111111]" aria-hidden="true" />
                    <span>Ranking</span>
                  </button>
                )}
              </div>

              <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-1" aria-label="Lista de compañeros de grupo">
                {(grupo.miembros || []).map((m) => {
                  const esYo = m.usuario_id === usuario?.id
                  const online = Boolean(m.en_linea ?? m.online)
                  return (
                    <li
                      key={m.usuario_id}
                      className="flex items-center justify-between p-1.5 bg-[#f4f0e6] border border-[#111111] text-xs font-mono"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 bg-[#fffdfa] border border-[#111111] flex items-center justify-center font-bold text-[11px] text-[#111111] flex-shrink-0">
                          {m.apodo ? m.apodo.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <span className="font-bold text-[#111111] truncate max-w-[130px] sm:max-w-[200px]">
                          {m.apodo || 'Cobayo'}
                        </span>
                        {esYo && (
                          <span className="text-[9px] font-bold px-1 py-0.2 bg-[#111111] text-[#ccff00] border border-[#111111]">
                            VOS
                          </span>
                        )}
                      </div>

                      {/* Indicador accesible (forma + texto, nunca solo color) */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {online ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d]"
                            aria-label="En línea"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#16a34a] border border-[#111111]" aria-hidden="true" />
                            <span>● En línea</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-[#71717a]"
                            aria-label="Desconectado"
                          >
                            <span className="w-2 h-2 rounded-full bg-[#e4e4e7] border border-[#71717a]" aria-hidden="true" />
                            <span>○ Desconectado</span>
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* 3. Preferencias de Identidad y Privacidad */}
            <div className="border-2 border-[#111111] bg-[#f4f0e6] p-3 space-y-3 shadow-[2px_2px_0px_#111111]">
              <span className="block text-[10px] font-mono font-bold uppercase text-[#71717a] tracking-wider">
                Tu Identidad en el Grupo
              </span>

              {/* Editar Apodo */}
              <form onSubmit={handleGuardarApodo} className="space-y-1.5">
                <label
                  htmlFor="apodo-input"
                  className="block text-[11px] font-mono font-bold uppercase text-[#111111]"
                >
                  Tu Apodo Visible
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="apodo-input"
                    type="text"
                    maxLength={20}
                    value={apodoNuevo}
                    onChange={e => setApodoNuevo(e.target.value)}
                    placeholder="Ej: Tito"
                    className="flex-1 bg-white border-2 border-[#111111] px-2.5 py-1.5 text-xs font-mono font-bold text-[#111111] min-h-[44px] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submitting || apodoNuevo.trim() === (usuario?.apodo || grupo.yo?.apodo || '')}
                    className="px-3 py-2 bg-white hover:bg-[#fff9db] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-mono font-bold uppercase cursor-pointer min-h-[44px] disabled:opacity-40 transition-all"
                  >
                    Guardar
                  </button>
                </div>
                <span className="block text-[10px] font-mono text-[#71717a]">
                  De 2 a 20 caracteres (admite tildes, números, espacios y _ - .).
                </span>
              </form>

              {/* Interruptor Compartir Progreso (bidireccional) */}
              <div className="pt-2 border-t border-[#111111] flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <label
                    htmlFor="switch-comparte"
                    className="block text-xs font-mono font-bold uppercase text-[#111111] cursor-pointer"
                  >
                    Compartir mi progreso
                  </label>
                  <p className="text-[10px] font-mono text-[#52525b] mt-0.5 leading-snug">
                    Si lo desactivás, tus compañeros no verán tus aprobadas y vos{' '}
                    <strong className="text-[#111111]">tampoco recibirás los logros del grupo</strong>.
                  </p>
                </div>

                <button
                  id="switch-comparte"
                  type="button"
                  role="switch"
                  aria-checked={comparteProgreso}
                  aria-label="Compartir mi progreso en tiempo real"
                  onClick={() => onCambiarPreferencia(!comparteProgreso)}
                  className={`w-12 h-7 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center p-0.5 cursor-pointer transition-colors flex-shrink-0 ${
                    comparteProgreso ? 'bg-[#ccff00]' : 'bg-[#e4e4e7]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 bg-[#111111] border border-[#111111] transition-transform ${
                      comparteProgreso ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* 4. Acción destructiva: Salir del grupo */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleSalir}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase text-[#dc2626] bg-white hover:bg-[#fee2e2] border-2 border-[#dc2626] shadow-[2px_2px_0px_#dc2626] cursor-pointer min-h-[44px] transition-all"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Salir del Grupo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
