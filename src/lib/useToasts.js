import { useCallback, useRef, useState } from 'react'

let nextId = 1

export function useToasts() {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timersRef.current[id])
    delete timersRef.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToast = useCallback((type, title, message) => {
    const id = nextId++
    setToasts(prev => [...prev, { id, type, title, message }])
    timersRef.current[id] = setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  return { toasts, showToast, dismiss }
}
