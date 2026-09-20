// ─────────────────────────────────────────────────────────────────────────
// Resolución de la URL del backend + wrapper de fetch + sesión (token).
//
// Política de seguridad (v2):
//   - El parámetro ?api= del query string fue ELIMINADO para evitar ataques
//     de redirección de requests a servidores maliciosos (open-redirect).
//   - localStorage puede conservar una URL alternativa SOLO si su hostname
//     coincide con localhost, 127.0.0.1 o el hostname del DEFAULT_API_BASE.
//   - setApiBase() solo está disponible en entorno DEV (import.meta.env.DEV).
//
// Prioridad para la URL del backend: localStorage (validado) > variable de
// entorno VITE_API_URL (build time) > default hardcodeado.
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || 'https://quepuedocursar.takana.online'
const STORAGE_KEY = 'qpc_api_base'
const TOKEN_KEY = 'qpc_token'

/** Hostnames permitidos como override de API base. */
function allowedHostnames() {
  try {
    return ['localhost', '127.0.0.1', new URL(DEFAULT_API_BASE).hostname]
  } catch (_) {
    return ['localhost', '127.0.0.1']
  }
}

function resolveApiBase() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const hostname = new URL(stored).hostname
      if (allowedHostnames().includes(hostname)) return stored
      // URL almacenada inválida/insegura → limpiarla
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch (_) {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
  return DEFAULT_API_BASE
}

export const API_BASE = resolveApiBase()

// ── WebSocket ─────────────────────────────────────────────────────────────
/**
 * Construye la URL del WebSocket incluyendo el token de autenticación como
 * query param (?token=...), requerido por el backend para autorizar la
 * conexión WS. Devuelve null si no hay token disponible.
 */
export function getWsUrl() {
  const token = getToken()
  return token ? `${API_BASE.replace(/^http/, 'ws')}/ws?token=${token}` : null
}

// setApiBase solo disponible en dev para facilitar el desarrollo local.
export function setApiBase(url) {
  if (!import.meta.env.DEV) return
  const clean = url.replace(/\/$/, '')
  try { localStorage.setItem(STORAGE_KEY, clean) } catch (_) {}
  window.location.reload()
}

// ── Sesión ───────────────────────────────────────────────────────────────
export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY) } catch (_) { return null }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch (_) { /* noop */ }
}

// Se dispara cuando cualquier request recibe 401 (token inválido/vencido),
// para que la app pueda volver a la pantalla de login.
let onUnauthorized = null
export function setUnauthorizedHandler(fn) { onUnauthorized = fn }

// ── Política de red ──────────────────────────────────────────────────────
// El backend corre en una tablet (Termux + Cloudflare Tunnel): las requests
// pueden colgarse indefinidamente cuando el dispositivo duerme o pierde
// conectividad, y fallar de forma transitoria. Por eso todo pedido tiene
// timeout, los GET se reintentan con backoff, y los GET idénticos que están
// en vuelo al mismo tiempo comparten una sola respuesta.
const DEFAULT_TIMEOUT_MS = 12000
// Una escritura que se corta por timeout puede haberse aplicado igual en el
// servidor, así que se le da margen de sobra antes de darla por perdida.
const WRITE_TIMEOUT_MS = 30000
const GET_RETRIES = 2
const RETRY_BASE_DELAY_MS = 600

const inFlightGets = new Map()

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

class HttpError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

// Se distingue del AbortError del llamador: en una escritura, un timeout no
// significa que el servidor no la haya aplicado.
export class TimeoutError extends Error {
  constructor(timeoutMs) {
    super(`el servidor no respondió en ${Math.round(timeoutMs / 1000)}s`)
    this.name = 'TimeoutError'
  }
}

/** Errores que tiene sentido reintentar: red caída o backend momentáneamente inestable. */
function esReintentable(err) {
  if (err.name === 'AbortError') return false
  if (err instanceof HttpError) return err.status >= 500 || err.status === 429
  return true // TypeError de fetch: la tablet no respondió
}

/**
 * Combina el AbortSignal del llamador con el del timeout, para que cancele
 * el que se dispare primero sin perder el motivo real de la cancelación.
 */
function withTimeout(externalSignal, timeoutMs) {
  const controller = new AbortController()
  const estado = { expirado: false }
  const timer = setTimeout(() => {
    estado.expirado = true
    controller.abort(new TimeoutError(timeoutMs))
  }, timeoutMs)
  const onExternalAbort = () => controller.abort(externalSignal.reason)
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort(externalSignal.reason)
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true })
  }
  const cleanup = () => {
    clearTimeout(timer)
    externalSignal?.removeEventListener('abort', onExternalAbort)
  }
  return { signal: controller.signal, cleanup, estado }
}

async function doRequest(endpoint, options, timeoutMs) {
  const defaultHeaders = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`
  const { signal, cleanup, estado } = withTimeout(options.signal, timeoutMs)

  let res
  try {
    res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { ...defaultHeaders, ...options.headers },
      signal,
    })
  } catch (err) {
    throw estado.expirado ? new TimeoutError(timeoutMs) : err
  } finally {
    cleanup()
  }

  if (res.status === 401) {
    setToken(null)
    onUnauthorized?.()
  }
  if (!res.ok) {
    let errDetail = res.statusText
    try {
      const errJson = await res.json()
      errDetail = errJson.detail || errDetail
    } catch (_) { /* noop */ }
    throw new HttpError(errDetail, res.status)
  }
  if (res.status === 204) return null
  return res.json()
}

export async function apiRequest(endpoint, options = {}) {
  const { timeoutMs, retries, ...fetchOptions } = options
  const method = (fetchOptions.method || 'GET').toUpperCase()
  // Sólo los GET son seguros de reintentar/deduplicar: repetir un POST/PUT
  // podría duplicar escrituras en el backend.
  const esGet = method === 'GET'
  const timeout = timeoutMs ?? (esGet ? DEFAULT_TIMEOUT_MS : WRITE_TIMEOUT_MS)
  const intentos = (retries ?? (esGet ? GET_RETRIES : 0)) + 1

  const ejecutar = async () => {
    let ultimoError
    for (let intento = 0; intento < intentos; intento++) {
      try {
        return await doRequest(endpoint, fetchOptions, timeout)
      } catch (err) {
        ultimoError = err
        if (intento === intentos - 1 || !esReintentable(err)) break
        await sleep(RETRY_BASE_DELAY_MS * 2 ** intento)
      }
    }
    throw ultimoError
  }

  if (!esGet || fetchOptions.signal) return ejecutar()

  const enVuelo = inFlightGets.get(endpoint)
  if (enVuelo) return enVuelo
  const promesa = ejecutar().finally(() => inFlightGets.delete(endpoint))
  inFlightGets.set(endpoint, promesa)
  return promesa
}
