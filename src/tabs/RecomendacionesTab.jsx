import { useMemo } from 'react'
import { AlertTriangle, ArrowRight, BadgeCheck, CalendarClock, CheckCircle, CircleDashed, FastForward, Lightbulb, ListChecks, ShieldCheck, Shuffle } from 'lucide-react'
import { checkExcepcionMachete, computeCondicionalidadCandidatos, proximaOportunidad } from '../lib/businessLogic'

export default function RecomendacionesTab({ ctx }) {
  const machete = useMemo(() => checkExcepcionMachete(ctx), [ctx])
  const candidatos = useMemo(() => computeCondicionalidadCandidatos(ctx), [ctx])
  const basicas = ctx.materias.filter(m => m.es_basica_compartida && (ctx.estadosMap[m.id] || 'NO_CURSADA') !== 'PROMOCIONADA')

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-800/80">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          Recomendaciones y Excepciones de Correlatividad
        </h2>
        <p className="text-xs text-slate-400">Basado en el "Machete" de prerequisitos (Ordenanza 1872) y las Pautas para Solicitud de Condicionalidad de Cursado (marzo/2023) de la Facultad. Son <b>orientativas</b>: la resolución final siempre depende del Departamento / Consejo Directivo.</p>
      </div>

      <MacheteCard machete={machete} />

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          Candidatos a Cursado Condicional
        </h3>
        <p className="text-xs text-slate-400 mb-3">Materias de 4º o 5º nivel a las que te falta <b>una sola</b> correlativa y el cruce de cuatrimestres habilita pedir la excepción.</p>
        {candidatos.length === 0 ? (
          <EmptyBox text="Ninguna materia bloqueada por una sola correlativa con cruce de cuatrimestres habilitado, por ahora." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {candidatos.map(({ materia, correlativa, tipo }) => {
              const cCuat = materia.cuatrimestre ? `${materia.cuatrimestre}°C` : 'Anual'
              const rCuat = correlativa?.cuatrimestre ? `${correlativa.cuatrimestre}°C` : 'Anual'
              return (
                <div key={materia.id} className="glass-card rounded-xl p-4 border border-brand-500/30 bg-brand-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{materia.codigo}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">{cCuat}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug mb-2">{materia.nombre}</h4>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    Te falta <span className="font-semibold text-amber-300">{tipo === 'REGULARIZADA' ? 'regularizar' : 'aprobar'}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mt-0.5">{correlativa?.nombre} <span className="text-[10px] text-slate-500 font-normal">({rCuat})</span></div>
                  <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-emerald-300 flex items-center gap-1.5">
                    <BadgeCheck className="w-3.5 h-3.5" /> Cruce de cuatrimestres habilitado
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
          <Shuffle className="w-4 h-4 text-teal-400" />
          Materias Básicas con Comisión Compartida
        </h3>
        <p className="text-xs text-slate-400 mb-3">Se dictan también en el Aula General de Ciencias Básicas, compartida con otras especialidades (Civil, Electromecánica, Industrial, etc.). Si el horario de Sistemas no te cierra, podés cursarlas en esa comisión general.</p>
        {basicas.length === 0 ? (
          <EmptyBox text="No hay materias básicas compartidas pendientes." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {basicas.map(m => {
              const estado = ctx.estadosMap[m.id] || 'NO_CURSADA'
              const prox = proximaOportunidad(m, ctx)
              return (
                <div key={m.id} className="glass-card rounded-xl p-4 border border-teal-500/25 bg-teal-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{m.codigo}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">{estado}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug mb-1.5">{m.nombre}</h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5 text-slate-500" /> {prox.texto}
                  </p>
                  <p className="text-[11px] text-teal-300/90 mt-1.5">Consultá horarios en la comisión general de Ciencias Básicas si el de Sistemas te superpone.</p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-emerald-400" />
          Paso a Paso para Tramitar una Excepción
        </h3>
        <ol className="space-y-2.5 text-xs text-slate-300">
          {PASOS.map((texto, i) => (
            <li key={i} className="flex gap-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-brand-400">{i + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: texto }} />
            </li>
          ))}
        </ol>
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>Límites que el sistema <b>no puede verificar automáticamente</b> y tenés que controlar vos: la condicionalidad se otorga <b>una sola vez en toda la carrera</b>, y el total de materias que cursás + solicitás como condicionales no puede superar <b>7</b>.</span>
        </div>
      </div>
    </div>
  )
}

const PASOS = [
  'Verificá que cumplís los requisitos: para adelanto de nivel, que las horas que te faltan aprobar sean menores a las horas del último año; para condicionalidad, que sólo te falte <b>una</b> correlativa y que nunca hayas tenido condicionalidad antes en la carrera.',
  'Entrá a <b>Autogestión</b> y completá el <b>"Formulario Digital para Solicitud de Recursado y/o Excepciones"</b> (cursado condicional) durante el período habilitado en el calendario académico.',
  'El Departamento (con aval del Director) controla que cumplas los requisitos y la veracidad de lo declarado, y eleva un informe a la Comisión de Enseñanza / Consejo Departamental (máx. 2 semanas).',
  'El Consejo Directivo emite la resolución y se te notifica junto a tus docentes mediante el <b>"Acta de Alumnos Condicionales"</b>.',
  'Con la resolución notificada, te inscribís en la materia condicional. Los docentes te toman asistencia y te habilitan a parciales/recuperatorios mientras esté vigente el plazo.',
  'Tenés que regularizar/aprobar la correlativa pendiente antes del <b>4º llamado</b> (si es de 1er cuatrimestre) u <b>8º llamado</b> (si es de 2do cuatrimestre). Si no lo hacés, <b>perdés la condicionalidad</b>.',
]

function MacheteCard({ machete }) {
  const { horasFaltantes, umbral, elegible, anioMax } = machete
  if (anioMax <= 1) {
    return <div className="glass-panel rounded-2xl p-5 border border-slate-800/80"><p className="text-xs text-slate-500 italic">Cargá materias con "Año Curricular" para poder evaluar esta excepción.</p></div>
  }
  const pct = Math.min(100, Math.round((horasFaltantes / umbral) * 100))
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FastForward className={`w-4 h-4 ${elegible ? 'text-emerald-400' : 'text-slate-400'}`} />
            Excepción de Adelanto de Nivel (Ordenanza 1872)
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">Compara las horas semanales de lo que todavía no aprobaste (1º a {anioMax - 1}º año) contra las horas totales del último año ({umbral} hs, Plan Sistemas 2023). Si lo que te falta pesa menos, podés pedir cursar el último año sin haber terminado los anteriores (sólo para <b>cursar</b>, no para rendir finales).</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${elegible ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
          {elegible ? <CheckCircle className="w-3.5 h-3.5" /> : <CircleDashed className="w-3.5 h-3.5" />}
          {elegible ? 'Cumplís la excepción' : 'Todavía no la cumplís'}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-mono mb-1">
          <span className="text-slate-300">Te faltan <b className={elegible ? 'text-emerald-400' : 'text-amber-400'}>{horasFaltantes} hs</b> semanales por aprobar</span>
          <span className="text-slate-500">límite: {umbral} hs</span>
        </div>
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div className={`h-full ${elegible ? 'bg-emerald-500' : 'bg-amber-500'} transition-all duration-500`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <p className="text-[11px] text-slate-500 mt-3">
        {elegible
          ? `Como ${horasFaltantes} < ${umbral}, en teoría podés solicitar la excepción para cursar materias de ${anioMax}º año. Presentá la solicitud en Autogestión y esperá la resolución del Consejo Directivo.`
          : `Necesitás bajar ${horasFaltantes - umbral + 1} hs más (aprobando materias) para que aplique la excepción.`}
      </p>
    </div>
  )
}

function EmptyBox({ text }) {
  return <div className="col-span-full py-8 text-center text-xs text-slate-500 italic glass-panel rounded-xl border border-slate-800">{text}</div>
}
