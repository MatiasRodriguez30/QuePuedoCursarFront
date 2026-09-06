// ─────────────────────────────────────────────────────────────────────────
// Lógica de negocio pura (correlatividades, excepciones, ruta sugerida).
// Recibe siempre un `ctx` = { materias, estadosMap, prerequisitos, prereqsByMateria, configApp }
// en vez de depender de variables globales, para que sea testeable y reusable
// entre componentes de React sin acoplarse al estado de ningún componente.
// ─────────────────────────────────────────────────────────────────────────

export function formatEstadoText(estado) {
  switch (estado) {
    case 'PROMOCIONADA': return 'Aprobada'
    case 'REGULAR': return 'Regular'
    case 'CURSANDO': return 'Cursando'
    case 'NO_CURSADA': return 'No Cursada'
    default: return estado
  }
}

// `estados` es inyectable (default: el mapa real de ctx) para poder simular
// escenarios hipotéticos, por ejemplo "¿qué se desbloquea si apruebo lo que
// estoy cursando?" sin tocar el estado real.
export function checkCursadaRequirements(materiaId, ctx, estados = ctx.estadosMap) {
  const estadoActual = estados[materiaId] || 'NO_CURSADA'
  const reqs = ctx.prereqsByMateria[materiaId] || []

  if (estadoActual === 'PROMOCIONADA') {
    return { puede: false, aprobada: true, regular: false, motivo: 'Asignatura ya aprobada', pendientes: [] }
  }
  if (estadoActual === 'REGULAR') {
    return { puede: true, aprobada: false, regular: true, motivo: 'Cursada regularizada (Habilitado a rendir examen final)', pendientes: [] }
  }
  if (estadoActual === 'CURSANDO') {
    return { puede: false, aprobada: false, regular: false, cursando: true, motivo: 'Actualmente cursando (resultado pendiente)', pendientes: [] }
  }

  const pendientes = []
  for (const p of reqs) {
    const reqEstado = estados[p.materia_requerida_id] || 'NO_CURSADA'
    const reqNombre = p.materia_requerida ? p.materia_requerida.nombre : `Materia #${p.materia_requerida_id}`

    if (p.tipo === 'REGULARIZADA') {
      if (reqEstado !== 'REGULAR' && reqEstado !== 'PROMOCIONADA') {
        pendientes.push({ materia: reqNombre, exige: 'Cursada Regular', actual: formatEstadoText(reqEstado) })
      }
    } else if (p.tipo === 'APROBADA') {
      if (reqEstado !== 'PROMOCIONADA') {
        pendientes.push({ materia: reqNombre, exige: 'Final Aprobado', actual: formatEstadoText(reqEstado) })
      }
    }
  }

  return {
    puede: pendientes.length === 0,
    aprobada: false,
    regular: false,
    motivo: pendientes.length === 0 ? 'Requisitos cumplidos' : 'Requisitos previos pendientes',
    pendientes,
  }
}

// Cuántas materias (aún no aprobadas) tienen a `materiaId` como requisito directo.
export function computeImpacto(materiaId, ctx) {
  return ctx.prerequisitos.filter(p => {
    if (p.materia_requerida_id !== materiaId) return false
    const estadoDependiente = ctx.estadosMap[p.materia_id] || 'NO_CURSADA'
    return estadoDependiente !== 'PROMOCIONADA'
  }).length
}

// "Cuánto te atrasa" una materia: impacto en CASCADA. No sólo cuenta lo que
// depende directamente de `materiaId`, sino todo lo que queda bloqueado
// transitivamente, más las horas semanales que representa esa cadena.
export function computeImpactoCascada(materiaId, ctx) {
  const visitados = new Set()
  const cola = [materiaId]
  while (cola.length) {
    const actual = cola.pop()
    ctx.prerequisitos.forEach(p => {
      if (p.materia_requerida_id !== actual) return
      const dependienteId = p.materia_id
      const estadoDependiente = ctx.estadosMap[dependienteId] || 'NO_CURSADA'
      if (estadoDependiente === 'PROMOCIONADA') return
      if (visitados.has(dependienteId)) return
      visitados.add(dependienteId)
      cola.push(dependienteId)
    })
  }
  const materiasBloqueadas = [...visitados].map(id => ctx.materias.find(m => m.id === id)).filter(Boolean)
  const horas = materiasBloqueadas.reduce((sum, m) => sum + (m.horas_semanales || 0), 0)
  return { cantidad: materiasBloqueadas.length, horas, materias: materiasBloqueadas }
}

