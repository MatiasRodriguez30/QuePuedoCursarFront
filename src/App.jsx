import { lazy, Suspense, useMemo, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import Header from './components/Header'
import HeroMetrics from './components/HeroMetrics'
import ToastContainer from './components/ToastContainer'
import ConfirmDialog from './components/ConfirmDialog'
import LoginScreen from './components/LoginScreen'
import ResetPasswordScreen from './components/ResetPasswordScreen'
import ConsultasTab from './tabs/ConsultasTab'
import { useAppData } from './lib/useAppData'
import { useToasts } from './lib/useToasts'
import { useConfirm } from './lib/useConfirm'
import { useAuth } from './lib/useAuth'
import { checkCursadaRequirements, checkExcepcionMachete, computeCondicionalidadCandidatos } from './lib/businessLogic'

// Sólo la pestaña inicial entra en el bundle principal: el resto (incluido
// todo el panel de admin, que la mayoría de los usuarios nunca abre) se
// descarga recién al abrirla.
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
      <div className="min-h-full flex items-center justify-center bg-slate-950">
        <GraduationCap className="w-8 h-8 text-brand-400 animate-pulse" />
      </div>
    )
  }

  if (!usuario) {
    return <LoginScreen onLogin={login} onRegister={registrar} />
  }

  return (
    <div className="min-h-full flex flex-col bg-slate-950 font-sans">
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 gap-4">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 p-0.5 animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-brand-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:120ms]" />
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce [animation-delay:240ms]" />
            <span className="ml-1">Sincronizando plan de estudios...</span>
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

      <main role="main" aria-label="Contenido principal" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroMetrics ctx={ctx} />

        <Suspense fallback={<TabFallback />}>
          {currentTab === 'consultas' && <ConsultasTab ctx={ctx} />}
          {currentTab === 'estados' && <EstadosTab ctx={ctx} showToast={showToast} showConfirm={showConfirm} actualizarEstado={actualizarEstado} />}
          {currentTab === 'plan' && <PlanTab ctx={ctx} />}
          {currentTab === 'recomendaciones' && <RecomendacionesTab ctx={ctx} />}
          {currentTab === 'ruta' && <RutaTab ctx={ctx} />}
          {currentTab === 'agenda' && <AgendaTab ctx={ctx} showToast={showToast} showConfirm={showConfirm} esAdmin={esAdmin} cargarEventos={cargarEventos} />}
          {currentTab === 'admin' && esAdmin && <AdminTab ctx={ctx} showToast={showToast} showConfirm={showConfirm} setConfigApp={setConfigApp} usuarioActualId={usuario.id} />}
        </Suspense>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} onResolve={resolveConfirm} />
    </div>
  )
}

function TabFallback() {
  return (
    <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-500">
      <GraduationCap className="w-4 h-4 text-brand-400 animate-pulse" aria-hidden="true" />
      Cargando sección...
    </div>
  )
}
