import { useMemo, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import Header from './components/Header'
import HeroMetrics from './components/HeroMetrics'
import ToastContainer from './components/ToastContainer'
import ConfirmDialog from './components/ConfirmDialog'
import ConsultasTab from './tabs/ConsultasTab'
import EstadosTab from './tabs/EstadosTab'
import PlanTab from './tabs/PlanTab'
import RecomendacionesTab from './tabs/RecomendacionesTab'
import RutaTab from './tabs/RutaTab'
import { useAppData } from './lib/useAppData'
import { useToasts } from './lib/useToasts'
import { useConfirm } from './lib/useConfirm'
import { checkCursadaRequirements, checkExcepcionMachete, computeCondicionalidadCandidatos } from './lib/businessLogic'

export default function App() {
  const [currentTab, setCurrentTab] = useState('consultas')
  const { toasts, showToast, dismiss } = useToasts()
  const { confirmState, showConfirm, resolveConfirm } = useConfirm()
  const { ctx, loading, wsStatus, setConfigApp } = useAppData(showToast)

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
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroMetrics ctx={ctx} />

        {currentTab === 'consultas' && <ConsultasTab ctx={ctx} />}
        {currentTab === 'estados' && <EstadosTab ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {currentTab === 'plan' && <PlanTab ctx={ctx} showToast={showToast} showConfirm={showConfirm} />}
        {currentTab === 'recomendaciones' && <RecomendacionesTab ctx={ctx} />}
        {currentTab === 'ruta' && <RutaTab ctx={ctx} showToast={showToast} setConfigApp={setConfigApp} />}
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <ConfirmDialog state={confirmState} onResolve={resolveConfirm} />
    </div>
  )
}
