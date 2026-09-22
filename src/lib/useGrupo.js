import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { apiRequest } from './api'
import {
  logrosReducer,
  logrosInitialState,
  reconstruirCursandoPorMateria,
  aplicarEventoGrupoCursando
} from './logrosLogic'

export function useGrupo({ subscribeWsEvents, usuario, onUsuarioUpdate, showToast }) {
  const [grupo, setGrupo] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [disponible, setDisponible] = useState(true)
  const [logros, dispatchLogros] = useReducer(logrosReducer, logrosInitialState)
  const [cursandoPorMateria, setCursandoPorMateria] = useState({})

  const grupoRef = useRef(grupo)
  grupoRef.current = grupo

  const usuarioRef = useRef(usuario)
  usuarioRef.current = usuario

  // Cargar grupo actual del usuario
  const cargarGrupo = useCallback(async () => {
    if (!usuario) {
      setGrupo(null)
      setCursandoPorMateria({})
      setCargando(false)
      return
    }

    try {
      const data = await apiRequest('/grupos/mio')
      setGrupo(data)
      setDisponible(true)
      // Si el apodo difiere del usuario local, sincronizar
      if (data.yo?.apodo && usuarioRef.current && usuarioRef.current.apodo !== data.yo.apodo) {
        onUsuarioUpdate?.({ ...usuarioRef.current, apodo: data.yo.apodo })
      }
      // Cargar mapa de quién cursa qué en el grupo
      try {
        const cursandoData = await apiRequest('/grupos/mio/cursando')
        setCursandoPorMateria(reconstruirCursandoPorMateria(cursandoData, usuarioRef.current?.id))
      } catch (cErr) {
        if (cErr.status === 404 && cErr.message?.includes('No estás en ningún grupo')) {
          setCursandoPorMateria({})
        } else if (cErr.status === 404 || cErr.status >= 500) {
          setCursandoPorMateria({})
          setDisponible(false)
        }
      }
    } catch (err) {
      // 404 exacto "No estás en ningún grupo" es estado normal
      if (err.status === 404 && err.message?.includes('No estás en ningún grupo')) {
        setGrupo(null)
        setDisponible(true)
        setCursandoPorMateria({})
      } else if (err.status === 404) {
        // 404 genérico de ruta no encontrada ("Not Found") => backend viejo sin soporte de grupos
        setGrupo(null)
        setDisponible(false)
        setCursandoPorMateria({})
      } else if (err.status >= 500) {
        // Error de servidor => ocultar para no romper la app
        setGrupo(null)
        setDisponible(false)
        setCursandoPorMateria({})
      } else {
        setGrupo(null)
        setDisponible(true)
        setCursandoPorMateria({})
      }
    } finally {
      setCargando(false)
    }
  }, [usuario, onUsuarioUpdate])

  useEffect(() => {
    cargarGrupo()
  }, [cargarGrupo])

  // Descartar logro manualmente o por timer
  const descartarLogro = useCallback((id) => {
    dispatchLogros({ type: 'DESCARTAR_LOGRO', id })
  }, [])

  // Suscripción al bus de eventos WebSocket de useAppData
  useEffect(() => {
    if (!subscribeWsEvents) return

    const unsubscribe = subscribeWsEvents(({ event, data }) => {
      // 1. Reconexión del socket => revalidar estado de grupo
      if (event === '_reconnected') {
        cargarGrupo()
        return
      }

      // 2. Miembros del grupo actualizados (entradas, salidas, apodos, online/offline)
      if (event === 'grupo_miembros' && data) {
        setGrupo(prev => {
          if (!prev || prev.id !== data.grupo_id) return prev
          return {
            ...prev,
            miembros: data.miembros || []
          }
        })
        return
      }

      // 3. Logro en vivo de un compañero del grupo
      if (event === 'logro_grupo' && data) {
        const actualGrupo = grupoRef.current
        // Si no estamos en grupo o desactivamos "comparte", no recibimos logros
        if (!actualGrupo) return
        if (actualGrupo.yo && actualGrupo.yo.comparte === false) return

        // Generar ID único para el sello
        const logroId = `logro-${data.usuario_id}-${data.materia_id}-${Date.now()}`
        const nuevoLogro = {
          id: logroId,
          usuario_id: data.usuario_id,
          apodo: data.apodo || 'Compañero',
          materia_id: data.materia_id,
          materia_nombre: data.materia_nombre || 'Materia',
          estado: data.estado || 'PROMOCIONADA',
          en: data.en || new Date().toISOString()
        }

        dispatchLogros({ type: 'AGREGAR_LOGRO', logro: nuevoLogro })

        // Auto-cierre a los 6 segundos (~6000 ms)
        setTimeout(() => {
          dispatchLogros({ type: 'DESCARTAR_LOGRO', id: logroId })
        }, 6000)
        return
      }

      // 4. Quién cursa esto ahora: evento grupo_cursando
      if (event === 'grupo_cursando' && data) {
        setCursandoPorMateria(prev => aplicarEventoGrupoCursando(prev, data, usuarioRef.current?.id))
        return
      }
    })

    return unsubscribe
  }, [subscribeWsEvents, cargarGrupo])

  // ── Acciones de Grupo ─────────────────────────────────────────────────

  const crearGrupo = useCallback(async (nombre) => {
    try {
      const data = await apiRequest('/grupos', {
        method: 'POST',
        body: JSON.stringify({ nombre: nombre.trim() })
      })
      setGrupo(data)
      try {
        const cData = await apiRequest('/grupos/mio/cursando')
        setCursandoPorMateria(reconstruirCursandoPorMateria(cData, usuarioRef.current?.id))
      } catch {
        setCursandoPorMateria({})
      }
      showToast?.('success', '¡Grupo Creado!', `Te uniste a "${data.nombre}"`)
      return { ok: true, grupo: data }
    } catch (err) {
      const msg = err.status === 409
        ? 'Ya pertenecés a un grupo. Salí de tu grupo actual antes de crear uno nuevo.'
        : (err.message || 'No se pudo crear el grupo')
      showToast?.('error', 'Error al Crear', msg)
      return { ok: false, error: msg }
    }
  }, [showToast])

  const unirseGrupo = useCallback(async (codigo) => {
    try {
      const data = await apiRequest('/grupos/unirse', {
        method: 'POST',
        body: JSON.stringify({ codigo: codigo.trim().toUpperCase() })
      })
      setGrupo(data)
      try {
        const cData = await apiRequest('/grupos/mio/cursando')
        setCursandoPorMateria(reconstruirCursandoPorMateria(cData, usuarioRef.current?.id))
      } catch {
        setCursandoPorMateria({})
      }
      showToast?.('success', '¡Te Uniste al Grupo!', `Bienvenido a "${data.nombre}"`)
      return { ok: true, grupo: data }
    } catch (err) {
      let msg = err.message
      if (err.status === 404) {
        msg = 'Código inválido. Verificá que te lo hayan pasado bien.'
      } else if (err.status === 409) {
        msg = 'Ya pertenecés a un grupo. Salí del actual antes de unirte a otro.'
      } else if (err.status === 429) {
        msg = 'Demasiados intentos. Esperá unos momentos antes de probar nuevamente.'
      }
      showToast?.('error', 'Error al Unirte', msg)
      return { ok: false, error: msg }
    }
  }, [showToast])

  const cambiarPreferencia = useCallback(async (comparte) => {
    try {
      const data = await apiRequest('/grupos/mio/preferencias', {
        method: 'PUT',
        body: JSON.stringify({ comparte })
      })
      setGrupo(data)
      if (comparte) {
        try {
          const cData = await apiRequest('/grupos/mio/cursando')
          setCursandoPorMateria(reconstruirCursandoPorMateria(cData, usuarioRef.current?.id))
        } catch {
          setCursandoPorMateria({})
        }
      } else {
        setCursandoPorMateria({})
      }
      showToast?.('info', 'Preferencia Guardada', comparte ? 'Ahora compartís y recibís logros del grupo' : 'Progreso en modo privado (no compartís ni recibís logros)')
      return { ok: true, grupo: data }
    } catch (err) {
      showToast?.('error', 'Error', 'No se pudo actualizar tu preferencia: ' + err.message)
      return { ok: false, error: err.message }
    }
  }, [showToast])

  const salirGrupo = useCallback(async () => {
    try {
      await apiRequest('/grupos/salir', { method: 'POST' })
      setGrupo(null)
      setCursandoPorMateria({})
      dispatchLogros({ type: 'LIMPIAR_LOGROS' })
      showToast?.('info', 'Saliste del Grupo', 'Ya no pertenecés a ningún grupo')
      return { ok: true }
    } catch (err) {
      showToast?.('error', 'Error al Salir', err.message)
      return { ok: false, error: err.message }
    }
  }, [showToast])

  const actualizarApodo = useCallback(async (apodo) => {
    try {
      const data = await apiRequest('/auth/apodo', {
        method: 'PUT',
        body: JSON.stringify({ apodo: apodo.trim() })
      })
      // Sincronizar en usuario local
      if (usuarioRef.current) {
        onUsuarioUpdate?.({ ...usuarioRef.current, apodo: data.apodo })
      }
      // Sincronizar en grupo local si aplica
      setGrupo(prev => {
        if (!prev || !prev.yo) return prev
        return {
          ...prev,
          yo: { ...prev.yo, apodo: data.apodo },
          miembros: (prev.miembros || []).map(m =>
            m.usuario_id === data.id ? { ...m, apodo: data.apodo } : m
          )
        }
      })
      showToast?.('success', 'Apodo Actualizado', `Tu apodo ahora es "${data.apodo}"`)
      return { ok: true, usuario: data }
    } catch (err) {
      const msg = err.status === 422 ? 'Apodo inválido (2-20 letras, números, espacios o _ - .)' : err.message
      showToast?.('error', 'Error al Cambiar Apodo', msg)
      return { ok: false, error: msg }
    }
  }, [onUsuarioUpdate, showToast])

  return {
    grupo,
    cargando,
    disponible,
    logros,
    cursandoPorMateria,
    descartarLogro,
    crearGrupo,
    unirseGrupo,
    cambiarPreferencia,
    salirGrupo,
    actualizarApodo,
    recargarGrupo: cargarGrupo
  }
}
