// ─────────────────────────────────────────────────────────────────────────
// Cache local (stale-while-revalidate) del último snapshot de datos.
//
// El backend vive en una tablet con Termux detrás de un túnel: la primera
// respuesta puede tardar segundos (o no llegar, si el dispositivo está
// dormido). Guardar el último snapshot permite pintar la app al instante y
// revalidar en segundo plano, además de que siga siendo usable en modo
// lectura cuando la tablet no responde.
//
// El cache es por usuario (y por carrera, donde corresponde) para que no se
// filtre el progreso de una sesión a otra en el mismo navegador.
// ─────────────────────────────────────────────────────────────────────────

const PREFIX = 'qpc_cache_'
const VERSION = 1
// Un snapshot más viejo que esto se ignora: es preferible el loader a
// mostrar un plan de estudios de hace semanas como si fuera actual.
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function key(nombre, scope) {
  return `${PREFIX}${VERSION}_${nombre}_${scope ?? 'global'}`
}

export function readCache(nombre, scope) {
  try {
    const raw = localStorage.getItem(key(nombre, scope))
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (!ts || Date.now() - ts > MAX_AGE_MS) {
      localStorage.removeItem(key(nombre, scope))
      return null
    }
    return data
  } catch (_) {
    return null
  }
}

export function writeCache(nombre, scope, data) {
  try {
    localStorage.setItem(key(nombre, scope), JSON.stringify({ ts: Date.now(), data }))
  } catch (_) {
    // Cuota llena o localStorage no disponible (modo privado): el cache es
    // una optimización, nunca un requisito para que la app funcione.
  }
}

/** Borra todo el cache (al cerrar sesión: los datos son del usuario anterior). */
export function clearCache() {
  try {
    const claves = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(PREFIX)) claves.push(k)
    }
    claves.forEach(k => localStorage.removeItem(k))
  } catch (_) { /* noop */ }
}
