import { useState, useRef, useEffect } from 'react'
import {
  Calendar,
  Compass,
  FileSpreadsheet,
  LogOut,
  Route,
  Settings,
  User
} from 'lucide-react'
import TitoFavicon from '/favicon.svg'

const NAVIGATION_SURFACES = [
  { id: 'hoy', label: 'Hoy', icon: Compass },
  { id: 'carrera', label: 'Mi carrera', icon: FileSpreadsheet },
  { id: 'camino', label: 'Camino', icon: Route },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
]

const WS_CFG = {
  connected: {
    colorText: 'text-[#111111]',
    bg: 'bg-[#ccff00]',
    label: 'En vivo',
    tooltip: 'Sincronizado en tiempo real por WebSocket',
  },
  connecting: {
    colorText: 'text-[#111111]',
    bg: 'bg-[#fef08a]',
    label: 'Reconectando',
    tooltip: 'Estableciendo conexión con el servidor…',
  },
  disconnected: {
    colorText: 'text-white',
    bg: 'bg-[#dc2626]',
    label: 'Sin conexión',
    tooltip: 'Sin conexión. Los cambios se guardan localmente.',
  },
}

function WsShapeIndicator({ status }) {
  if (status === 'connected') {
    // Círculo sólido para En vivo
    return <span className="w-2.5 h-2.5 rounded-full bg-[#111111] border border-[#111111] flex-shrink-0" aria-hidden="true" />
  }
  if (status === 'connecting') {
    // Rombo / diamante rotado para Reconectando
    return <span className="w-2 h-2 rotate-45 bg-[#b45309] border border-[#111111] flex-shrink-0" aria-hidden="true" />
  }
  // Cuadrado tachado para Sin conexión
  return (
    <span className="w-2.5 h-2.5 bg-white border border-[#111111] flex-shrink-0 flex items-center justify-center text-[8px] font-bold text-[#dc2626] leading-none" aria-hidden="true">
      ✕
    </span>
  )
}