// ── Calendario académico: en qué cuatrimestre estamos "ahora" ───────────
// Si el alumno configuró manualmente año/cuatrimestre, se usa eso. Si no,
// se estima con la fecha del dispositivo: 1er cuatrimestre ~ marzo-julio,
// 2do cuatrimestre ~ agosto-diciembre, enero/febrero = receso de verano.
export function getPeriodoActual(configApp, fecha = new Date()) {
  if (configApp && configApp.anio_actual && configApp.cuatrimestre_actual) {
    return { anio: configApp.anio_actual, cuatrimestre: configApp.cuatrimestre_actual, manual: true }
  }
  const mes = fecha.getMonth()
  const anio = fecha.getFullYear()
  if (mes <= 1) return { anio, cuatrimestre: 0 }
  if (mes <= 6) return { anio, cuatrimestre: 1 }
  return { anio, cuatrimestre: 2 }
}

export function proximaOportunidad(materia, ctx) {
  const { anio, cuatrimestre: actual } = getPeriodoActual(ctx.configApp)
  const c = materia.cuatrimestre

  if (!c) {
    if (actual === 1) return { ahora: true, texto: `Cursándose ahora (anual, ${anio})` }
    const proxAnio = actual === 0 ? anio : anio + 1
    return { ahora: false, texto: `Próxima apertura: marzo de ${proxAnio} (anual)` }
  }
  if (c === actual) {
    return { ahora: true, texto: `Se dicta ahora (${c}° cuatrimestre ${anio})` }
  }
  if (c === 1) {
    const proxAnio = actual === 2 ? anio + 1 : anio
    return { ahora: false, texto: `Próxima oportunidad: 1er cuatrimestre ${proxAnio} (marzo-julio)` }
  }
  const proxAnio = actual === 0 ? anio : (actual === 1 ? anio : anio + 1)
  return { ahora: false, texto: `Próxima oportunidad: 2do cuatrimestre ${proxAnio} (agosto-diciembre)` }
}

// ── Excepción "Machete" — Ordenanza 1872 (adelanto de nivel) ────────────
export const HORAS_ULTIMO_ANIO_SISTEMAS_2023 = 32

export function checkExcepcionMachete(ctx) {
  const anioMax = Math.max(0, ...ctx.materias.filter(m => !m.codigo.startsWith('E-')).map(m => m.anio || 0))
  const horasFaltantes = ctx.materias
    .filter(m => !m.codigo.startsWith('E-') && m.anio && m.anio < anioMax)
    .filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') !== 'PROMOCIONADA')
    .reduce((sum, m) => sum + (m.horas_semanales || 0), 0)

  return {
    horasFaltantes,
    umbral: HORAS_ULTIMO_ANIO_SISTEMAS_2023,
    elegible: horasFaltantes < HORAS_ULTIMO_ANIO_SISTEMAS_2023,
    anioMax,
  }
}

// ── Excepción de Cursado Condicional (falta 1 sola correlativa) ─────────
// null = "Anual". Combinaciones no listadas en la pauta oficial => null.
const TABLA_CONDICIONALIDAD = {
  '1|1': true, '1|2': false, '1|null': false,
  '2|1': true, '2|null': true,
  'null|1': true, 'null|2': true, 'null|null': true,
}

export function otorgaCondicionalidad(cuatSolicitada, cuatCorrelativa) {
  const key = `${cuatSolicitada ?? 'null'}|${cuatCorrelativa ?? 'null'}`
  return Object.prototype.hasOwnProperty.call(TABLA_CONDICIONALIDAD, key) ? TABLA_CONDICIONALIDAD[key] : null
}

