import { describe, expect, it } from 'vitest'
import {
  logrosReducer,
  logrosInitialState,
  validarApodo,
  validarCodigoGrupo,
  validarNombreGrupo,
  MAX_SELLOS_VISIBLES,
  reconstruirCursandoPorMateria,
  aplicarEventoGrupoCursando,
  formatearCursandoTexto,
  formatearBadgeCursando
} from '../lib/logrosLogic'

describe('gruposLogic - Validación de Apodo', () => {
  it('acepta apodos válidos con acentos y caracteres especiales permitidos', () => {
    expect(validarApodo('Ñandú').valido).toBe(true)
    expect(validarApodo('Ávila').valido).toBe(true)
    expect(validarApodo('Cobayo 42').valido).toBe(true)
    expect(validarApodo('juan_perez').valido).toBe(true)
    expect(validarApodo('pablo-dev.01').valido).toBe(true)
  })

  it('recorta espacios en blanco al inicio y al final', () => {
    const res = validarApodo('  TitoCobayo  ')
    expect(res.valido).toBe(true)
    expect(res.valor).toBe('TitoCobayo')
  })

  it('rechaza apodos menores a 2 caracteres o mayores a 20', () => {
    expect(validarApodo('a').valido).toBe(false)
    expect(validarApodo('   a   ').valido).toBe(false)
    expect(validarApodo('123456789012345678901').valido).toBe(false)
  })

  it('rechaza apodos con símbolos no permitidos', () => {
    expect(validarApodo('juan@perez').valido).toBe(false)
    expect(validarApodo('tito#cobayo').valido).toBe(false)
    expect(validarApodo('materia$').valido).toBe(false)
  })
})

describe('gruposLogic - Validación de Nombres y Códigos de Grupo', () => {
  it('valida nombres de grupo entre 2 y 40 caracteres', () => {
    expect(validarNombreGrupo('Los Cobayos del 3er Piso').valido).toBe(true)
    expect(validarNombreGrupo('  Sistemas 2026  ').valor).toBe('Sistemas 2026')
    expect(validarNombreGrupo('x').valido).toBe(false)
    expect(validarNombreGrupo('a'.repeat(41)).valido).toBe(false)
  })

  it('valida y convierte códigos a mayúsculas', () => {
    const res = validarCodigoGrupo('  abc-123  ')
    expect(res.valido).toBe(true)
    expect(res.valor).toBe('ABC-123')
    expect(validarCodigoGrupo('').valido).toBe(false)
  })
})

describe('gruposLogic - Reducer de Cola de Logros en Vivo', () => {
  it('agrega logros y mantiene un límite máximo de 3 elementos', () => {
    let state = logrosInitialState
    state = logrosReducer(state, {
      type: 'AGREGAR_LOGRO',
      logro: { id: '1', usuario_id: 1, apodo: 'Tito', materia_nombre: 'Análisis I', estado: 'PROMOCIONADA' }
    })
    expect(state).toHaveLength(1)
    expect(state[0].id).toBe('1')

    state = logrosReducer(state, {
      type: 'AGREGAR_LOGRO',
      logro: { id: '2', usuario_id: 2, apodo: 'Marta', materia_nombre: 'Física I', estado: 'REGULAR' }
    })
    state = logrosReducer(state, {
      type: 'AGREGAR_LOGRO',
      logro: { id: '3', usuario_id: 3, apodo: 'Lucas', materia_nombre: 'Álgebra', estado: 'PROMOCIONADA' }
    })
    expect(state).toHaveLength(3)
    expect(state.map(l => l.id)).toEqual(['3', '2', '1'])

    // Agregar un 4º logro desplaza el más viejo (id '1') manteniendo máximo 3
    state = logrosReducer(state, {
      type: 'AGREGAR_LOGRO',
      logro: { id: '4', usuario_id: 4, apodo: 'Sofía', materia_nombre: 'Química', estado: 'PROMOCIONADA' }
    })
    expect(state).toHaveLength(MAX_SELLOS_VISIBLES)
    expect(state.map(l => l.id)).toEqual(['4', '3', '2'])
  })

  it('evita duplicar logros con el mismo id', () => {
    let state = [{ id: '1', apodo: 'Tito' }]
    state = logrosReducer(state, {
      type: 'AGREGAR_LOGRO',
      logro: { id: '1', apodo: 'Tito' }
    })
    expect(state).toHaveLength(1)
  })

  it('descarta un logro por id y limpia la cola', () => {
    let state = [{ id: '1' }, { id: '2' }, { id: '3' }]
    state = logrosReducer(state, { type: 'DESCARTAR_LOGRO', id: '2' })
    expect(state.map(l => l.id)).toEqual(['1', '3'])

    state = logrosReducer(state, { type: 'LIMPIAR_LOGROS' })
    expect(state).toEqual([])
  })
})

