import { describe, it, expect } from 'vitest'
import {
  formatEstadoText,
  checkCursadaRequirements,
  esElectiva,
  checkExcepcionMachete,
  otorgaCondicionalidad,
  siguientePeriodo,
  buildPrereqsMap
} from '../lib/businessLogic'

describe('businessLogic', () => {
  it('formatEstadoText formats correctly', () => {
    expect(formatEstadoText('PROMOCIONADA')).toBe('Aprobada')
    expect(formatEstadoText('REGULAR')).toBe('Regular')
    expect(formatEstadoText('CURSANDO')).toBe('Cursando')
    expect(formatEstadoText('NO_CURSADA')).toBe('No Cursada')
  })

  it('checkCursadaRequirements checks prereqs properly', () => {
    const ctx = {
      prereqsByMateria: {
        2: [{ materia_requerida_id: 1, tipo: 'APROBADA' }],
        3: [{ materia_requerida_id: 1, tipo: 'REGULARIZADA' }]
      }
    }
    const estados = { 1: 'NO_CURSADA', 2: 'NO_CURSADA', 3: 'NO_CURSADA' }
    expect(checkCursadaRequirements(2, ctx, estados).puede).toBe(false)
  })

  it('esElectiva correctly identifies E- prefix', () => {
    expect(esElectiva({ codigo: 'E-123' })).toBe(true)
    expect(esElectiva({ codigo: '123' })).toBe(false)
  })
})
