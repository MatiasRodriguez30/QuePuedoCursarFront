import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiRequest, getWsUrl } from './api'
import { buildIndexes, formatEstadoText } from './businessLogic'
import { clearCacheDeCarrera, readCache, writeCache } from './cache'

const CARRERA_STORAGE_KEY = 'qpc_carrera_id'
// Marca "todavía no se hidrató para nadie": no puede ser null ni undefined,
// que son valores válidos de usuarioId (sesión cerrada / aún sin resolver).
const SIN_HIDRATAR = Symbol('sin-hidratar')

function leerCarreraGuardada() {
  try {
    const raw = localStorage.getItem(CARRERA_STORAGE_KEY)
    return raw ? parseInt(raw, 10) : null
  } catch (_) { return null }
}

function guardarCarreraSeleccionada(id) {
  try {
    if (id) localStorage.setItem(CARRERA_STORAGE_KEY, String(id))
  } catch (_) { /* noop */ }
}

// Hook central: trae todo (carreras, materias, estados, prerequisitos,
// config, eventos), abre el WebSocket y mantiene el estado sincronizado en
// tiempo real. `usuarioId` gatilla la carga: sin sesión (null) no pide nada
// todavía. La carrera seleccionada (para ver su plan/materias/ruta) vive
// acá mismo, porque cambiarla dispara un refetch de materias/prereqs/config.
export function useAppData(showToast, usuarioId) {
  const [carreraInicial] = useState(leerCarreraGuardada)
  // Hidratación desde el último snapshot cacheado: la app se pinta con datos
  // reales en el primer frame y el fetch pasa a ser una revalidación en
  // segundo plano, en vez de una pantalla de carga bloqueante contra un
  // backend que puede tardar segundos en despertar.
  const [carreras, setCarreras] = useState([])
  // Quién es el dueño de `carreras`/`estadosMap` en memoria. Se ajusta
  // durante el render (no en un efecto) porque los efectos de persistencia
  // del mismo commit escribirían el avance del usuario saliente bajo la
  // clave del entrante.
  const [datosDeUsuario, setDatosDeUsuario] = useState(SIN_HIDRATAR)
  const [carreraId, setCarreraIdState] = useState(carreraInicial)
  const [materias, setMaterias] = useState(() => readCache('materias', carreraInicial) || [])
  const [estadosMap, setEstadosMap] = useState({})
  const [prerequisitos, setPrerequisitos] = useState(() => readCache('prereqs', carreraInicial) || [])
  const [configApp, setConfigApp] = useState(() => readCache('config', carreraInicial) || { anio_actual: null, cuatrimestre_actual: null })
  const [eventos, setEventos] = useState([])
  const [wsStatus, setWsStatus] = useState('connecting') // connecting | connected | disconnected
  const [loading, setLoading] = useState(() => !(readCache('materias', carreraInicial)?.length))

  if (usuarioId !== datosDeUsuario) {
    // Cambió la sesión: se descarta lo del usuario anterior y se hidrata
    // (o se vacía) con lo del nuevo. Nunca se conserva lo que había.
    setDatosDeUsuario(usuarioId)
    setCarreras(usuarioId ? readCache('carreras', usuarioId) || [] : [])
    setEstadosMap(usuarioId ? readCache('estados', usuarioId) || {} : {})
  }

  const usuarioIdRef = useRef(usuarioId)
  usuarioIdRef.current = usuarioId
  const carreraIdRef = useRef(carreraId)
  carreraIdRef.current = carreraId
  const materiasRef = useRef(materias)
  materiasRef.current = materias
  const carrerasRef = useRef(carreras)
  carrerasRef.current = carreras
  const estadosMapRef = useRef(estadosMap)
  estadosMapRef.current = estadosMap

  const wsRef = useRef(null)
  const pingIntervalRef = useRef(null)
  const showToastRef = useRef(showToast)
  showToastRef.current = showToast
  // Rango de fechas actualmente pedido por la Agenda, para saber si un evento
  // que llega por WS entra en lo que ya está cargado (si no, se ignora: se
  // va a traer solo cuando el usuario navegue a ese mes).
  const rangoEventosRef = useRef({ desde: null, hasta: null })

  // `ctx` se reconstruye sólo cuando cambian los datos, no en cada render:
  // es la dependencia de todos los useMemo de las pestañas (cálculo de
  // correlatividades, camino óptimo), así que una identidad nueva por
  // render recalculaba todo el plan de estudios al tipear en un buscador.
  const { prereqsByMateria, dependientesByMateria, materiasById } = useMemo(
    () => buildIndexes(materias, prerequisitos),
    [materias, prerequisitos],
  )
  const carreraActual = useMemo(() => carreras.find(c => c.id === carreraId) || null, [carreras, carreraId])
  const ctx = useMemo(
    () => ({ carreras, carreraActual, materias, estadosMap, prerequisitos, prereqsByMateria, dependientesByMateria, materiasById, configApp, eventos }),
    [carreras, carreraActual, materias, estadosMap, prerequisitos, prereqsByMateria, dependientesByMateria, materiasById, configApp, eventos],
  )

  const setCarreraId = useCallback((id) => {
    guardarCarreraSeleccionada(id)
    setCarreraIdState(id)
  }, [])

  const cargarEventos = useCallback(async (desde, hasta) => {
    rangoEventosRef.current = { desde, hasta }
    try {
      const data = await apiRequest(`/eventos?desde=${desde}&hasta=${hasta}`)
      // Si mientras esperaba la respuesta el usuario ya navegó a otro mes
      // (rangoEventosRef cambió), esta respuesta quedó vieja: aplicarla
      // pisaría los eventos del rango que se está mostrando ahora con los
      // de uno anterior. Se descarta; la carga del rango actual ya está en
      // vuelo (o ya resolvió) por su propio llamado a cargarEventos.
      if (rangoEventosRef.current.desde !== desde || rangoEventosRef.current.hasta !== hasta) return
      setEventos(data)
    } catch (err) {
      showToastRef.current?.('error', 'Error de Carga', 'No se pudo cargar la agenda: ' + err.message)
    }
  }, [])

  // Update optimista: la UI cambia en el acto y el PUT viaja en segundo
  // plano. Antes había que esperar el ida y vuelta + el eco del WebSocket
  // contra un backend en una tablet, con lo cual el botón parecía muerto
  // durante un par de segundos. Si el server rechaza, se revierte.
  const actualizarEstado = useCallback(async (materiaId, nuevoEstado) => {
    const anterior = estadosMapRef.current[materiaId]
    if (anterior === nuevoEstado) return
    setEstadosMap(prev => ({ ...prev, [materiaId]: nuevoEstado }))
    try {
      await apiRequest(`/estados/${materiaId}`, { method: 'PUT', body: JSON.stringify({ estado: nuevoEstado }) })
    } catch (err) {
      if (err.name === 'TimeoutError') {
        // El PUT puede haberse aplicado igual: revertir mostraría algo falso.
        // Se deja el valor optimista y el eco del WS (o el próximo fetch)
        // corrige si el servidor terminó rechazándolo.
        showToastRef.current?.('warning', 'Sin confirmación', 'El servidor tardó en responder: revisá el estado al reconectar')
        return
      }
      setEstadosMap(prev => {
        // Si mientras fallaba el usuario volvió a tocar la materia, el valor
        // vigente es el del último click: revertirlo pisaría esa intención.
        if (prev[materiaId] !== nuevoEstado) return prev
        const revertido = { ...prev }
        if (anterior === undefined) delete revertido[materiaId]
        else revertido[materiaId] = anterior
        return revertido
      })
      showToastRef.current?.('error', 'Error', 'No se pudo actualizar el estado: ' + err.message)
    }
  }, [])

  const reloadPrereqs = useCallback(async () => {
    if (!carreraIdRef.current) return
    const data = await apiRequest(`/prerequisitos?carrera_id=${carreraIdRef.current}`)
    setPrerequisitos(data)
  }, [])

  // Trae la lista de carreras y el progreso del usuario (cruza todas las
  // carreras: EstadoMateria vive ligado a la materia, no a una selección
  // puntual, así que no hace falta re-pedirlo al cambiar de carrera).
  const fetchInicial = useCallback(async () => {
    const pedidoPara = usuarioIdRef.current
    if (!pedidoPara) { setLoading(false); return }
    try {
      const [cars, ests] = await Promise.all([
        apiRequest('/carreras'),
        apiRequest('/estados'),
      ])
      // Si mientras viajaba la respuesta cambió la sesión, estos datos son
      // del usuario anterior: aplicarlos se los mostraría (y se los
      // guardaría en cache) al que está logueado ahora.
      if (usuarioIdRef.current !== pedidoPara) return
      setCarreras(cars)
      const eMap = {}
      ests.forEach(e => { eMap[e.materia_id] = e.estado })
      setEstadosMap(eMap)

      // Si no hay carrera seleccionada (primera vez) o la guardada ya no
      // existe, elegimos la primera disponible.
      if (cars.length > 0 && !cars.some(c => c.id === carreraIdRef.current)) {
        setCarreraId(cars[0].id)
      } else if (cars.length === 0) {
        // Todavía no se cargó ninguna carrera: no hay nada que esperar del
        // efecto de fetchCarrera (nunca se dispara sin carreraId), así que
        // el loading se apaga acá para no quedar colgado.
        setLoading(false)
      }
    } catch (err) {
      if (usuarioIdRef.current !== pedidoPara) return
      showToastRef.current?.('error', 'Error de Carga', 'No se pudo sincronizar con el servidor: ' + err.message)
      setLoading(false)
    }
  }, [setCarreraId])

  useEffect(() => {
    fetchInicial()
  }, [fetchInicial, usuarioId])

  // Persistencia del snapshot: se guarda el estado ya aplicado (venga de un
  // fetch, del WebSocket o de un update optimista), no cada respuesta suelta.
  // `datosDeUsuario !== usuarioId` significa que el estado en memoria todavía
  // es del usuario anterior: guardarlo ahora lo filtraría a la sesión nueva.
  const datosSonDelUsuarioActual = usuarioId && datosDeUsuario === usuarioId

  useEffect(() => {
    if (datosSonDelUsuarioActual && carreras.length) writeCache('carreras', usuarioId, carreras)
  }, [carreras, usuarioId, datosSonDelUsuarioActual])

  useEffect(() => {
    if (datosSonDelUsuarioActual) writeCache('estados', usuarioId, estadosMap)
  }, [estadosMap, usuarioId, datosSonDelUsuarioActual])

  useEffect(() => {
    if (!carreraId) return
    if (materias.length) {
      writeCache('materias', carreraId, materias)
      writeCache('prereqs', carreraId, prerequisitos)
      writeCache('config', carreraId, configApp)
    } else if (!loading) {
      // La carrera quedó sin materias: si no se borra, el snapshot viejo
      // seguiría hidratando un plan que ya no existe hasta que expire.
      clearCacheDeCarrera(carreraId)
    }
  }, [carreraId, materias, prerequisitos, configApp, loading])

  // Materias/prerequisitos/config son propios de la carrera seleccionada:
  // se recargan cada vez que cambia.
  const fetchCarrera = useCallback(async (id, signal) => {
    if (!id) { setLoading(false); return }
    try {
      const [mats, prereqs, cfg] = await Promise.all([
        apiRequest(`/materias?carrera_id=${id}`, { signal }),
        apiRequest(`/prerequisitos?carrera_id=${id}`, { signal }),
        apiRequest(`/config?carrera_id=${id}`, { signal }).catch(() => ({ carrera_id: id, anio_actual: null, cuatrimestre_actual: null })),
      ])
      if (signal?.aborted) return
      setMaterias(mats)
      setPrerequisitos(prereqs)
      setConfigApp(cfg)
    } catch (err) {
      if (signal?.aborted || err.name === 'AbortError') return
      showToastRef.current?.('error', 'Error de Carga', 'No se pudo cargar el plan de la carrera: ' + err.message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!carreraId) return
    // Si hay snapshot cacheado de esta carrera se muestra ya mismo y la red
    // revalida sin tapar la app con el loader.
    const cacheados = readCache('materias', carreraId)
    if (cacheados?.length) {
      setMaterias(cacheados)
      setPrerequisitos(readCache('prereqs', carreraId) || [])
      const cfg = readCache('config', carreraId)
      if (cfg) setConfigApp(cfg)
      setLoading(false)
    } else {
      setLoading(true)
    }
    // Cambiar de carrera cancela el fetch anterior: sin esto, la respuesta
    // lenta de la carrera vieja podía pisar a la nueva.
    const controller = new AbortController()
    fetchCarrera(carreraId, controller.signal)
    return () => controller.abort()
  }, [carreraId, fetchCarrera])

  // ── WebSocket ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!usuarioId) { setWsStatus('disconnected'); return }
    let cancelled = false
    let reconnectTimer = null

    function connect() {
      if (cancelled) return
      const wsUrl = getWsUrl()
      if (!wsUrl) {
        setWsStatus('disconnected')
        reconnectTimer = setTimeout(connect, 4000)
        return
      }
      let ws
      try {
        ws = new WebSocket(wsUrl)
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
          if (data.carrera_id !== carreraIdRef.current) break
          setMaterias(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data])
          setEstadosMap(prev => ({ ...prev, [data.id]: 'NO_CURSADA' }))
          showToastRef.current?.('success', 'Nueva Asignatura', `"${data.nombre}" agregada al plan`)
          break

        case 'materia_actualizada':
          if (data.carrera_id !== carreraIdRef.current) break
          setMaterias(prev => prev.map(m => m.id === data.id ? data : m))
          showToastRef.current?.('info', 'Asignatura Modificada', `"${data.nombre}" actualizada`)
          break

        case 'materia_eliminada': {
          // El payload sólo trae el id (no la carrera): usamos si estaba en
          // la lista actualmente cargada para no mostrar ruido de otra carrera.
          const eraDeEstaCarrera = materiasRef.current.some(m => m.id === data.id)
          setMaterias(prev => prev.filter(m => m.id !== data.id))
          setEstadosMap(prev => { if (!(data.id in prev)) return prev; const n = { ...prev }; delete n[data.id]; return n })
          setPrerequisitos(prev => prev.filter(p => p.materia_requerida_id !== data.id && p.materia_id !== data.id))
          if (eraDeEstaCarrera) showToastRef.current?.('warning', 'Asignatura Eliminada', 'Se removió del plan de estudios')
          break
        }

        case 'prerequisito_creado':
          if (data.materia_requerida?.carrera_id !== carreraIdRef.current) break
          reloadPrereqs()
          showToastRef.current?.('info', 'Correlatividad Establecida', 'Requisito registrado')
          break

        case 'prerequisito_eliminado':
          reloadPrereqs()
          showToastRef.current?.('warning', 'Correlatividad Removida', 'Requisito eliminado')
          break

        case 'estado_actualizado':
          // Sólo aplica si es el progreso del usuario logueado en ESTE navegador
          // (otros usuarios conectados reciben el mismo evento por otras
          // materias/personas, y deben ignorarlo).
          if (data.usuario_id !== usuarioIdRef.current) break
          setEstadosMap(prev => ({ ...prev, [data.materia_id]: data.estado }))
          showToastRef.current?.('success', 'Estado Actualizado', `${data.materia?.nombre || 'Materia'} → ${formatEstadoText(data.estado)}`)
          break

        case 'estados_reseteados': {
          if (data.usuario_id !== usuarioIdRef.current) break
          const eMap = {}
          ;(data.estados || []).forEach(e => { eMap[e.materia_id] = e.estado })
          setEstadosMap(eMap)
          showToastRef.current?.('warning', 'Avance Reiniciado', 'Todas las materias volvieron a No Cursada')
          break
        }

        case 'config_actualizada':
          if (data.carrera_id !== carreraIdRef.current) break
          setConfigApp(data)
          showToastRef.current?.('info', 'Período Actualizado', 'Cuatrimestre actual sincronizado')
          break

        case 'carrera_creada':
          setCarreras(prev => prev.some(c => c.id === data.id) ? prev : [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
          showToastRef.current?.('success', 'Nueva Carrera', `"${data.nombre}" está disponible`)
          break

        case 'carrera_actualizada':
          setCarreras(prev => prev.map(c => c.id === data.id ? data : c))
          if (data.id === carreraIdRef.current) showToastRef.current?.('info', 'Carrera Actualizada', `"${data.nombre}" se actualizó`)
          break

        case 'carrera_eliminada': {
          const restantes = carrerasRef.current.filter(c => c.id !== data.id)
          setCarreras(restantes)
          if (data.id === carreraIdRef.current) {
            showToastRef.current?.('warning', 'Carrera Eliminada', 'La carrera que estabas viendo ya no existe')
            // Al cambiar carreraId, el efecto que mira esa dependencia se
            // encarga de recargar materias/prereqs/config de la nueva (o de
            // dejar todo vacío si no queda ninguna carrera).
            if (restantes.length > 0) {
              setCarreraId(restantes[0].id)
            } else {
              setCarreraId(null)
              setMaterias([]); setPrerequisitos([]); setConfigApp({ anio_actual: null, cuatrimestre_actual: null })
            }
          }
          break
        }

        case 'evento_creado': {
          const { desde, hasta } = rangoEventosRef.current
          if (desde && hasta && data.fecha >= desde && data.fecha <= hasta) {
            setEventos(prev => prev.some(e => e.id === data.id) ? prev : [...prev, data].sort((a, b) => (a.fecha + (a.hora_inicio || '')).localeCompare(b.fecha + (b.hora_inicio || ''))))
          }
          showToastRef.current?.('success', 'Nuevo Evento', `"${data.titulo}" agregado a la agenda`)
          break
        }

        case 'evento_actualizado':
          setEventos(prev => prev.map(e => e.id === data.id ? data : e))
          showToastRef.current?.('info', 'Evento Modificado', `"${data.titulo}" actualizado`)
          break

        case 'evento_eliminado':
          setEventos(prev => prev.filter(e => e.id !== data.id))
          showToastRef.current?.('warning', 'Evento Eliminado', 'Se removió de la agenda')
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
  }, [reloadPrereqs, usuarioId])

  return {
    ctx,
    loading,
    wsStatus,
    setEstadosMap,
    setConfigApp,
    refetch: fetchInicial,
    actualizarEstado,
    cargarEventos,
    carreraId,
    setCarreraId,
    reloadCarreras: fetchInicial,
    reloadMateriasYPrereqs: () => carreraId && fetchCarrera(carreraId),
  }
}
