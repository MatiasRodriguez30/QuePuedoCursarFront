import { useCallback, useEffect, useRef, useState } from 'react'
import { apiRequest, WS_URL } from './api'
import { buildPrereqsMap, formatEstadoText } from './businessLogic'

// Hook central: trae todo (materias, estados, prerequisitos, config), abre el
// WebSocket y mantiene el estado sincronizado en tiempo real. Devuelve tanto
// los datos como los setters/acciones que los componentes necesitan.
export function useAppData(showToast) {
  const [materias, setMaterias] = useState([])
  const [estadosMap, setEstadosMap] = useState({})
  const [prerequisitos, setPrerequisitos] = useState([])
  const [configApp, setConfigApp] = useState({ anio_actual: null, cuatrimestre_actual: null })
  const [wsStatus, setWsStatus] = useState('connecting') // connecting | connected | disconnected
  const [loading, setLoading] = useState(true)

  const wsRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast

  const prereqsByMateria = buildPrereqsMap(materias, prerequisitos)
  const ctx = { materias, estadosMap, prerequisitos, prereqsByMateria, configApp }

  const reloadPrereqs = useCallback(async () => {
    const data = await apiRequest('/prerequisitos')
    setPrerequisitos(data)
  }, [])

  const fetchAll = useCallback(async () => {
    try {
      const [mats, ests, prereqs, cfg] = await Promise.all([
        apiRequest('/materias'),
        apiRequest('/estados'),
        apiRequest('/prerequisitos'),
        apiRequest('/config').catch(() => ({ anio_actual: null, cuatrimestre_actual: null })),
      ])
      setMaterias(mats)
      const eMap = {}
      ests.forEach(e => { eMap[e.materia_id] = e.estado })
      setEstadosMap(eMap)
      setPrerequisitos(prereqs)
      setConfigApp(cfg)
    } catch (err) {
      showToastRef.current?.('error', 'Error de Carga', 'No se pudo sincronizar con el servidor: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── WebSocket ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    let reconnectTimer = null

    function connect() {
      if (cancelled) return
      let ws
      try {
        ws = new WebSocket(WS_URL)
      } catch (_) {
        setWsStatus('disconnected')
        reconnectTimer = setTimeout(connect, 4000)
        return
      }
      wsRef.current = ws

      ws.onopen = () => {
        setWsStatus('connected')
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping')
        }, 20000)
      }

      ws.onclose = () => {
        setWsStatus('disconnected')
        clearInterval(pingIntervalRef.current)
        if (!cancelled) reconnectTimer = setTimeout(connect, 4000)
      }

      ws.onerror = () => setWsStatus('disconnected')

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          handleEvent(payload)
        } catch (e) {
          console.error('Error parseando WS message:', e)
        }
      }
    }

    function handleEvent({ event, data }) {
      switch (event) {
        case 'materia_creada':
          setMaterias(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
          setEstadosMap(prev => ({ ...prev, [data.id]: 'NO_CURSADA' }))
          showToastRef.current?.('success', 'Nueva Asignatura', `"${data.nombre}" agregada al plan`)
          break

        case 'materia_actualizada':
          setMaterias(prev => prev.map(m => m.id === data.id ? data : m))
          showToastRef.current?.('info', 'Asignatura Modificada', `"${data.nombre}" actualizada`)
          break

        case 'materia_eliminada':
          setMaterias(prev => prev.filter(m => m.id !== data.id))
          setEstadosMap(prev => { const n = { ...prev }; delete n[data.id]; return n })
          setPrerequisitos(prev => prev.filter(p => p.materia_requerida_id !== data.id && p.materia_id !== data.id))
          showToastRef.current?.('warning', 'Asignatura Eliminada', 'Se removió del plan de estudios')
          break

        case 'prerequisito_creado':
          reloadPrereqs()
          showToastRef.current?.('info', 'Correlatividad Establecida', 'Requisito registrado')
          break

        case 'prerequisito_eliminado':
          reloadPrereqs()
          showToastRef.current?.('warning', 'Correlatividad Removida', 'Requisito eliminado')
          break

        case 'estado_actualizado':
          setEstadosMap(prev => ({ ...prev, [data.materia_id]: data.estado }))
          showToastRef.current?.('success', 'Estado Actualizado', `${data.materia?.nombre || 'Materia'} → ${formatEstadoText(data.estado)}`)
          break

        case 'estados_reseteados': {
          const eMap = {}
          ;(data || []).forEach(e => { eMap[e.materia_id] = e.estado })
          setEstadosMap(eMap)
          showToastRef.current?.('warning', 'Avance Reiniciado', 'Todas las materias volvieron a No Cursada')
          break
        }

        case 'config_actualizada':
          setConfigApp(data)
          showToastRef.current?.('info', 'Período Actualizado', 'Cuatrimestre actual sincronizado')
          break

        default:
          break
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
      clearInterval(pingIntervalRef.current)
      wsRef.current?.close()
    }
  }, [reloadPrereqs])

  return { ctx, loading, wsStatus, setEstadosMap, setConfigApp, refetch: fetchAll }
}
