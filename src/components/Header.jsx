import { BookOpen, Check, Compass, GraduationCap, Lightbulb, LogOut, Route, Shield, Terminal } from 'lucide-react'
import { API_BASE } from '../lib/api'

const TABS = [
  { id: 'consultas', label: '¿Qué Puedo Cursar?', icon: Compass },
  { id: 'estados', label: 'Mis Estados', icon: Check },
  { id: 'plan', label: 'Plan de Estudios', icon: BookOpen },
  { id: 'recomendaciones', label: 'Recomendaciones', icon: Lightbulb },
  { id: 'ruta', label: 'Camino Óptimo', icon: Route },
]

export default function Header({ currentTab, onTabChange, wsStatus, badgeDisponibles, badgeRecomendaciones, usuario, onLogout }) {
  const wsCfg = {
    connected: { dot: 'bg-emerald-400', text: 'Sincronizado', badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' },
    connecting: { dot: 'bg-amber-400 animate-pulse', text: 'Conectando...', badge: 'border-slate-800 bg-slate-900/60 text-slate-400' },
    disconnected: { dot: 'bg-rose-500 animate-pulse', text: 'Reconectando...', badge: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
  }[wsStatus]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 shadow-lg shadow-brand-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                Qué Puedo Cursar
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">v3.0</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Planificador universitario en tiempo real</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all duration-300 ${wsCfg.badge}`}>
            <span className={`w-2 h-2 rounded-full ${wsCfg.dot}`}></span>
            <span className="font-medium">{wsCfg.text}</span>
          </div>
          <a
            href={`${API_BASE}/docs`}
            target="_blank"
            rel="noreferrer"
            title="Abrir documentación de la API Swagger"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-white text-xs text-slate-300 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>API Docs</span>
          </a>
          {usuario && (
            <div className="flex items-center gap-2 pl-1">
              <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 max-w-[160px] truncate" title={usuario.email}>
                {usuario.rol === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" title="Admin" />}
                {usuario.email}
              </span>
              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-1.5 text-slate-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/60 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = currentTab === tab.id
          const badge = tab.id === 'consultas' ? badgeDisponibles : tab.id === 'recomendaciones' ? badgeRecomendaciones : null
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                active ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {badge != null && badge > 0 && (
                <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  tab.id === 'consultas'
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </header>
  )
}
