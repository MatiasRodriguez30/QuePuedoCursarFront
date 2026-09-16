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

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) defaultHeaders['Authorization'] = `Bearer ${token}`
  options.headers = { ...defaultHeaders, ...options.headers }

  const res = await fetch(`${API_BASE}${endpoint}`, options)
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
    throw new Error(errDetail)
  }
  if (res.status === 204) return null
  return res.json()
}
