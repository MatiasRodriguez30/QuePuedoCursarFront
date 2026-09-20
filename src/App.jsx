import { lazy, Suspense, useMemo, useState } from 'react'
import Header from './components/Header'
import HeroMetrics from './components/HeroMetrics'
import ToastContainer from './components/ToastContainer'
import ConfirmDialog from './components/ConfirmDialog'
import LoginScreen from './components/LoginScreen'
import ResetPasswordScreen from './components/ResetPasswordScreen'
import TitoAvatar from './components/TitoAvatar'
import ConsultasTab from './tabs/ConsultasTab'
import { useAppData } from './lib/useAppData'
import { useToasts } from './lib/useToasts'
import { useConfirm } from './lib/useConfirm'
import { useAuth } from './lib/useAuth'
import { checkCursadaRequirements, checkExcepcionMachete, computeCondicionalidadCandidatos } from './lib/businessLogic'

// Lazy loading de pestañas secundarias para mantener el bundle principal liviano
const EstadosTab = lazy(() => import('./tabs/EstadosTab'))
const PlanTab = lazy(() => import('./tabs/PlanTab'))
const RecomendacionesTab = lazy(() => import('./tabs/RecomendacionesTab'))
const RutaTab = lazy(() => import('./tabs/RutaTab'))
const AgendaTab = lazy(() => import('./tabs/AgendaTab'))
const AdminTab = lazy(() => import('./tabs/AdminTab'))

export default function App() {
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('reset'))
  const [currentTab, setCurrentTab] = useState('consultas')
  const { toasts, showToast, dismiss } = useToasts()
  const { confirmState, showConfirm, resolveConfirm } = useConfirm()
  const { usuario, checking, login, registrar, logout, esAdmin } = useAuth()
  const { ctx, loading, wsStatus, setConfigApp, cargarEventos, carreraId, setCarreraId, actualizarEstado } = useAppData(showToast, usuario?.id)

  const badgeDisponibles = useMemo(() => {
    return ctx.materias.filter(m => {
      const st = ctx.estadosMap[m.id] || 'NO_CURSADA'
      return st === 'NO_CURSADA' && checkCursadaRequirements(m.id, ctx).puede
    }).length
  }, [ctx])

  const badgeRecomendaciones = useMemo(() => {
    const machete = checkExcepcionMachete(ctx)
    const candidatos = computeCondicionalidadCandidatos(ctx)
    return candidatos.length + (machete.elegible ? 1 : 0)
  }, [ctx])

  if (resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, '', window.location.pathname)
          setResetToken(null)
        }}
      />
    )
  }

  if (checking) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#fbf9f4] p-4 text-center">
        <TitoAvatar className="w-14 h-14 mb-3" />
        <p className="text-xs font-semibold text-[#57534e]">Abriendo la libreta...</p>
      </div>
    )
  }

  if (!usuario) {
    return <LoginScreen onLogin={login} onRegister={registrar} />
  }

  return (
    <div className="min-h-full flex flex-col bg-[#fbf9f4] text-[#1a1916] font-sans antialiased">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#fbf9f4]/95 backdrop-blur-[2px] p-6 gap-3 select-none">
          <div className="p-3 bg-white border-2 border-[#e2dcce] rounded-2xl shadow-sm">
            <TitoAvatar className="w-16 h-16" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-[#1a1916]">Acomodando los apuntes</h2>
            <p className="text-xs text-[#57534e]">Sincronizando tus materias y correlatividades...</p>
          </div>
        </div>
      )}

      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        wsStatus={wsStatus}
        badgeDisponibles={badgeDisponibles}
        badgeRecomendaciones={badgeRecomendaciones}
        usuario={usuario}
        onLogout={logout}
        carreras={ctx.carreras}
        carreraId={carreraId}
        onCarreraChange={setCarreraId}
      />

      <main
        role="main"
        aria-label="Contenido principal"
        className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-6 pb-28 md:pb-10"
      >
        <HeroMetrics ctx={ctx} />

        <Suspense fallback={<TabFallback />}>
          {currentTab === 'consultas' && <ConsultasTab ctx={ctx} />}
          {currentTab === 'estados' && (
            <EstadosTab
              ctx={ctx}
              showToast={showToast}
              showConfirm={showConfirm}
              actualizarEstado={actualizarEstado}
            />
          )}
          {currentTab === 'plan' && <PlanTab ctx={ctx} />}
          {currentTab === 'recomendaciones' && <RecomendacionesTab ctx={ctx} />}
          {currentTab === 'ruta' && <RutaTab ctx={ctx} />}
          {currentTab === 'agenda' && (
            <AgendaTab
              ctx={ctx}
              showToast={showToast}
              showConfirm={showConfirm}
              esAdmin={esAdmin}
              cargarEventos={cargarEventos}
            />
          )}
          {currentTab === 'admin' && esAdmin && (
            <AdminTab
              ctx={ctx}
              showToast={showToast}
              showConfirm={showConfirm}
              setConfigApp={setConfigApp}
              usuarioActualId={usuario.id}
            />
          )}
        </Suspense>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} onResolve={resolveConfirm} />
    </div>
  )
}

function TabFallback() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs font-semibold text-[#57534e]">
      <TitoAvatar className="w-8 h-8 opacity-80" />
      Cargando página...
    </div>
  )
}
