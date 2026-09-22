// ─────────────────────────────────────────────────────────────────────────
// Lógica pura de validación, reducción y utilidades para Grupos y Logros.
// ─────────────────────────────────────────────────────────────────────────

// Apodo: 2-20 caracteres, admite letras con acentos/ñ (\p{L}), números (\p{N}), espacios y _ - .
export const APODO_REGEX = /^[\p{L}\p{N} _.-]{2,20}$/u

export function validarApodo(raw) {
  if (typeof raw !== 'string') {
    return { valido: false, error: 'El apodo debe ser texto', valor: '' }
  }
  const valor = raw.trim()
  if (valor.length < 2) {
    return { valido: false, error: 'El apodo debe tener al menos 2 caracteres', valor }
  }
  if (valor.length > 20) {
    return { valido: false, error: 'El apodo no puede superar los 20 caracteres', valor }
  }
  if (!APODO_REGEX.test(valor)) {
    return {
      valido: false,
      error: 'Sólo se permiten letras, números, espacios y los signos _ - .',
      valor
    }
  }
  return { valido: true, valor }
}

export function validarNombreGrupo(raw) {
  if (typeof raw !== 'string') {
    return { valido: false, error: 'El nombre debe ser texto', valor: '' }
  }
  const valor = raw.trim()
  if (valor.length < 2) {
    return { valido: false, error: 'El nombre debe tener al menos 2 caracteres', valor }
  }
  if (valor.length > 40) {
    return { valido: false, error: 'El nombre no puede superar los 40 caracteres', valor }
  }
  return { valido: true, valor }
}

export function validarCodigoGrupo(raw) {
  if (typeof raw !== 'string') {
    return { valido: false, error: 'El código debe ser texto', valor: '' }
  }
  const valor = raw.trim().toUpperCase()
  if (valor.length < 2) {
    return { valido: false, error: 'Ingresá un código de invitación válido', valor }
  }
  return { valido: true, valor }
}

// ── Reducer para la cola de sellos de logros en vivo ─────────────────────
// Mantiene máximo 3 sellos visibles a la vez. Cada sello tiene un id único
// y fecha de expiración para auto-cierre tras ~6 segundos.
export const MAX_SELLOS_VISIBLES = 3

export const logrosInitialState = []

export function logrosReducer(state = logrosInitialState, action) {
  switch (action.type) {
    case 'AGREGAR_LOGRO': {
      const { logro } = action
      if (!logro || !logro.id) return state
      // Evitar duplicados exactos
      if (state.some(item => item.id === logro.id)) return state
      // Insertar al frente y limitar a MAX_SELLOS_VISIBLES
      return [logro, ...state].slice(0, MAX_SELLOS_VISIBLES)
    }

    case 'DESCARTAR_LOGRO': {
      return state.filter(item => item.id !== action.id)
    }

    case 'LIMPIAR_LOGROS': {
      return []
    }

    default:
      return state
  }
}

// ── Copiar texto al portapapeles con fallback robusto para HTTP/desarrollo ──
export async function copiarAlPortapapeles(texto) {
  if (!texto) return false
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(texto)
      return true
    } catch {
      // Fallback a execCommand si clipboard falla
    }
  }

  // Fallback con elemento textarea temporal
  try {
    const textArea = document.createElement('textarea')
    textArea.value = texto
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    textArea.style.top = '-9999px'
    textArea.setAttribute('readonly', '')
    document.body.appendChild(textArea)
    textArea.select()
    const exitoso = document.execCommand('copy')
    document.body.removeChild(textArea)
    return exitoso
  } catch (err) {
    console.error('Error al copiar texto con fallback:', err)
    return false
  }
}

// ── Lógica de "Quién cursa esto ahora" en el grupo ───────────────────────

/**
 * Reconstruye el mapa { [materia_id]: [{ usuario_id, apodo }] } a partir
 * de la lista de entradas de GET /grupos/mio/cursando, excluyendo al usuario actual.
 */
export function reconstruirCursandoPorMateria(entries = [], miUsuarioId = null) {
  if (!Array.isArray(entries)) return {}
  const mapa = {}
  for (const entry of entries) {
    if (!entry || typeof entry.materia_id === 'undefined') continue
    if (miUsuarioId != null && entry.usuario_id === miUsuarioId) continue
    const mId = entry.materia_id
    if (!mapa[mId]) {
      mapa[mId] = []
    }
    // Evitar entradas duplicadas del mismo usuario en la misma materia
    if (!mapa[mId].some(u => u.usuario_id === entry.usuario_id)) {
      mapa[mId].push({
        usuario_id: entry.usuario_id,
        apodo: entry.apodo || 'Compañero'
      })
    }
  }
  return mapa
}

/**
 * Aplica un evento en vivo 'grupo_cursando' { usuario_id, apodo, materia_id, cursando: boolean }
 * sobre el mapa cursandoPorMateria existente, devolviendo un nuevo mapa inmutable.
 * Excluye los eventos del propio usuario.
 */
export function aplicarEventoGrupoCursando(mapaActual = {}, evento = {}, miUsuarioId = null) {
  if (!evento || typeof evento.materia_id === 'undefined') return mapaActual
  if (miUsuarioId != null && evento.usuario_id === miUsuarioId) return mapaActual

  const mId = evento.materia_id
  const listaActual = mapaActual[mId] || []

  if (evento.cursando) {
    const yaExiste = listaActual.some(u => u.usuario_id === evento.usuario_id)
    const nuevaLista = yaExiste
      ? listaActual.map(u => u.usuario_id === evento.usuario_id ? { ...u, apodo: evento.apodo || u.apodo } : u)
      : [...listaActual, { usuario_id: evento.usuario_id, apodo: evento.apodo || 'Compañero' }]
    return {
      ...mapaActual,
      [mId]: nuevaLista
    }
  } else {
    const nuevaLista = listaActual.filter(u => u.usuario_id !== evento.usuario_id)
    if (nuevaLista.length === 0) {
      const nuevoMapa = { ...mapaActual }
      delete nuevoMapa[mId]
      return nuevoMapa
    }
    return {
      ...mapaActual,
      [mId]: nuevaLista
    }
  }
}

/**
 * Formatea los apodos de quienes están cursando para la ficha de materia:
 * - 1 amigo: "Fulano"
 * - 2 amigos: "Fulano, Mengano"
 * - 3+ amigos: "Fulano y N más"
 */
export function formatearCursandoTexto(amigos = []) {
  if (!Array.isArray(amigos) || amigos.length === 0) return ''
  const apodos = amigos.map(a => a.apodo).filter(Boolean)
  if (apodos.length === 0) return ''
  if (apodos.length === 1) return apodos[0]
  if (apodos.length === 2) return `${apodos[0]}, ${apodos[1]}`
  return `${apodos[0]} y ${apodos.length - 1} más`
}

/**
 * Formatea el texto del badge para tarjetas (Hoy / Listas):
 * - 1 amigo: "1 amigo la cursa"
 * - 2+ amigos: "N amigos la cursan"
 */
export function formatearBadgeCursando(cantidad = 0) {
  if (!cantidad || cantidad <= 0) return ''
  if (cantidad === 1) return '1 amigo la cursa'
  return `${cantidad} amigos la cursan`
}
