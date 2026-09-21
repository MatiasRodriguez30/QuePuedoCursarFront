import { memo, useDeferredValue, useMemo, useState } from 'react'
import {
  RotateCcw,
  Search,
  Undo2,
  X
} from 'lucide-react'
import { apiRequest } from '../lib/api'
import {
  checkCursadaRequirements,
  computeImpactoCascada,
  esElectiva
} from '../lib/businessLogic'

const FILTROS = [
  { id: 'TODAS', label: 'Todas' },
  { id: 'LISTAS', label: 'Listas' },
  { id: 'CURSANDO', label: 'Cursando' },
  { id: 'FINALES', label: 'Finales' },
  { id: 'APROBADAS', label: 'Aprobadas' },
  { id: 'BLOQUEADAS', label: 'Bloqueadas' },
]

const ANIOS = [1, 2, 3, 4, 5, 'ELECTIVAS']

export default function CarreraSurface({
  ctx,
  selectedMateriaId,
  onSelectMateria,
  actualizarEstado,
  showToast,
  showConfirm,
}) {
  const [query, setQuery] = useState('')
  const queryDiferida = useDeferredValue(query)
  const [filtroActivo, setFiltroActivo] = useState('TODAS')
  const [anioMobile, setAnioMobile] = useState(1)
  const [materiaActivaId, setMateriaActivaId] = useState(selectedMateriaId || null)
  const [prevSelectedMateriaId, setPrevSelectedMateriaId] = useState(selectedMateriaId)
  const [ultimoCambio, setUltimoCambio] = useState(null) // Para botón Deshacer { materiaId, estadoPrevio }

  // Sincronizar si cambia desde afuera sin setState en effect
  if (selectedMateriaId !== prevSelectedMateriaId) {
    setPrevSelectedMateriaId(selectedMateriaId)
    setMateriaActivaId(selectedMateriaId)
  }

  function handleSelectMateria(id) {
    setMateriaActivaId(id)
    onSelectMateria?.(id)
  }

  // Materia actualmente inspeccionada
  const materiaActiva = useMemo(() => {
    if (!materiaActivaId) return null
    return ctx.materias.find(m => m.id === materiaActivaId) || null
  }, [ctx.materias, materiaActivaId])

  // Relaciones de la materia seleccionada: correlativas previas y materias que desbloquea
  const relacionesActivas = useMemo(() => {
    if (!materiaActivaId) return { previas: new Set(), desbloquea: new Set() }

    const previas = new Set()
    const reqs = ctx.prereqsByMateria[materiaActivaId] || []
    for (const r of reqs) {
      previas.add(r.materia_requerida_id)
    }

    const desbloquea = new Set()
    const deps = ctx.dependientesByMateria ? ctx.dependientesByMateria[materiaActivaId] || [] : []
    for (const d of deps) {
      desbloquea.add(d.materia_id)
    }

    return { previas, desbloquea }
  }, [ctx, materiaActivaId])

  // Agrupamiento por año (1º a 5º) + Electivas
  const mallaData = useMemo(() => {
    const q = queryDiferida.toLowerCase().trim()

    return ANIOS.map(anioKey => {
      let materiasCol = []
      if (anioKey === 'ELECTIVAS') {
        materiasCol = ctx.materias.filter(m => esElectiva(m))
      } else {
        materiasCol = ctx.materias.filter(m => !esElectiva(m) && m.anio === anioKey)
      }

      // Información de estado y correlativas de cada materia
      const processed = materiasCol.map(m => {
        const st = ctx.estadosMap[m.id] || 'NO_CURSADA'
        const reqCheck = checkCursadaRequirements(m.id, ctx)
        const isLista = st === 'NO_CURSADA' && reqCheck.puede
        const isBloqueada = st === 'NO_CURSADA' && !reqCheck.puede

        // Coincidencia con filtro activo
        let matchFilter = true
        if (filtroActivo === 'LISTAS') matchFilter = isLista
        else if (filtroActivo === 'CURSANDO') matchFilter = st === 'CURSANDO'
        else if (filtroActivo === 'FINALES') matchFilter = st === 'REGULAR'
        else if (filtroActivo === 'APROBADAS') matchFilter = st === 'PROMOCIONADA'
        else if (filtroActivo === 'BLOQUEADAS') matchFilter = isBloqueada

        // Coincidencia con búsqueda
        let matchQuery = true
        if (q) {
          matchQuery = m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q)
        }

        const isDimmed = !matchFilter || !matchQuery
        const isSelected = materiaActivaId === m.id
        const isPrevia = relacionesActivas.previas.has(m.id)
        const isDesbloqueada = relacionesActivas.desbloquea.has(m.id)

        return {
          ...m,
          estado: st,
          isLista,
          isBloqueada,
          isDimmed,
          isSelected,
          isPrevia,
          isDesbloqueada,
          reqCheck,
        }
      })

      return {
        anioKey,
        label: anioKey === 'ELECTIVAS' ? 'Electivas' : `${anioKey}º Año`,
        materias: processed,
      }
    })
  }, [ctx, queryDiferida, filtroActivo, materiaActivaId, relacionesActivas])

  // Manejo de cambio de estado seguro con toast y soporte de "Deshacer"
  async function handleChangeEstado(materiaId, nuevoEstado) {
    const estadoPrevio = ctx.estadosMap[materiaId] || 'NO_CURSADA'
    if (estadoPrevio === nuevoEstado) return

    setUltimoCambio({ materiaId, estadoPrevio, nuevoEstado })

    try {
      await actualizarEstado(materiaId, nuevoEstado)
      showToast(
        'success',
        'Estado modificado',
        `Materia actualizada`,
        {
          label: 'Deshacer',
          onClick: () => handleUndo(materiaId, estadoPrevio),
        }
      )
    } catch (err) {
      showToast('error', 'Error', 'No se pudo guardar el estado: ' + err.message)
    }
  }

  async function handleUndo(materiaId, estadoAnterior) {
    try {
      await actualizarEstado(materiaId, estadoAnterior)
      setUltimoCambio(null)
      showToast('info', 'Acción deshecha', 'Se restauró el estado anterior')
    } catch (err) {
      showToast('error', 'Error al deshacer', err.message)
    }
  }

  // Reiniciar avance de la carrera con ConfirmDialog
  async function handleResetAvance() {
    const ok = await showConfirm(
      '¿Reiniciar todo tu avance en esta carrera?',
      "Todas las materias volverán a estado 'No Cursada'. Esta acción no se puede deshacer.",
      'Reiniciar'
    )
    if (!ok) return
    try {
      await apiRequest('/estados/reset', { method: 'POST' })
      showToast('info', 'Avance reiniciado', 'Todas las materias quedaron en No Cursada')
    } catch (err) {
      showToast('error', 'Error', 'No se pudo reiniciar: ' + err.message)
    }
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ── TOOLBAR DE MI CARRERA: FILTROS POR CHIP, BUSCADOR Y REINICIAR ──────── */}
      <div className="bg-white border-3 border-[#111111] shadow-fanzine-sm p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Chips de filtro (atenúan, no ocultan) */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs select-none">
          {FILTROS.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroActivo(f.id)}
              className={`px-2.5 py-1 font-bold uppercase border-2 border-[#111111] transition-all cursor-pointer ${
                filtroActivo === f.id
                  ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464] translate-y-0.5'
                  : 'bg-[#f4f0e6] text-[#111111] hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Buscador y opciones secundarias */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar materia o código..."
              className="w-full bg-[#f4f0e6] border-2 border-[#111111] pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-[#111111] placeholder-[#71717a] focus:outline-none focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleResetAvance}
            title="Reiniciar todo el avance académico de esta carrera"
            className="p-1.5 bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#fee2e2] text-[#dc2626] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Reiniciar avance</span>
          </button>
        </div>
      </div>

      {/* ── LEYENDA TÁCTIL DE CORRELATIVAS CUANDO HAY MATERIA ACTIVA ───────────── */}
      {materiaActiva && (
        <div className="bg-[#111111] text-white border-2 border-[#111111] px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#ccff00] uppercase">
              Relaciones de {materiaActiva.codigo}:
            </span>
            <span className="flex items-center gap-1.5 text-[#ccff00]">
              <span className="w-2.5 h-2.5 bg-[#ccff00] border border-[#111111] inline-block" />
              <span>Correlativa Previa (Requiere)</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#60a5fa]">
              <span className="w-2.5 h-2.5 bg-[#0047ff] border border-[#111111] inline-block" />
              <span>Desbloquea (Habilita)</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectMateria(null)}
            className="text-[11px] font-bold text-[#a1a1aa] hover:text-white underline cursor-pointer"
          >
            Limpiar selección ✕
          </button>
        </div>
      )}

      {/* ── NAVEGACIÓN MÓVIL POR AÑO (< 768px) ─────────────────────────────────── */}
      <div className="md:hidden flex overflow-x-auto gap-1.5 p-1 bg-[#eee8d8] border-2 border-[#111111]">
        {ANIOS.map(a => (
          <button
            key={a}
            type="button"
            onClick={() => setAnioMobile(a)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase whitespace-nowrap border-2 border-[#111111] cursor-pointer ${
              anioMobile === a
                ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464]'
                : 'bg-white text-[#111111]'
            }`}
          >
            {a === 'ELECTIVAS' ? 'Electivas' : `${a}º Año`}
          </button>
        ))}
      </div>

      {/* ── MALLA VIVA: COLUMNAS 1º A 5º AÑO + ELECTIVAS ─────────────────────── */}
      <div className="flex gap-3">
        {/* Grid de columnas (en desktop todas visibles; en móvil la seleccionada) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3 items-start">
          {mallaData
            .filter(col => {
              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                return col.anioKey === anioMobile
              }
              return true
            })
            .map(col => (
              <div
                key={col.anioKey}
                className="bg-[#f9f6ee] border-2 border-[#111111] shadow-fanzine-sm p-2.5 flex flex-col gap-2"
              >
                {/* Cabecera de columna */}
                <div className="flex justify-between items-baseline pb-1.5 border-b-2 border-[#111111]">
                  <h3 className="font-display text-xs font-bold uppercase text-[#111111]">
                    {col.label}
                  </h3>
                  <span className="font-mono text-[10px] font-bold text-[#52525b]">
                    {col.materias.filter(m => m.estado === 'PROMOCIONADA').length}/{col.materias.length}
                  </span>
                </div>

                {/* Fichas de la columna */}
                <div className="flex flex-col gap-2">
                  {col.materias.map(m => (
                    <MateriaFichaCompacta
                      key={m.id}
                      materia={m}
                      onClick={() => handleSelectMateria(m.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* ── PANEL LATERAL DE DETALLE EN ESCRITORIO (>= 1024px) ───────────────── */}
        {materiaActiva && (
          <aside
            aria-label="Detalle de materia seleccionada"
            className="hidden lg:flex w-84 bg-white border-3 border-[#111111] shadow-fanzine-md p-4 flex-col gap-3.5 sticky top-20 flex-shrink-0 max-h-[85vh] overflow-y-auto"
          >
            <HojaDeDetalleContenido
              materia={materiaActiva}
              ctx={ctx}
              onClose={() => handleSelectMateria(null)}
              onChangeEstado={handleChangeEstado}
              ultimoCambio={ultimoCambio}
              onUndo={handleUndo}
            />
          </aside>
        )}
      </div>

      {/* ── BOTTOM SHEET MÓVIL (< 1024px) CON CIERRE Y SIN DESBORDE ──────────── */}
      {materiaActiva && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 p-2 sm:p-4">
          <div
            className="bg-white border-3 border-[#111111] shadow-fanzine-lg p-4 max-h-[85dvh] overflow-y-auto w-full max-w-lg mx-auto"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalle de ${materiaActiva.nombre}`}
          >
            <HojaDeDetalleContenido
              materia={materiaActiva}
              ctx={ctx}
              onClose={() => handleSelectMateria(null)}
              onChangeEstado={handleChangeEstado}
              ultimoCambio={ultimoCambio}
              onUndo={handleUndo}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Ficha compacta y plana: bordes nítidos de tinta, sin fatiga visual.
 * Contraste garantizado >= 4.5:1 en estado bloqueado o atenuado.
 */
const MateriaFichaCompacta = memo(function MateriaFichaCompacta({ materia, onClick }) {
  const {
    codigo,
    nombre,
    horas_semanales,
    estado,
    isLista,
    isDimmed,
    isSelected,
    isPrevia,
    isDesbloqueada,
  } = materia

  // Borde y fondo según relación topológica activa
  let borderClass = 'border-2 border-[#111111]'
  let bgClass = 'bg-white'
  let labelBadge = null

  if (isSelected) {
    borderClass = 'border-3 border-[#ff1464] shadow-[3px_3px_0px_#111111] -rotate-[1deg]'
    bgClass = 'bg-[#fff0f5]'
  } else if (isPrevia) {
    borderClass = 'border-2 border-[#111111] shadow-[2px_2px_0px_#ccff00]'
    bgClass = 'bg-[#f7fee7]'
    labelBadge = <span className="text-[9px] font-mono font-bold text-[#111111] bg-[#ccff00] px-1 border border-[#111111]">PREVIA</span>
  } else if (isDesbloqueada) {
    borderClass = 'border-2 border-[#111111] shadow-[2px_2px_0px_#0047ff]'
    bgClass = 'bg-[#eff6ff]'
    labelBadge = <span className="text-[9px] font-mono font-bold text-white bg-[#0047ff] px-1 border border-[#111111]">DESBLOQUEA</span>
  } else if (isDimmed) {
    // Atenuar sin opacidad: fondo gris neutro + borde punteado, texto >= 4.5:1
    borderClass = 'border-2 border-dashed border-[#71717a]'
    bgClass = 'bg-[#e4e4e7]'
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-2.5 transition-all cursor-pointer relative ${borderClass} ${bgClass}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1 font-mono text-[10px] font-bold">
        <span className={isDimmed ? 'text-[#27272a]' : 'text-[#52525b]'}>
          {codigo}
        </span>
        <div className="flex items-center gap-1">
          {labelBadge}
          <EstadoStampMini estado={estado} isLista={isLista} />
        </div>
      </div>

      <div className={`text-xs font-bold leading-tight ${isDimmed ? 'text-[#27272a]' : 'text-[#111111]'}`}>
        {nombre}
      </div>

      <div className={`mt-1 font-mono text-[10px] ${isDimmed ? 'text-[#4b5563]' : 'text-[#52525b]'}`}>
        {horas_semanales || 4} hs/sem
      </div>
    </button>
  )
})

function EstadoStampMini({ estado, isLista }) {
  if (estado === 'PROMOCIONADA') {
    return <span className="px-1 py-0.2 bg-[#ccff00] text-[#111111] border border-[#111111] font-bold">APR</span>
  }
  if (estado === 'REGULAR') {
    return <span className="px-1 py-0.2 bg-white text-[#111111] border border-[#111111] font-bold">REG</span>
  }
  if (estado === 'CURSANDO') {
    return <span className="px-1 py-0.2 bg-[#0047ff] text-white border border-[#111111] font-bold">CUR</span>
  }
  if (isLista) {
    return <span className="px-1 py-0.2 bg-[#ff1464] text-[#111111] border border-[#111111] font-bold">LISTA</span>
  }
  return <span className="px-1 py-0.2 bg-[#71717a] text-white font-bold">✕</span>
}

/**
 * Contenido de la Hoja de Detalle (panel lateral o bottom sheet).
 * Contiene: acción contextual única, selector de sellos, requisitos REG/APR, y deshacer.
 */
function HojaDeDetalleContenido({
  materia,
  ctx,
  onClose,
  onChangeEstado,
  ultimoCambio,
  onUndo,
}) {
  const estado = ctx.estadosMap[materia.id] || 'NO_CURSADA'
  const reqCheck = checkCursadaRequirements(materia.id, ctx)
  const isLista = estado === 'NO_CURSADA' && reqCheck.puede
  const cascada = useMemo(() => computeImpactoCascada(materia.id, ctx), [materia.id, ctx])

  // Acción contextual principal (una sola según estado)
  let accionPrincipal = null
  if (isLista) {
    accionPrincipal = {
      label: 'Empezar a cursar',
      target: 'CURSANDO',
      color: 'bg-[#ccff00] text-[#111111]',
    }
  } else if (estado === 'CURSANDO') {
    accionPrincipal = {
      label: 'Aprobé la cursada (Regular)',
      target: 'REGULAR',
      color: 'bg-[#ccff00] text-[#111111]',
    }
  } else if (estado === 'REGULAR') {
    accionPrincipal = {
      label: 'Aprobé el examen final',
      target: 'PROMOCIONADA',
      color: 'bg-[#ccff00] text-[#111111]',
    }
  }

  const correlativasReqs = ctx.prereqsByMateria[materia.id] || []
  const dependientes = ctx.dependientesByMateria ? ctx.dependientesByMateria[materia.id] || [] : []

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* Botón de cierre y código */}
      <div className="flex items-center justify-between pb-2 border-b-2 border-[#111111]">
        <span className="font-mono text-xs font-bold text-[#52525b]">
          {materia.codigo} • {materia.anio ? `${materia.anio}º AÑO` : 'ELECTIVA'}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="p-1 text-[#111111] hover:text-[#ff1464] border border-[#111111] cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Título de la materia */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-[#111111] leading-tight">
          {materia.nombre}
        </h2>
        <div className="text-xs font-mono text-[#52525b] mt-0.5">
          {materia.cuatrimestre ? `${materia.cuatrimestre}º Cuatrimestre` : 'Anual'} • {materia.horas_semanales || 4} hs semanales
        </div>
      </div>

      {/* Acción Contextual Principal de 1 Clic */}
      {accionPrincipal && (
        <button
          type="button"
          onClick={() => onChangeEstado(materia.id, accionPrincipal.target)}
          className={`w-full py-2.5 px-4 font-mono font-bold text-xs uppercase border-2 border-[#111111] shadow-[3px_3px_0px_#111111] hover:translate-x-0.5 hover:translate-y-0.5 active:shadow-[1px_1px_0px_#111111] cursor-pointer transition-all ${accionPrincipal.color}`}
        >
          ★ {accionPrincipal.label}
        </button>
      )}

      {/* Selector de Sellos Manual */}
      <div className="bg-[#f4f0e6] border-2 border-[#111111] p-2.5">
        <div className="text-[10px] font-mono font-bold uppercase text-[#52525b] mb-1.5">
          Cambiar Sello de Estado:
        </div>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] font-bold">
          <button
            type="button"
            onClick={() => onChangeEstado(materia.id, 'PROMOCIONADA')}
            className={`py-1.5 px-2 border-2 border-[#111111] uppercase cursor-pointer ${
              estado === 'PROMOCIONADA'
                ? 'bg-[#ccff00] text-[#111111] shadow-[2px_2px_0px_#111111] stamp-clack-animation'
                : 'bg-white text-[#111111] hover:bg-[#fff9db]'
            }`}
          >
            ✓ Aprobada
          </button>
          <button
            type="button"
            onClick={() => onChangeEstado(materia.id, 'REGULAR')}
            className={`py-1.5 px-2 border-2 border-[#111111] uppercase cursor-pointer ${
              estado === 'REGULAR'
                ? 'bg-[#fef08a] text-[#111111] shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-[#fff9db]'
            }`}
          >
            ✎ Regular
          </button>
          <button
            type="button"
            onClick={() => onChangeEstado(materia.id, 'CURSANDO')}
            className={`py-1.5 px-2 border-2 border-[#111111] uppercase cursor-pointer ${
              estado === 'CURSANDO'
                ? 'bg-[#0047ff] text-white shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-[#fff9db]'
            }`}
          >
            ⚡ Cursando
          </button>
          <button
            type="button"
            onClick={() => onChangeEstado(materia.id, 'NO_CURSADA')}
            className={`py-1.5 px-2 border-2 border-[#111111] uppercase cursor-pointer ${
              estado === 'NO_CURSADA'
                ? 'bg-[#111111] text-white shadow-[2px_2px_0px_#111111]'
                : 'bg-white text-[#111111] hover:bg-[#fff9db]'
            }`}
          >
            ✕ No Cursada
          </button>
        </div>
      </div>

      {/* Botón Deshacer si hubo un cambio reciente en esta materia */}
      {ultimoCambio && ultimoCambio.materiaId === materia.id && (
        <button
          type="button"
          onClick={() => onUndo(materia.id, ultimoCambio.estadoPrevio)}
          className="flex items-center justify-center gap-1.5 py-1 text-xs font-mono font-bold text-[#111111] hover:text-[#ff1464] underline cursor-pointer"
        >
          <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Deshacer último cambio de esta materia</span>
        </button>
      )}

      {/* Requisitos de Correlatividades (REG / APR) */}
      <div className="pt-2 border-t-2 border-[#111111]">
        <div className="text-xs font-mono font-bold uppercase text-[#111111] mb-1.5">
          Correlativas para Cursar:
        </div>
        {correlativasReqs.length === 0 ? (
          <div className="text-xs font-mono text-[#52525b]">Sin correlativas previas requeridas.</div>
        ) : (
          <ul className="space-y-1.5 font-mono text-xs">
            {correlativasReqs.map(r => {
              const reqMat = r.materia_requerida
              const reqEstado = ctx.estadosMap[r.materia_requerida_id] || 'NO_CURSADA'
              const cumple = r.tipo === 'REGULARIZADA'
                ? (reqEstado === 'REGULAR' || reqEstado === 'PROMOCIONADA')
                : (reqEstado === 'PROMOCIONADA')

              return (
                <li
                  key={r.id}
                  className={`p-1.5 border-l-3 text-[11px] leading-tight ${
                    cumple
                      ? 'border-l-[#16a34a] bg-[#f0fdf4] text-[#111111]'
                      : 'border-l-[#dc2626] bg-[#fef2f2] text-[#111111]'
                  }`}
                >
                  <div className="font-bold">
                    {cumple ? '✓' : '✕'} {reqMat?.nombre || `Materia #${r.materia_requerida_id}`}
                  </div>
                  <div className="text-[10px] text-[#52525b]">
                    Exige: {r.tipo === 'REGULARIZADA' ? 'Cursada Regular' : 'Final Aprobado'} • Estado: {reqEstado}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Impacto en cascada: materias que desbloquea */}
      <div className="pt-2 border-t-2 border-[#111111]">
        <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[#111111] mb-1.5">
          <span>Materias que Desbloquea ({dependientes.length})</span>
          {cascada.totalMateriasAtrasadas > 0 && (
            <span className="text-[#ff1464]">Cascada: {cascada.totalMateriasAtrasadas}</span>
          )}
        </div>
        {dependientes.length === 0 ? (
          <div className="text-xs font-mono text-[#52525b]">Es una materia final de ciclo.</div>
        ) : (
          <ul className="space-y-1 font-mono text-[11px]">
            {dependientes.slice(0, 5).map(d => {
              const depMat = ctx.materias.find(m => m.id === d.materia_id)
              return (
                <li key={d.id} className="text-[#111111] flex items-center gap-1">
                  <span className="text-[#0047ff]">→</span>
                  <span className="truncate">{depMat?.nombre || `Materia #${d.materia_id}`}</span>
                </li>
              )
            })}
            {dependientes.length > 5 && (
              <li className="text-[10px] text-[#52525b] italic">
                y {dependientes.length - 5} materias más en niveles superiores
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