export function computeCondicionalidadCandidatos(ctx) {
  const candidatos = []
  ctx.materias.forEach(m => {
    const estado = ctx.estadosMap[m.id] || 'NO_CURSADA'
    if (estado !== 'NO_CURSADA') return
    if (!m.anio || m.anio < 4) return
    const check = checkCursadaRequirements(m.id, ctx)
    if (check.puede || check.pendientes.length !== 1) return

    const reqs = ctx.prereqsByMateria[m.id] || []
    const pendiente = reqs.find(p => {
      const reqEstado = ctx.estadosMap[p.materia_requerida_id] || 'NO_CURSADA'
      const okReg = p.tipo === 'REGULARIZADA' && (reqEstado === 'REGULAR' || reqEstado === 'PROMOCIONADA')
      const okApr = p.tipo === 'APROBADA' && reqEstado === 'PROMOCIONADA'
      return !okReg && !okApr
    })
    if (!pendiente) return

    const correlativa = pendiente.materia_requerida
    const otorga = otorgaCondicionalidad(m.cuatrimestre ?? null, correlativa ? (correlativa.cuatrimestre ?? null) : null)
    if (otorga !== true) return

    candidatos.push({ materia: m, pendiente, correlativa, tipo: pendiente.tipo })
  })
  return candidatos
}

// ── Predicción: ¿qué se desbloquea si apruebo lo que estoy cursando? ────
export function computePrediccionCursando(ctx) {
  const cursando = ctx.materias.filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') === 'CURSANDO')
  if (cursando.length === 0) return { cursando, desbloqueadas: [] }

  const estadosSimulados = { ...ctx.estadosMap }
  cursando.forEach(m => { estadosSimulados[m.id] = 'PROMOCIONADA' })

  const desbloqueadas = ctx.materias.filter(m => {
    const estadoActual = ctx.estadosMap[m.id] || 'NO_CURSADA'
    if (estadoActual !== 'NO_CURSADA') return false
    const yaPuede = checkCursadaRequirements(m.id, ctx, ctx.estadosMap).puede
    if (yaPuede) return false
    return checkCursadaRequirements(m.id, ctx, estadosSimulados).puede
  })

  return { cursando, desbloqueadas }
}

// ── Ruta sugerida: qué cursar ahora y qué se abre el próximo período ────
function materiaSeOfreceEnPeriodo(materia, periodo) {
  if (!periodo.cuatrimestre) return true
  if (!materia.cuatrimestre) return true
  return materia.cuatrimestre === periodo.cuatrimestre
}

export function computeRutaSugerida(ctx) {
  const periodoActual = getPeriodoActual(ctx.configApp)

  const paso1 = ctx.materias
    .filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') === 'NO_CURSADA')
    .filter(m => checkCursadaRequirements(m.id, ctx).puede)
    .filter(m => materiaSeOfreceEnPeriodo(m, periodoActual))
    .map(m => ({ materia: m, atraso: computeImpactoCascada(m.id, ctx) }))
    .sort((a, b) => b.atraso.cantidad - a.atraso.cantidad)

  const periodoSiguiente = periodoActual.cuatrimestre === 1
    ? { anio: periodoActual.anio, cuatrimestre: 2 }
    : { anio: periodoActual.anio + 1, cuatrimestre: 1 }

  const estadosSimulados = { ...ctx.estadosMap }
  paso1.forEach(({ materia }) => { estadosSimulados[materia.id] = 'PROMOCIONADA' })
  const idsPaso1 = new Set(paso1.map(p => p.materia.id))

  const paso2 = ctx.materias
    .filter(m => (ctx.estadosMap[m.id] || 'NO_CURSADA') === 'NO_CURSADA' && !idsPaso1.has(m.id))
    .filter(m => !checkCursadaRequirements(m.id, ctx, ctx.estadosMap).puede)
    .filter(m => checkCursadaRequirements(m.id, ctx, estadosSimulados).puede)
    .filter(m => materiaSeOfreceEnPeriodo(m, periodoSiguiente))
    .map(m => ({ materia: m, atraso: computeImpactoCascada(m.id, ctx) }))
    .sort((a, b) => b.atraso.cantidad - a.atraso.cantidad)

  return { paso1, paso2, periodoActual, periodoSiguiente }
}

export function buildPrereqsMap(materias, prerequisitos) {
  const map = {}
  materias.forEach(m => { map[m.id] = [] })
  prerequisitos.forEach(p => {
    if (!map[p.materia_id]) map[p.materia_id] = []
    map[p.materia_id].push(p)
  })
  return map
}
