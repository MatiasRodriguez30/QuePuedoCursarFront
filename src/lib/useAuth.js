import { useCallback, useEffect, useState } from 'react'
import { apiRequest, getToken, setToken, setUnauthorizedHandler } from './api'

export function useAuth() {
  const [usuario, setUsuario] = useState(null)
  const [checking, setChecking] = useState(true)

  const cargarUsuario = useCallback(async () => {
    if (!getToken()) {
      setUsuario(null)
      setChecking(false)
      return
    }
    try {
      const u = await apiRequest('/auth/me')
      setUsuario(u)
    } catch (_) {
      setUsuario(null)
    } finally {
      setChecking(false)
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => setUsuario(null))
    cargarUsuario()
  }, [cargarUsuario])

  const login = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(data.token)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const registrar = useCallback(async (email, password) => {
    const data = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) })
    setToken(data.token)
    setUsuario(data.usuario)
    return data.usuario
  }, [])

  const logout = useCallback(async () => {
    try { await apiRequest('/auth/logout', { method: 'POST' }) } catch (_) { /* noop */ }
    setToken(null)
    setUsuario(null)
  }, [])

  return { usuario, checking, login, registrar, logout, esAdmin: usuario?.rol === 'ADMIN' }
}
