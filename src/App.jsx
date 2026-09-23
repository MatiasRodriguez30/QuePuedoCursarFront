import { lazy, Suspense, useMemo, useState } from 'react'
import Shell from './components/Shell'
import ToastContainer from './components/ToastContainer'
import ConfirmDialog from './components/ConfirmDialog'
import GrupoModal from './components/GrupoModal'
import RankingModal from './components/RankingModal'
import SelloLogroContainer from './components/SelloLogroContainer'
import LoginScreen from './components/LoginScreen'
import ResetPasswordScreen from './components/ResetPasswordScreen'
import TitoAvatar from './components/TitoAvatar'
import HoySurface from './tabs/HoySurface'
import CarreraSurface from './tabs/CarreraSurface'
import { useAppData } from './lib/useAppData'
import { useGrupo } from './lib/useGrupo'
import { useToasts } from './lib/useToasts'
import { useConfirm } from './lib/useConfirm'
import { useAuth } from './lib/useAuth'
import { checkCursadaRequirements, checkExcepcionMachete, computeCondicionalidadCandidatos } from './lib/businessLogic'

// Lazy loading de superficies y paneles secundarios
const CaminoSurface = lazy(() => import('./tabs/CaminoSurface'))
const AgendaTab = lazy(() => import('./tabs/AgendaTab'))
const AdminTab = lazy(() => import('./tabs/AdminTab'))

