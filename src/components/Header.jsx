import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Compass,
  Lightbulb,
  LogOut,
  MoreHorizontal,
  Route,
  Settings,
  Shield,
  Terminal,
  X
} from 'lucide-react'
import { API_BASE } from '../lib/api'
import TitoAvatar from './TitoAvatar'

const MAIN_TABS = [
  { id: 'consultas', label: '¿Qué Cursar?', fullLabel: '¿Qué Puedo Cursar?', icon: Compass },
  { id: 'estados', label: 'Mis Estados', fullLabel: 'Mis Estados', icon: CheckSquare },
  { id: 'agenda', label: 'Agenda', fullLabel: 'Agenda', icon: Calendar },
  { id: 'plan', label: 'Plan', fullLabel: 'Plan de Estudios', icon: BookOpen },
]

const SECONDARY_TABS = [
  { id: 'recomendaciones', label: 'Recomendaciones', fullLabel: 'Recomendaciones', icon: Lightbulb },
  { id: 'ruta', label: 'Camino Óptimo', fullLabel: 'Camino Óptimo', icon: Route },
]

const ADMIN_TAB = { id: 'admin', label: 'Admin', fullLabel: 'Administración', icon: Settings }

const WS_CFG = {
  connected: {
    dot: 'bg-emerald-600',
    badge: 'border-emerald-700/30 bg-emerald-50 text-emerald-900',
    label: 'En vivo',
    tooltip: 'Conexión activa — los cambios se sincronizan en tiempo real',
  },
  connecting: {
    dot: 'bg-amber-600',
    badge: 'border-amber-700/30 bg-amber-50 text-amber-900',
    label: 'Reconectando',
    tooltip: 'Estableciendo conexión con el servidor…',
  },
  disconnected: {
    dot: 'bg-rose-600',
    badge: 'border-rose-700/30 bg-rose-50 text-rose-900',
    label: 'Sin conexión',
    tooltip: 'Sin conexión al servidor. Los cambios se guardan localmente.',
  },
}

