import { useCallback, useRef, useState } from 'react'

// Hook que expone showConfirm(title, message, confirmLabel) -> Promise<boolean>,
// respaldado por un modal controlado desde el componente que lo monta (App).
export function useConfirm() {
  const [state, setState] = useState(null) // { title, message, confirmLabel } | null
  const resolverRef = useRef(null)

  const showConfirm = useCallback((title, message, confirmLabel = 'Eliminar') => {
    setState({ title, message, confirmLabel })
    return new Promise((resolve) => { resolverRef.current = resolve })
  }, [])

  const resolve = useCallback((result) => {
    setState(null)
    resolverRef.current?.(result)
    resolverRef.current = null
  }, [])

  return { confirmState: state, showConfirm, resolveConfirm: resolve }
}