export default function App() {
  const [resetToken, setResetToken] = useState(() => new URLSearchParams(window.location.search).get('reset'))
  const [currentSurface, setCurrentSurface] = useState('hoy')
  const [targetMateriaId, setTargetMateriaId] = useState(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [grupoModalOpen, setGrupoModalOpen] = useState(false)
  const [rankingModalOpen, setRankingModalOpen] = useState(false)

  const { toasts, showToast, dismiss } = useToasts()
  const { confirmState, showConfirm, resolveConfirm } = useConfirm()
  const { usuario, checking, login, registrar, logout, actualizarUsuario, esAdmin } = useAuth()
  const { ctx, loading, wsStatus, setConfigApp, cargarEventos, carreraId, setCarreraId, actualizarEstado, subscribeWsEvents } = useAppData(showToast, usuario?.id)

  const {
    grupo,
    cargando: cargandoGrupo,
    disponible: gruposDisponibles,
    logros,
    cursandoPorMateria,
    descartarLogro,
    crearGrupo,
    unirseGrupo,
    cambiarPreferencia,
    salirGrupo,
    actualizarApodo,
  } = useGrupo({
    subscribeWsEvents,
    usuario,
    onUsuarioUpdate: actualizarUsuario,
    showToast,
  })

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

  function handleNavigateToCarrera(materiaId = null) {
    if (materiaId) setTargetMateriaId(materiaId)
    setAdminOpen(false)
    setCurrentSurface('carrera')
  }

  function handleNavigateToCamino() {
    setAdminOpen(false)
    setCurrentSurface('camino')
  }

  function handleNavigateToAgenda() {
    setAdminOpen(false)
    setCurrentSurface('agenda')
  }

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
      <div className="min-h-full flex flex-col items-center justify-center bg-[#f4f0e6] p-4 text-center">
        <TitoAvatar variant="cafe" className="w-16 h-16 mb-3" />
        <p className="text-xs font-mono font-bold uppercase text-[#111111]">Abriendo el fanzine...</p>
      </div>
    )
  }

  if (!usuario) {
    return <LoginScreen onLogin={login} onRegister={registrar} />
  }

  return (
    <Shell
      currentSurface={currentSurface}
      onSelectSurface={s => {
        setAdminOpen(false)
        setCurrentSurface(s)
      }}
      wsStatus={wsStatus}
      badgeDisponibles={badgeDisponibles}
      badgeRecomendaciones={badgeRecomendaciones}
      usuario={usuario}
      onLogout={logout}
      carreras={ctx.carreras}
      carreraId={carreraId}
      onCarreraChange={setCarreraId}
      onOpenAdmin={() => setAdminOpen(true)}
      grupo={grupo}
      gruposDisponibles={gruposDisponibles}
      onOpenGrupo={() => setGrupoModalOpen(true)}
      detailSheetOpen={currentSurface === 'carrera' && Boolean(targetMateriaId)}
    >
      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#f4f0e6]/95 p-6 gap-3 select-none">
          <div className="p-3 bg-white border-3 border-[#111111] shadow-fanzine-md">
            <TitoAvatar variant="cafe" className="w-16 h-16" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-sm font-display font-bold uppercase text-[#111111]">Acomodando los apuntes</h2>
            <p className="text-xs font-mono text-[#52525b]">Sincronizando tus materias y correlatividades...</p>
          </div>
        </div>
      )}

      {/* Panel de administración en ventana modal si el admin lo abre desde el menú de usuario */}
      {adminOpen && esAdmin ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111]">
            <h2 className="font-display text-base font-bold uppercase text-[#111111]">
              Administración del Sistema
            </h2>
            <button
              type="button"
              onClick={() => setAdminOpen(false)}
              className="px-3 py-1 bg-white border-2 border-[#111111] text-xs font-mono font-bold uppercase shadow-[2px_2px_0px_#111111] hover:bg-[#ff1464] hover:text-white cursor-pointer"
            >
              Volver a cursada ✕
            </button>
          </div>
          <Suspense fallback={<TabFallback />}>
            <AdminTab
              ctx={ctx}
              showToast={showToast}
              showConfirm={showConfirm}
              setConfigApp={setConfigApp}
              usuarioActualId={usuario.id}
            />
          </Suspense>
        </div>
      ) : (
        <>
          {currentSurface === 'hoy' && (
            <HoySurface
              ctx={ctx}
              onNavigateToCarrera={handleNavigateToCarrera}
              onNavigateToCamino={handleNavigateToCamino}
              onNavigateToAgenda={handleNavigateToAgenda}
              onActualizarEstado={actualizarEstado}
              cargarEventos={cargarEventos}
              cursandoPorMateria={cursandoPorMateria}
            />
          )}

          {currentSurface === 'carrera' && (
            <CarreraSurface
              ctx={ctx}
              selectedMateriaId={targetMateriaId}
              onSelectMateria={setTargetMateriaId}
              actualizarEstado={actualizarEstado}
              showToast={showToast}
              showConfirm={showConfirm}
              cursandoPorMateria={cursandoPorMateria}
            />
          )}

          {currentSurface === 'camino' && (
            <Suspense fallback={<TabFallback />}>
              <CaminoSurface
                ctx={ctx}
                onNavigateToCarrera={handleNavigateToCarrera}
              />
            </Suspense>
          )}

          {currentSurface === 'agenda' && (
            <Suspense fallback={<TabFallback />}>
              <AgendaTab
                ctx={ctx}
                showToast={showToast}
                showConfirm={showConfirm}
                esAdmin={esAdmin}
                cargarEventos={cargarEventos}
              />
            </Suspense>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} onResolve={resolveConfirm} />
      <SelloLogroContainer logros={logros} onDescartar={descartarLogro} />
      <GrupoModal
        isOpen={grupoModalOpen}
        onClose={() => setGrupoModalOpen(false)}
        grupo={grupo}
        cargando={cargandoGrupo}
        disponible={gruposDisponibles}
        usuario={usuario}
        onCrearGrupo={crearGrupo}
        onUnirseGrupo={unirseGrupo}
        onCambiarPreferencia={cambiarPreferencia}
        onSalirGrupo={salirGrupo}
        onActualizarApodo={actualizarApodo}
        onAbrirRanking={() => setRankingModalOpen(true)}
        showConfirm={showConfirm}
        showToast={showToast}
      />
      <RankingModal
        isOpen={rankingModalOpen}
        onClose={() => setRankingModalOpen(false)}
        usuario={usuario}
      />
    </Shell>
  )
}

function TabFallback() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs font-mono font-bold text-[#52525b]">
      <TitoAvatar variant="cafe" className="w-10 h-10" />
      Cargando página...
    </div>
  )
}
