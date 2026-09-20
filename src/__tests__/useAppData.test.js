import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppData } from '../lib/useAppData'
import { readCache, writeCache } from '../lib/cache'

// El backend no participa: lo que se verifica es que el snapshot local nunca
// cruce de una sesión a otra, aunque la tablet no conteste.
vi.mock('../lib/api', () => ({
  apiRequest: vi.fn(() => new Promise(() => {})),
  getWsUrl: () => null,
}))

function renderHook(usuarioId) {
  const container = document.createElement('div')
  const root = createRoot(container)
  const visto = { current: null }

  function Probe({ usuarioId }) {
    visto.current = useAppData(() => {}, usuarioId)
    return null
  }

  act(() => root.render(createElement(Probe, { usuarioId })))
  return {
    resultado: visto,
    rerender: (nuevoUsuarioId) => act(() => root.render(createElement(Probe, { usuarioId: nuevoUsuarioId }))),
    unmount: () => act(() => root.unmount()),
  }
}

describe('useAppData: aislamiento del cache entre usuarios', () => {
  beforeEach(() => {
    localStorage.clear()
    global.IS_REACT_ACT_ENVIRONMENT = true
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('no muestra ni persiste el avance del usuario anterior al cambiar de sesión', () => {
    writeCache('estados', 1, { 10: 'PROMOCIONADA' })
    writeCache('carreras', 1, [{ id: 5, nombre: 'Sistemas' }])

    const { resultado, rerender, unmount } = renderHook(1)
    expect(resultado.current.ctx.estadosMap).toEqual({ 10: 'PROMOCIONADA' })

    // El usuario 2 entra en el mismo navegador y no tiene snapshot propio.
    rerender(2)

    expect(resultado.current.ctx.estadosMap).toEqual({})
    expect(resultado.current.ctx.carreras).toEqual([])
    expect(readCache('estados', 2)).not.toEqual({ 10: 'PROMOCIONADA' })
    expect(readCache('carreras', 2)).toBeNull()
    // El del usuario 1 queda intacto bajo su propia clave.
    expect(readCache('estados', 1)).toEqual({ 10: 'PROMOCIONADA' })

    unmount()
  })

  it('hidrata el snapshot propio de cada usuario', () => {
    writeCache('estados', 1, { 10: 'REGULAR' })
    writeCache('estados', 2, { 20: 'CURSANDO' })

    const { resultado, rerender, unmount } = renderHook(1)
    expect(resultado.current.ctx.estadosMap).toEqual({ 10: 'REGULAR' })

    rerender(2)
    expect(resultado.current.ctx.estadosMap).toEqual({ 20: 'CURSANDO' })

    unmount()
  })
})