export default function Shell({
  currentSurface,
  onSelectSurface,
  wsStatus,
  badgeDisponibles = 0,
  badgeRecomendaciones = 0,
  usuario,
  onLogout,
  carreras,
  carreraId,
  onCarreraChange,
  onOpenAdmin,
  detailSheetOpen = false,
  children,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const wsCfg = WS_CFG[wsStatus] || WS_CFG.disconnected
  const esAdmin = usuario?.rol === 'ADMIN'

  // Cerrar menú de usuario al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside)
      return () => document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [userMenuOpen])

  return (
    <div className="min-h-full flex flex-col bg-[#f4f0e6] text-[#111111] font-sans antialiased">
      {/* ── BARRA SUPERIOR MINIMALISTA ────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full bg-[#f4f0e6] border-b-2 border-[#111111] shadow-[0_2px_0px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo Tito (SVG geométrico 16px legible) + Nombre */}
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => onSelectSurface('hoy')}
              className="flex items-center gap-2 text-left focus:outline-none group cursor-pointer min-w-0"
              title="Ir a Hoy"
            >
              <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#ccff00] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] p-0.5 flex-shrink-0 flex items-center justify-center group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-[1px_1px_0px_#111111] transition-all">
                <img src={TitoFavicon} alt="Tito el cobayo" className="w-full h-full" width={32} height={32} />
              </div>
              <div className="min-w-0 truncate">
                <span className="font-display text-xs sm:text-base font-bold uppercase text-[#111111] block truncate leading-none">
                  <span className="hidden sm:inline">Qué Puedo Cursar</span>
                  <span className="sm:hidden">QPC</span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase text-[#52525b] hidden sm:block tracking-widest mt-0.5">
                  FANZINE V.03
                </span>
              </div>
            </button>
          </div>

          {/* Selector de Carrera + Estado WS + Menú Usuario */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Selector de carrera */}
            {carreras && carreras.length > 0 && (
              <select
                value={carreraId || ''}
                onChange={e => onCarreraChange(parseInt(e.target.value, 10))}
                aria-label="Carrera actual"
                title="Cambiar carrera activa"
                className="bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] px-2 sm:px-2.5 py-1 text-xs font-bold font-mono text-[#111111] focus:outline-none focus:bg-[#fef08a] max-w-[100px] sm:max-w-[190px] truncate cursor-pointer"
              >
                {carreras.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Estado WebSocket Textual Accesible con Forma Geométrica Distinta */}
            <div
              title={wsCfg.tooltip}
              className={`flex items-center gap-1.5 px-1.5 sm:px-2 py-1 border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-[10px] sm:text-xs font-mono font-bold uppercase ${wsCfg.bg} ${wsCfg.colorText} flex-shrink-0 cursor-default`}
            >
              <WsShapeIndicator status={wsStatus} />
              <span className="hidden md:inline">{wsCfg.label}</span>
              <span className="sr-only">{wsCfg.label} — {wsCfg.tooltip}</span>
            </div>

            {/* Menú de Usuario */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(prev => !prev)}
                aria-expanded={userMenuOpen}
                aria-label="Menú de cuenta de usuario"
                className="flex items-center gap-1.5 px-2 py-1 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#e4e4e7] text-xs font-bold font-mono text-[#111111] cursor-pointer transition-all"
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {usuario?.email?.split('@')[0] || 'Cuenta'}
                </span>
                <span className="text-[9px]">▾</span>
              </button>

              {/* Popover del Menú de Usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-[#fffdfa] border-3 border-[#111111] shadow-[5px_5px_0px_#111111] p-1.5 z-50 flex flex-col gap-1">
                  <div className="px-2.5 py-1.5 border-b border-[#111111] mb-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-[#71717a]">Usuario activo</div>
                    <div className="text-xs font-bold text-[#111111] truncate">{usuario?.email}</div>
                  </div>

                  {esAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        onOpenAdmin?.()
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs font-bold uppercase font-mono text-[#111111] hover:bg-[#ccff00] hover:border hover:border-[#111111] cursor-pointer transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#111111]" aria-hidden="true" />
                      <span>Panel de Admin</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-left text-xs font-bold uppercase font-mono text-[#dc2626] hover:bg-[#fee2e2] hover:border hover:border-[#dc2626] cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── CUERPO PRINCIPAL (DESKTOP RAIL LATERAL + ÁREA DE SUPERFICIE) ───────── */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto overflow-hidden">
        {/* Riel lateral exclusivo de Tablet/Escritorio (>= 768px) tipo separador fanzine (colapsa en modo compacto con hoja de detalle abierta) */}
        <aside
          aria-label="Navegación principal de cuaderno"
          className={`hidden md:flex ${
            detailSheetOpen ? 'w-16 p-2 items-center' : 'w-52 p-4'
          } bg-[#eee8d8] border-r-3 border-[#111111] flex-col gap-2.5 flex-shrink-0 select-none transition-all duration-150`}
        >
          <div className={`text-[10px] font-mono font-bold uppercase text-[#71717a] ${detailSheetOpen ? 'text-center' : 'px-2'} mb-1 tracking-wider`}>
            {detailSheetOpen ? '···' : 'SECCIONES'}
          </div>
          {NAVIGATION_SURFACES.map(s => {
            const Icon = s.icon
            const active = currentSurface === s.id
            const badge = s.id === 'hoy' ? badgeDisponibles : (s.id === 'camino' ? badgeRecomendaciones : 0)

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSurface(s.id)}
                title={detailSheetOpen ? s.label : undefined}
                className={`w-full flex items-center ${
                  detailSheetOpen ? 'justify-center p-2.5' : 'justify-between p-2.5'
                } border-2 border-[#111111] text-xs font-bold font-mono uppercase tracking-tight transition-all cursor-pointer relative ${
                  active
                    ? 'bg-[#111111] text-[#ccff00] shadow-[3px_3px_0px_#ff1464] translate-x-1'
                    : 'bg-white text-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#fff9db] hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {!detailSheetOpen && <span className="truncate">{s.label}</span>}
                </div>
                {badge > 0 && (
                  <span
                    className={`${
                      detailSheetOpen
                        ? 'absolute -top-1.5 -right-1.5 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-[#111111]'
                        : 'text-[10px] font-bold px-1.5 py-0.2 border border-[#111111]'
                    } ${
                      active ? 'bg-[#ff1464] text-[#111111]' : 'bg-[#ccff00] text-[#111111]'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </aside>

        {/* Contenedor dinámico de la superficie activa */}
        <main
          role="main"
          className="flex-1 w-full overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 pb-24 md:pb-8 bg-riso-halftone"
        >
          {children}
        </main>
      </div>

      {/* ── BARRA DE NAVEGACIÓN INFERIOR MÓVIL (< 768px) ────────────────────── */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fffdfa] border-t-3 border-[#111111] shadow-[0_-3px_0px_rgba(0,0,0,0.1)] px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] flex justify-around items-center select-none"
      >
        {NAVIGATION_SURFACES.map(s => {
          const Icon = s.icon
          const active = currentSurface === s.id
          const badge = s.id === 'hoy' ? badgeDisponibles : (s.id === 'camino' ? badgeRecomendaciones : 0)

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectSurface(s.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[58px] px-1 py-0.5 relative transition-all cursor-pointer ${
                active ? 'text-[#111111]' : 'text-[#71717a]'
              }`}
            >
              <div
                className={`w-7 h-7 flex items-center justify-center border-2 border-[#111111] transition-transform ${
                  active
                    ? 'bg-[#ccff00] text-[#111111] shadow-[2px_2px_0px_#111111] -translate-y-0.5 rotate-[-1.5deg]'
                    : 'bg-white text-[#52525b]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
              </div>
              <span className={`text-[10px] font-mono mt-1 leading-none ${active ? 'font-bold uppercase text-[#111111]' : 'font-semibold'}`}>
                {s.label}
              </span>
              {badge > 0 && (
                <span className="absolute top-0.5 right-2 text-[9px] font-bold px-1 bg-[#ff1464] text-[#111111] border border-[#111111] shadow-[1px_1px_0px_#111111]">
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
