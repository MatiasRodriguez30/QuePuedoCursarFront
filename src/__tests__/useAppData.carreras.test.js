import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAppData } from '../lib/useAppData'
import { readCache, writeCache } from '../lib/cache'

vi.mock('../lib/api', () => ({
  apiRequest: vi.fn(() => new Promise(() => {})), // tablet dormida: nunca responde
  getWsUrl: () => null,
}))

beforeEach(() => { localStorage.clear(); global.IS_REACT_ACT_ENVIRONMENT = true })

it('cambiar de carrera no pisa el cache de la carrera destino con el plan de la anterior', () => {
  const planA = [{ id: 1, nombre: 'Materia de A', codigo: 'A1' }]
  const planB = [{ id: 2, nombre: 'Materia de B', codigo: 'B1' }]
  writeCache('materias', 1, planA); writeCache('prereqs', 1, [])
  writeCache('materias', 2, planB); writeCache('prereqs', 2, [])
  localStorage.setItem('qpc_carrera_id', '1')

  const visto = { current: null }
  const Probe = () => { visto.current = useAppData(() => {}, 7); return null }
  const root = createRoot(document.createElement('div'))
  act(() => root.render(createElement(Probe)))
  expect(visto.current.ctx.materias).toEqual(planA)

  act(() => visto.current.setCarreraId(2))

  expect(readCache('materias', 2)).toEqual(planB)
  expect(visto.current.ctx.materias).toEqual(planB)
})