export default function Header({
  currentTab,
  onTabChange,
  wsStatus,
  badgeDisponibles,
  badgeRecomendaciones,
  usuario,
  onLogout,
  carreras,
  carreraId,
  onCarreraChange,
}) {
  const [menuMasAbierto, setMenuMasAbierto] = useState(false)
  const menuRef = useRef(null)
  const wsCfg = WS_CFG[wsStatus] ?? WS_CFG.disconnected
  const esAdmin = usuario?.rol === 'ADMIN'

  // Todas las solapas para desktop en orden
  const allTabs = [
    MAIN_TABS[0], // consultas
    MAIN_TABS[1], // estados
    MAIN_TABS[3], // plan
    SECONDARY_TABS[0], // recomendaciones
    SECONDARY_TABS[1], // ruta
    MAIN_TABS[2], // agenda
    ...(esAdmin ? [ADMIN_TAB] : []),
  ]

  // Cerrar menú "Más" al tocar afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuMasAbierto(false)
      }
    }
    if (menuMasAbierto) {
      document.addEventListener('pointerdown', handleClickOutside)
      return () => document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [menuMasAbierto])

  function handleSelectTab(tabId) {
    onTabChange(tabId)
    setMenuMasAbierto(false)
  }

  const isMoreTabActive = ['recomendaciones', 'ruta', 'admin'].includes(currentTab)

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e2dcce] bg-[#fbf9f4]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 min-h-16 py-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo y nombre de la app */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-orange-700 flex items-center justify-center p-1 flex-shrink-0 shadow-sm border border-orange-800">
              <TitoAvatar className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#1a1916] truncate">
                  <span className="hidden sm:inline">Qué Puedo Cursar</span>
                  <span className="sm:hidden">Qué Cursar</span>
                </h1>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300 flex-shrink-0">
                  Libreta
                </span>
              </div>
              <p className="text-xs text-[#57534e] hidden sm:block">Planificador universitario en tiempo real</p>
            </div>
          </div>

          {/* Acciones de cabecera */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Selector de carrera */}
            {carreras && carreras.length > 0 && (
              <select
                value={carreraId || ''}
                onChange={e => onCarreraChange(parseInt(e.target.value, 10))}
                aria-label="Carrera actual"
                title="Cambiar de carrera"
                className="bg-white border-2 border-[#78716c] rounded-lg pl-2 pr-6 sm:pl-2.5 sm:pr-7 py-1.5 text-xs font-semibold text-[#1a1916] focus:outline-none focus:border-orange-600 max-w-[110px] sm:max-w-[200px] truncate shadow-2xs"
              >
                {carreras.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            )}

            {/* Badge de estado WS */}
            <div
              title={wsCfg.tooltip}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-default flex-shrink-0 ${wsCfg.badge}`}
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${wsCfg.dot}`} aria-hidden="true" />
              <span className="hidden md:inline">{wsCfg.label}</span>
              <span className="sr-only">{wsCfg.label} — {wsCfg.tooltip}</span>
            </div>

            {/* Link a API Docs */}
            <a
              href={`${API_BASE}/docs`}
              target="_blank"
              rel="noreferrer"
              title="Abrir documentación de la API Swagger"
              aria-label="Documentación de la API (nueva pestaña)"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#78716c] bg-white hover:bg-[#f4efe6] text-xs font-semibold text-[#44403c] transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-[#57534e]" aria-hidden="true" />
              <span>API Docs</span>
            </a>

            {/* Usuario y Logout */}
            {usuario && (
              <div className="flex items-center gap-2 pl-1">
                <span
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold text-[#44403c] max-w-[150px] truncate"
                  title={usuario.email}
                >
                  {usuario.rol === 'ADMIN' && (
                    <Shield className="w-3.5 h-3.5 text-orange-700 flex-shrink-0" aria-label="Administrador" />
                  )}
                  {usuario.email}
                </span>
                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="p-2 text-[#57534e] hover:text-rose-700 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-300 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navegación Desktop / Tablet (>= 768px) */}
        <div
          className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-x-1 border-t border-[#e2dcce] overflow-x-auto"
          role="tablist"
          aria-label="Secciones de la aplicación"
        >
          {allTabs.map(tab => {
            const Icon = tab.icon
            const active = currentTab === tab.id
            const badge =
              tab.id === 'consultas'
                ? badgeDisponibles
                : tab.id === 'recomendaciones'
                ? badgeRecomendaciones
                : null

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 min-h-[44px] ${
                  active
                    ? 'border-orange-600 text-orange-900 bg-orange-50/50'
                    : 'border-transparent text-[#57534e] hover:text-[#1a1916] hover:bg-[#f4efe6]/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-orange-600' : 'text-[#78716c]'}`} aria-hidden="true" />
                <span>{tab.fullLabel}</span>
                {badge != null && badge > 0 && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      tab.id === 'consultas'
                        ? 'bg-orange-200 text-orange-900 border border-orange-400'
                        : 'bg-amber-200 text-amber-950 border border-amber-400'
                    }`}
                    aria-label={`${badge} disponibles`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </header>

      {/* Navegación Móvil Inferior Fija (< 768px) */}
      <nav
        role="navigation"
        aria-label="Navegación principal en celular"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#e2dcce] shadow-[0_-2px_8px_rgba(26,25,22,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-5 h-14 items-center">
          {MAIN_TABS.map(tab => {
            const Icon = tab.icon
            const active = currentTab === tab.id
            const badge = tab.id === 'consultas' ? badgeDisponibles : null

            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] relative transition-colors ${
                  active ? 'text-orange-700 font-bold bg-orange-50/70' : 'text-[#57534e] hover:text-[#1a1916]'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {badge != null && badge > 0 && (
                    <span
                      className="absolute -top-1 -right-2 text-[9px] font-mono font-bold w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center border border-white"
                      aria-label={`${badge} disponibles`}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 leading-tight truncate max-w-[62px]">{tab.label}</span>
              </button>
            )
          })}

          {/* Botón "Más" para secciones secundarias */}
          <div className="relative h-full" ref={menuRef}>
            <button
              onClick={() => setMenuMasAbierto(v => !v)}
              aria-expanded={menuMasAbierto}
              aria-label="Más secciones de la aplicación"
              className={`w-full flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
                isMoreTabActive || menuMasAbierto
                  ? 'text-orange-700 font-bold bg-orange-50/70'
                  : 'text-[#57534e] hover:text-[#1a1916]'
              }`}
            >
              <div className="relative">
                <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
                {badgeRecomendaciones > 0 && (
                  <span
                    className="absolute -top-1 -right-2 text-[9px] font-mono font-bold w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center border border-white"
                    aria-label={`${badgeRecomendaciones} recomendaciones`}
                  >
                    {badgeRecomendaciones}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 leading-tight">Más</span>
            </button>

            {/* Menú flotante hacia arriba */}
            {menuMasAbierto && (
              <div className="absolute bottom-16 right-2 w-56 bg-white border-2 border-[#78716c] rounded-xl shadow-xl p-2 z-50 space-y-1">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-[#57534e] border-b border-[#e2dcce] mb-1">
                  <span>Otras secciones</span>
                  <button
                    onClick={() => setMenuMasAbierto(false)}
                    aria-label="Cerrar menú"
                    className="p-1 text-[#57534e] hover:text-[#1a1916]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleSelectTab('recomendaciones')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors min-h-[44px] ${
                    currentTab === 'recomendaciones'
                      ? 'bg-orange-100 text-orange-950 font-bold'
                      : 'hover:bg-[#f4efe6] text-[#1a1916]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    Recomendaciones
                  </span>
                  {badgeRecomendaciones > 0 && (
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-400">
                      {badgeRecomendaciones}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSelectTab('ruta')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors min-h-[44px] ${
                    currentTab === 'ruta'
                      ? 'bg-orange-100 text-orange-950 font-bold'
                      : 'hover:bg-[#f4efe6] text-[#1a1916]'
                  }`}
                >
                  <Route className="w-4 h-4 text-orange-600" />
                  <span>Camino Óptimo</span>
                </button>

                {esAdmin && (
                  <button
                    onClick={() => handleSelectTab('admin')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors min-h-[44px] ${
                      currentTab === 'admin'
                        ? 'bg-orange-100 text-orange-950 font-bold'
                        : 'hover:bg-[#f4efe6] text-[#1a1916]'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-[#57534e]" />
                    <span>Administración</span>
                  </button>
                )}

                <div className="border-t border-[#e2dcce] pt-1 mt-1">
                  <a
                    href={`${API_BASE}/docs`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#57534e] hover:bg-[#f4efe6] min-h-[44px]"
                  >
                    <Terminal className="w-4 h-4 text-[#57534e]" />
                    <span>Documentación API</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
