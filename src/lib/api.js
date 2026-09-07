// ─────────────────────────────────────────────────────────────────────────
// Resolución de la URL del backend + wrapper de fetch + sesión (token).
//
// Prioridad para la URL del backend: query param ?api=... (se guarda en
// localStorage) > localStorage > variable de entorno VITE_API_URL (build
// time) > default hardcodeado.
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || 'https://quepuedocursar.takana.online'
const STORAGE_KEY = 'qpc_api_base'
const TOKEN_KEY = 'qpc_token'

function resolveApiBase() {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('api')
    if (fromQuery) {
      const clean = fromQuery.replace(/\/$/, '')
      localStorage.setItem(STORAGE_KEY, clean)
      return clean
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return stored
  } catch (_) {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
  return DEFAULT_API_BASE
}

export const API_BASE = resolveApiBase()
export const WS_URL = `${API_BASE.replace(/^http/, 'ws')}/ws`

export function setApiBase(url) {
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
