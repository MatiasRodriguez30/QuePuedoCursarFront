// ─────────────────────────────────────────────────────────────────────────
// Resolución de la URL del backend + wrapper de fetch.
//
// Prioridad: query param ?api=... (se guarda en localStorage) > localStorage
// > variable de entorno VITE_API_URL (build time) > default hardcodeado.
//
// Esto existe porque el backend corre en una tablet detrás de un Cloudflare
// Tunnel: si alguna vez cambia la URL, no hace falta redeployar el frontend,
// alcanza con abrir la app con ?api=https://nueva-url una vez.
// ─────────────────────────────────────────────────────────────────────────

const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || 'https://quepuedocursar.takana.online'
const STORAGE_KEY = 'qpc_api_base'

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

export async function apiRequest(endpoint, options = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' }
  options.headers = { ...defaultHeaders, ...options.headers }

  const res = await fetch(`${API_BASE}${endpoint}`, options)
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
