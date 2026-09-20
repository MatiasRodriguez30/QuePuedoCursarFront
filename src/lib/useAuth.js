import { useCallback, useEffect, useState } from 'react'
import { apiRequest, getToken, setToken, setUnauthorizedHandler } from './api'
import { clearCache, readCache, writeCache } from './cache'

// Con token guardado, la sesión arranca del último usuario conocido en vez
// de esperar a `/auth/me`: si no, una recarga con la tablet dormida se queda
// en el spinner de autenticación y el cache de datos nunca llega a pintarse.
// `/auth/me` revalida igual en segundo plano, y un 401 cierra la sesión.
function usuarioHidratado() {
  return getToken() ? readCache('usuario') : null
}

export function useAuth() {
  const [usuario, setUsuario] = useState(usuarioHidratado)
  const [checking, setChecking] = useState(() => !usuarioHidratado())

  const cargarUsuario = useCallback(async () => {
    if (!getToken()) {
      setUsuario(null)
      setChecking(false)
      return
    }
    try {
      const u = await apiRequest('/auth/me')
      setUsuario(u)
      writeCache('usuario', null, u)
    } catch (err) {
      // Sin respuesta de la tablet (o con un 5xx transitorio) se mantiene la
      // sesión hidratada: sólo un 401 (que ya limpió token y cache) significa
      // que dejó de ser válida.
      if (err.status === 401) setUsuario(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    // Un 401 termina la sesión igual que un logout explícito: el snapshot
    // cacheado es del usuario que se acaba de quedar afuera.
    setUnauthorizedHandler(() => {
      clearCache()
      setUsuario(null)
    })
    cargarUsuario()
  }, [cargarUsuario])

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(data.token)
    writeCache('usuario', null, data.usuario)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const registrar = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(data.token)
    writeCache('usuario', null, data.usuario)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }) } catch (_) { /* noop */ }
    setToken(null)
    // El snapshot cacheado es el avance académico del usuario que se va: no
    // puede quedar disponible para el que inicie sesión después.
    clearCache()
    setUsuario(null)
  }, [])

  return { usuario, checking, login, registrar, logout, esAdmin: usuario?.rol === 'ADMIN' }
}
