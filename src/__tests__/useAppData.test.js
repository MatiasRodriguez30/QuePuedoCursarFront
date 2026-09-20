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

  it('descarta la respuesta en vuelo del usuario anterior', async () => {
    const { apiRequest } = await import('../lib/api')
    // Un resolver por llamada: el pedido del usuario 1 se responde recién
    // después de que 2 inició sesión, y el de 2 queda colgado (tablet sin
    // responder), que es el escenario donde la fuga era visible.
    const resolvers = []
    apiRequest.mockImplementation((endpoint) => {
      if (endpoint === '/carreras') return Promise.resolve([])
      if (endpoint === '/estados') return new Promise(r => resolvers.push(r))
      return new Promise(() => {})
    })

    const { resultado, rerender, unmount } = renderHook(1)
    // La sesión cambia mientras el GET /estados de 1 sigue viajando.
    rerender(2)
    await act(async () => {
      resolvers[0]([{ materia_id: 10, estado: 'PROMOCIONADA' }])
    })

    expect(resultado.current.ctx.estadosMap).toEqual({})
    expect(readCache('estados', 2)).not.toEqual({ 10: 'PROMOCIONADA' })

    unmount()
    apiRequest.mockImplementation(() => new Promise(() => {}))
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