describe('gruposLogic - Mapa de Cursando Por Materia', () => {
  it('reconstruye el mapa agrupado por materia y excluye al propio usuario', () => {
    const rawEntries = [
      { materia_id: 10, usuario_id: 1, apodo: 'Yo Mismo' },
      { materia_id: 10, usuario_id: 2, apodo: 'Marta' },
      { materia_id: 10, usuario_id: 3, apodo: 'Lucas' },
      { materia_id: 25, usuario_id: 2, apodo: 'Marta' }, // El mismo usuario cursa otra materia
      { materia_id: 10, usuario_id: 2, apodo: 'Marta' }, // Duplicado accidental
    ]

    const mapa = reconstruirCursandoPorMateria(rawEntries, 1)

    // El propio usuario (id 1) no debe aparecer
    expect(mapa[10]).toHaveLength(2)
    expect(mapa[10]).toEqual([
      { usuario_id: 2, apodo: 'Marta' },
      { usuario_id: 3, apodo: 'Lucas' },
    ])
    expect(mapa[25]).toEqual([
      { usuario_id: 2, apodo: 'Marta' }
    ])
  })

  it('maneja entradas vacías, nulas o inválidas sin romper', () => {
    expect(reconstruirCursandoPorMateria(null, 1)).toEqual({})
    expect(reconstruirCursandoPorMateria([], 1)).toEqual({})
    expect(reconstruirCursandoPorMateria([{ materia_id: 1, usuario_id: 1 }], 1)).toEqual({})
    expect(reconstruirCursandoPorMateria([null, undefined, {}], 1)).toEqual({})
  })

  it('aplica evento grupo_cursando agregando un compañero a la materia', () => {
    const inicial = {
      10: [{ usuario_id: 2, apodo: 'Marta' }]
    }

    const evento = {
      usuario_id: 5,
      apodo: 'Sofía',
      materia_id: 10,
      cursando: true
    }

    const res = aplicarEventoGrupoCursando(inicial, evento, 1)
    expect(res[10]).toHaveLength(2)
    expect(res[10][1]).toEqual({ usuario_id: 5, apodo: 'Sofía' })
  })

  it('aplica evento grupo_cursando quitando un compañero y eliminando la clave si queda vacía', () => {
    const inicial = {
      10: [{ usuario_id: 2, apodo: 'Marta' }, { usuario_id: 3, apodo: 'Lucas' }],
      20: [{ usuario_id: 2, apodo: 'Marta' }]
    }

    // Quitar Lucas de materia 10
    const res1 = aplicarEventoGrupoCursando(inicial, {
      usuario_id: 3,
      apodo: 'Lucas',
      materia_id: 10,
      cursando: false
    }, 1)
    expect(res1[10]).toEqual([{ usuario_id: 2, apodo: 'Marta' }])

    // Quitar Marta de materia 20 -> clave 20 se elimina
    const res2 = aplicarEventoGrupoCursando(res1, {
      usuario_id: 2,
      apodo: 'Marta',
      materia_id: 20,
      cursando: false
    }, 1)
    expect(res2[20]).toBeUndefined()
  })

  it('ignora eventos grupo_cursando del propio usuario', () => {
    const inicial = { 10: [{ usuario_id: 2, apodo: 'Marta' }] }
    const eventoPropio = {
      usuario_id: 1,
      apodo: 'Yo Mismo',
      materia_id: 10,
      cursando: true
    }

    const res = aplicarEventoGrupoCursando(inicial, eventoPropio, 1)
    expect(res).toBe(inicial)
  })

  it('formatea texto de cursando correctamente según la cantidad de compañeros', () => {
    expect(formatearCursandoTexto([])).toBe('')
    expect(formatearCursandoTexto([{ apodo: 'Marta' }])).toBe('Marta')
    expect(formatearCursandoTexto([{ apodo: 'Marta' }, { apodo: 'Lucas' }])).toBe('Marta, Lucas')
    expect(formatearCursandoTexto([{ apodo: 'Marta' }, { apodo: 'Lucas' }, { apodo: 'Sofía' }])).toBe('Marta y 2 más')
    expect(formatearCursandoTexto([{ apodo: 'Marta' }, { apodo: 'Lucas' }, { apodo: 'Sofía' }, { apodo: 'Tito' }])).toBe('Marta y 3 más')
  })

  it('formatea badge de cursando para tarjetas de Hoy', () => {
    expect(formatearBadgeCursando(0)).toBe('')
    expect(formatearBadgeCursando(1)).toBe('1 amigo la cursa')
    expect(formatearBadgeCursando(2)).toBe('2 amigos la cursan')
    expect(formatearBadgeCursando(5)).toBe('5 amigos la cursan')
  })
})
