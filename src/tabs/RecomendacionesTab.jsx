import { useMemo } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  FastForward,
  Lightbulb,
  ListChecks,
  ShieldCheck,
  Shuffle
} from 'lucide-react'
import { checkExcepcionMachete, computeCondicionalidadCandidatos, proximaOportunidad } from '../lib/businessLogic'
import TitoAvatar from '../components/TitoAvatar'

export default function RecomendacionesTab({ ctx }) {
  const machete = useMemo(() => checkExcepcionMachete(ctx), [ctx])
  const nombrePlan = ctx.carreraActual?.plan_nombre || ctx.carreraActual?.nombre || 'esta carrera'
  const candidatos = useMemo(() => computeCondicionalidadCandidatos(ctx), [ctx])
  const basicas = ctx.materias.filter(
    m => m.es_basica_compartida && (ctx.estadosMap[m.id] || 'NO_CURSADA') !== 'PROMOCIONADA'
  )

  return (
    <div className="space-y-6">
      <div className="pb-3 border-b border-[#e2dcce]">
        <h2 className="text-base font-bold text-[#1a1916] flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-700" />
          Recomendaciones y Excepciones de Correlatividad
        </h2>
        <p className="text-xs text-[#57534e]">
          Pautas orientativas de correlatividades y solicitud de condicionalidad de cursado. La resolución final siempre depende de las autoridades de la carrera.
        </p>
      </div>

      <MacheteCard machete={machete} nombrePlan={nombrePlan} />

      {/* Candidatos a cursado condicional */}
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-orange-700" />
          Candidatos a Cursado Condicional
        </h3>
        <p className="text-xs text-[#57534e] mb-3">
          Materias de 4º o 5º nivel a las que te falta <b>una sola</b> correlativa y el cruce de cuatrimestres habilita pedir la excepción.
        </p>

        {candidatos.length === 0 ? (
          <EmptyBox text="No tenés materias bloqueadas por una sola correlativa con cruce de cuatrimestres habilitado." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidatos.map(({ materia, correlativa, tipo }) => {
              const cCuat = materia.cuatrimestre ? `${materia.cuatrimestre}°C` : 'Anual'
              const rCuat = correlativa?.cuatrimestre ? `${correlativa.cuatrimestre}°C` : 'Anual'
              return (
                <div key={materia.id} className="notebook-card rounded-xl p-4 border-2 border-orange-500 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                      {materia.codigo}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-950 border border-orange-400">
                      {cCuat}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1a1916] leading-snug mb-2">{materia.nombre}</h4>
                  <div className="text-xs text-[#57534e] flex items-center gap-1.5 font-medium">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                    Te falta <span className="font-bold text-amber-900">{tipo === 'REGULARIZADA' ? 'regularizar' : 'aprobar'}</span>
                  </div>
                  <div className="text-xs font-bold text-[#1a1916] mt-0.5">
                    {correlativa?.nombre} <span className="text-[11px] text-[#78716c] font-normal">({rCuat})</span>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#e2dcce] text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-emerald-700" /> Cruce de cuatrimestres habilitado
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Materias básicas compartidas */}
      <div>
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-1">
          <Shuffle className="w-4 h-4 text-teal-700" />
          Materias Básicas con Comisión Compartida
        </h3>
        <p className="text-xs text-[#57534e] mb-3">
          Se dictan también en comisiones compartidas con otras carreras. Si el horario de tu comisión principal no te cierra, podés cursarlas en esas comisiones paralelas.
        </p>

        {basicas.length === 0 ? (
          <EmptyBox text="No tenés materias básicas compartidas pendientes." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {basicas.map(m => {
              const estado = ctx.estadosMap[m.id] || 'NO_CURSADA'
              const prox = proximaOportunidad(m, ctx)
              return (
                <div key={m.id} className="notebook-card rounded-xl p-4 border-2 border-teal-600 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#f4efe6] text-[#1a1916] border border-[#78716c]">
                      {m.codigo}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-950 border border-teal-500">
                      {estado}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1a1916] leading-snug mb-1.5">{m.nombre}</h4>
                  <p className="text-[11px] text-[#57534e] flex items-center gap-1.5 font-medium">
                    <CalendarClock className="w-3.5 h-3.5 text-[#78716c]" /> {prox.texto}
                  </p>
                  <p className="text-[11px] text-teal-950 font-medium mt-1.5">
                    Consultá horarios en comisiones compartidas si el de tu carrera se te superpone.
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Paso a paso de excepciones */}
      <div className="notebook-panel rounded-2xl p-5 border border-[#e2dcce] bg-white">
        <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-emerald-700" />
          Paso a Paso para Tramitar una Excepción
        </h3>
        <ol className="space-y-3 text-xs text-[#44403c]">
          {PASOS.map((texto, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#f4efe6] border border-[#78716c] flex items-center justify-center font-mono font-bold text-orange-800">
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: texto }} className="leading-relaxed" />
            </li>
          ))}
        </ol>
        <div className="mt-4 pt-3 border-t border-[#e2dcce] flex items-start gap-2 text-xs text-amber-950 bg-amber-50 border border-amber-300 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
          <span>
            Límites que el sistema <b>no puede verificar automáticamente</b> y tenés que controlar vos: la condicionalidad se otorga <b>una sola vez en toda la carrera</b>, y el total de materias que cursás + solicitás como condicionales no puede superar <b>7</b>.
          </span>
        </div>
      </div>
    </div>
  )
}

const PASOS = [
  'Verificá que cumplís los requisitos: para adelanto de nivel, que las horas que te faltan aprobar sean menores a las horas del último año; para condicionalidad, que sólo te falte <b>una</b> correlativa y que nunca hayas tenido condicionalidad antes en la carrera.',
  'Entrá al sistema de autogestión de la facu y completá la <b>solicitud de cursado condicional</b> durante el período habilitado en el calendario académico.',
  'El departamento de la carrera controla que cumplas los requisitos y la veracidad de lo declarado, elevando el informe correspondiente.',
  'Las autoridades emiten la resolución y se te notifica junto a tus docentes mediante el acta de condicionales.',
  'Con la resolución notificada, te inscribís en la materia condicional. Los docentes te toman asistencia y te habilitan a parciales/recuperatorios.',
  'Tenés que regularizar/aprobar la correlativa pendiente antes de la fecha límite estipulada. Si no lo hacés, <b>perdés la condicionalidad</b>.',
]

function MacheteCard({ machete, nombrePlan }) {
  const { horasFaltantes, umbral, elegible, disponible, anioMax } = machete
  if (anioMax <= 1) {
    return (
      <div className="notebook-panel rounded-2xl p-5 border border-[#e2dcce] bg-white">
        <p className="text-xs text-[#57534e] italic">Cargá materias con "Año Curricular" para poder evaluar esta excepción.</p>
      </div>
    )
  }
  if (!disponible) {
    return (
      <div className="notebook-panel rounded-2xl p-5 border border-[#e2dcce] bg-white">
        <p className="text-xs text-[#57534e] italic">
          Esta carrera no tiene cargado un límite de horas para la excepción de Adelanto de Nivel (lo configura el admin en el panel de Carreras).
        </p>
      </div>
    )
  }
  const pct = Math.min(100, Math.round((horasFaltantes / umbral) * 100))
  return (
    <div className="notebook-panel rounded-2xl p-5 border border-[#e2dcce] bg-white">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-[#1a1916] flex items-center gap-2">
            <FastForward className={`w-4 h-4 ${elegible ? 'text-emerald-700' : 'text-[#78716c]'}`} />
            Excepción de Adelanto de Nivel
          </h3>
          <p className="text-xs text-[#57534e] mt-1 max-w-xl leading-relaxed">
            Compara las horas semanales de lo que todavía no aprobaste (1º a {anioMax - 1}º año) contra las horas totales del último año ({umbral} hs, {nombrePlan}). Si lo que te falta pesa menos que ese límite, podés solicitar cursar materias del último año sin haber terminado todas las de los años anteriores.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            elegible
              ? 'bg-[#dcfce7] text-[#14532d] border-emerald-600'
              : 'bg-[#f5f5f4] text-[#44403c] border-[#78716c]'
          }`}
        >
          {elegible ? <CheckCircle2 className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
          {elegible ? 'Cumplís la excepción' : 'Todavía no la cumplís'}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="text-[#44403c]">
            Te faltan <b className={elegible ? 'text-emerald-800' : 'text-amber-800'}>{horasFaltantes} hs</b> semanales por aprobar
          </span>
          <span className="text-[#78716c]">límite: {umbral} hs</span>
        </div>
        <div className="w-full h-2.5 bg-[#f4efe6] rounded-full overflow-hidden border border-[#d6cebf]">
          <div
            className={`h-full ${elegible ? 'bg-emerald-600' : 'bg-amber-500'} transition-all duration-500`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-[11px] text-[#57534e] mt-3">
        {elegible
          ? `Como ${horasFaltantes} < ${umbral}, podés solicitar la excepción para cursar materias de ${anioMax}º año.`
          : `Necesitás bajar ${horasFaltantes - umbral + 1} hs más (aprobando materias) para que aplique la excepción.`}
      </p>
    </div>
  )
}

function EmptyBox({ text }) {
  return (
    <div className="col-span-full py-8 text-center text-xs text-[#57534e] italic notebook-panel rounded-xl border border-[#e2dcce] bg-white p-4">
      {text}
    </div>
  )
}
