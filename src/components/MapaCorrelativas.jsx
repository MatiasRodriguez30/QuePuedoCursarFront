import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Check,
  Expand,
  Lock,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import TitoAvatar from './TitoAvatar'
import {
  buildMapaData,
  computeLayout,
  computeRelacionesFoco,
  routeOrthogonalEdges,
} from './mapaCorrelativasLayout'

const MIN_ZOOM = 0.45
const MAX_ZOOM = 1.4
const ZOOM_STEP = 0.12

function clampZoom(z) {
  return Math.round(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) * 100) / 100
}

function getEstadoConfig(materia) {
  if (materia.isAprobada) {
    return {
      short: '✓ Aprobada',
      badgeClass: 'bg-[#ccff00] text-[#111111] border border-[#111111]',
    }
  }
  if (materia.isRegular) {
    return {
      short: '✎ Regular',
      badgeClass: 'bg-[#fef08a] text-[#111111] border border-[#111111]',
    }
  }
  if (materia.isCursando) {
    return {
      short: '⚡ Cursando',
      badgeClass: 'bg-[#0047ff] text-white border border-[#111111]',
    }
  }
  if (materia.isCursable) {
    return {
      short: '★ Cursable',
      badgeClass: 'bg-[#ff1464] text-[#111111] border border-[#111111]',
    }
  }
  return {
    short: 'Bloqueada',
    isLocked: true,
    badgeClass: 'bg-[#f4f4f5] text-[#111111] border border-[#71717a]',
  }
}

export default function MapaCorrelativas({
  ctx,
  filtroActivo = 'TODAS',
  query = '',
  focusedMateriaId = null,
  onFocusMateria,
  onOpenDetalle,
  onResetFiltros,
  detalleAbierto = false,
}) {
  const [incluirElectivas, setIncluirElectivas] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [hoveredId, setHoveredId] = useState(null)
  const [isPanning, setIsPanning] = useState(false)

  const uid = useId().replace(/:/g, '')
  const arrowAprobadaId = `qpc-arrow-apr-${uid}`
  const arrowRegularId = `qpc-arrow-reg-${uid}`

  const scrollContainerRef = useRef(null)
  const panStateRef = useRef(null)
  const panCleanupRef = useRef(null)
  const didDragRef = useRef(false)
  const zoomRef = useRef(zoom)
  const fullscreenRef = useRef(fullscreen)
  const wasNativeFullscreenRef = useRef(false)

  useEffect(() => {
    zoomRef.current = zoom
  }, [zoom])

  useEffect(() => {
    fullscreenRef.current = fullscreen
  }, [fullscreen])

  const mapaData = useMemo(
    () => buildMapaData(ctx, { incluirElectivas, filtroActivo, query }),
    [ctx, incluirElectivas, filtroActivo, query],
  )

  const layout = useMemo(() => computeLayout(mapaData.columns), [mapaData.columns])

  const effectiveFocusId = focusedMateriaId && mapaData.visibleIdSet.has(focusedMateriaId)
    ? focusedMateriaId
    : null

  const relacionesFoco = useMemo(
    () => computeRelacionesFoco(effectiveFocusId, ctx, mapaData.visibleIdSet),
    [effectiveFocusId, ctx, mapaData.visibleIdSet],
  )

  const activeEdgesSource = useMemo(() => {
    if (relacionesFoco) return { rel: relacionesFoco, isPreview: false }
    if (hoveredId && mapaData.visibleIdSet.has(hoveredId)) {
      const hoverRel = computeRelacionesFoco(hoveredId, ctx, mapaData.visibleIdSet)
      if (hoverRel) return { rel: hoverRel, isPreview: true }
    }
    return { rel: null, isPreview: false }
  }, [relacionesFoco, hoveredId, mapaData.visibleIdSet, ctx])

  const routedEdges = useMemo(() => {
    if (!activeEdgesSource.rel) return []
    return routeOrthogonalEdges(activeEdgesSource.rel.edges, layout.nodesById)
  }, [activeEdgesSource.rel, layout.nodesById])

  const focusedMateria = effectiveFocusId ? mapaData.nodesMetaById.get(effectiveFocusId) : null

  const portMaps = useMemo(() => {
    const hasIn = new Set()
    const hasOut = new Set()
    for (const id of mapaData.visibleIdSet) {
      const reqs = ctx?.prereqsByMateria?.[id] || []
      if (reqs.some(r => mapaData.visibleIdSet.has(r.materia_requerida_id))) {
        hasIn.add(id)
      }
      const deps = ctx?.dependientesByMateria?.[id] || []
      if (deps.some(d => mapaData.visibleIdSet.has(d.materia_id))) {
        hasOut.add(id)
      }
    }
    return { hasIn, hasOut }
  }, [ctx, mapaData.visibleIdSet])

  const enterFullscreen = useCallback(() => {
    setFullscreen(true)
    const el = document.documentElement
    if (el?.requestFullscreen) {
      el.requestFullscreen()
        .then(() => {
          wasNativeFullscreenRef.current = true
        })
        .catch(() => {
          wasNativeFullscreenRef.current = false
        })
    }
  }, [])

  const exitFullscreen = useCallback(() => {
    setFullscreen(false)
    wasNativeFullscreenRef.current = false
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (fullscreenRef.current) exitFullscreen()
    else enterFullscreen()
  }, [enterFullscreen, exitFullscreen])

  // Sincronizar si el usuario sale de Fullscreen API con Esc o botón del navegador
  useEffect(() => {
    function handleFullscreenChange() {
      if (wasNativeFullscreenRef.current && !document.fullscreenElement) {
        wasNativeFullscreenRef.current = false
        setFullscreen(false)
      }
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Limpiar drag listeners y Fullscreen API al desmontar
  useEffect(() => {
    return () => {
      panCleanupRef.current?.()
      panCleanupRef.current = null
      if (wasNativeFullscreenRef.current && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  const scrollToNode = useCallback((id) => {
    const container = scrollContainerRef.current
    const node = layout.nodesById.get(id)
    if (!container || !node) return
    const z = zoomRef.current
    const padLeft = fullscreenRef.current ? 16 : 0
    const padTop = fullscreenRef.current ? 8 : 0
    const targetLeft = Math.max(0, padLeft + node.cx * z - container.clientWidth / 2)
    const targetTop = Math.max(0, padTop + node.cy * z - container.clientHeight / 2)
    const reduceMotion = typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    container.scrollTo({
      left: targetLeft,
      top: targetTop,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [layout.nodesById])

  // Centrar cuando llega un foco nuevo (por ej. desde "Ver en mapa de correlativas")
  useEffect(() => {
    if (!effectiveFocusId) return
    const container = scrollContainerRef.current
    const node = layout.nodesById.get(effectiveFocusId)
    if (!container || !node) return

    const z = zoomRef.current
    const padLeft = fullscreenRef.current ? 16 : 0
    const padTop = fullscreenRef.current ? 8 : 0
    const left = padLeft + node.x * z
    const right = padLeft + (node.x + node.w) * z
    const top = padTop + node.y * z
    const bottom = padTop + (node.y + node.h) * z

    const inViewX = left >= container.scrollLeft && right <= container.scrollLeft + container.clientWidth
    const inViewY = top >= container.scrollTop && bottom <= container.scrollTop + container.clientHeight
    if (!inViewX || !inViewY) {
      scrollToNode(effectiveFocusId)
    }
  }, [effectiveFocusId, layout.nodesById, scrollToNode])

  // Escape sale de pantalla completa primero, luego limpia foco (salvo si está abierto el modal de detalle)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key !== 'Escape' || detalleAbierto) return
      if (fullscreen) {
        e.preventDefault()
        exitFullscreen()
      } else if (effectiveFocusId) {
        e.preventDefault()
        onFocusMateria?.(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreen, effectiveFocusId, detalleAbierto, exitFullscreen, onFocusMateria])

  const hasCanvas = Boolean(ctx?.materias?.length) && mapaData.stats.visibles > 0

  // Rueda del ratón: Ctrl+rueda zoom anclado al cursor, Shift+rueda pan horizontal
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container || !hasCanvas) return

    function handleWheel(e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const oldZoom = zoomRef.current
        const delta = e.deltaY < 0 ? 0.1 : -0.1
        const nextZoom = clampZoom(oldZoom + delta)
        if (nextZoom === oldZoom) return

        const rect = container.getBoundingClientRect()
        const offsetX = e.clientX - rect.left
        const offsetY = e.clientY - rect.top
        const padLeft = fullscreenRef.current ? 16 : 0
        const padTop = fullscreenRef.current ? 8 : 0
        const canvasX = (container.scrollLeft + offsetX - padLeft) / oldZoom
        const canvasY = (container.scrollTop + offsetY - padTop) / oldZoom

        zoomRef.current = nextZoom
        setZoom(nextZoom)

        window.requestAnimationFrame(() => {
          container.scrollLeft = Math.max(0, canvasX * nextZoom + padLeft - offsetX)
          container.scrollTop = Math.max(0, canvasY * nextZoom + padTop - offsetY)
        })
      } else if (e.shiftKey && Math.abs(e.deltaY) > 0 && Math.abs(e.deltaX) === 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [hasCanvas])

  function handleFitZoom() {
    const container = scrollContainerRef.current
    if (!container || layout.width <= 0) return
    const padX = fullscreen ? 32 : 16
    const fit = clampZoom((container.clientWidth - padX) / layout.width)
    setZoom(Math.min(1, fit))
    container.scrollTo({ left: 0, top: 0, behavior: 'auto' })
  }

  function handleResetZoom() {
    setZoom(1)
    scrollContainerRef.current?.scrollTo({ left: 0, top: 0, behavior: 'auto' })
  }

  function handlePointerDown(e) {
    if (e.pointerType !== 'mouse') return
    if (e.button !== 0 && e.button !== 1) return

    const container = scrollContainerRef.current
    if (!container) return

    if (e.button === 1) {
      e.preventDefault()
    }

    panCleanupRef.current?.()
    didDragRef.current = false
    panStateRef.current = {
      pointerId: e.pointerId,
      button: e.button,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
      dragging: false,
    }

    function handleWindowPointerMove(ev) {
      const pan = panStateRef.current
      if (!pan || ev.pointerId !== pan.pointerId) return

      const dx = ev.clientX - pan.startX
      const dy = ev.clientY - pan.startY

      if (!pan.dragging) {
        const threshold = pan.button === 1 ? 1 : 6
        const moved = pan.button === 1
          ? (Math.abs(dx) > threshold || Math.abs(dy) > threshold)
          : (Math.hypot(dx, dy) > threshold)
        if (!moved) return
        pan.dragging = true
        didDragRef.current = true
        setIsPanning(true)
      }

      container.scrollLeft = pan.scrollLeft - dx
      container.scrollTop = pan.scrollTop - dy
    }

    function finishPan(ev) {
      const pan = panStateRef.current
      if (!pan || ev.pointerId !== pan.pointerId) return
      const wasDragging = pan.dragging

      panCleanupRef.current?.()
      panCleanupRef.current = null
      panStateRef.current = null
      setIsPanning(false)

      if (wasDragging) {
        window.setTimeout(() => {
          didDragRef.current = false
        }, 0)
      }
    }

    window.addEventListener('pointermove', handleWindowPointerMove)
    window.addEventListener('pointerup', finishPan)
    window.addEventListener('pointercancel', finishPan)
    panCleanupRef.current = () => {
      window.removeEventListener('pointermove', handleWindowPointerMove)
      window.removeEventListener('pointerup', finishPan)
      window.removeEventListener('pointercancel', finishPan)
    }
  }

  function handleContainerClickCapture(e) {
    if (!didDragRef.current) return
    e.preventDefault()
    e.stopPropagation()
    didDragRef.current = false
  }

  function handleCardClick(materiaId) {
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    if (effectiveFocusId === materiaId) {
      onFocusMateria?.(null)
    } else {
      onFocusMateria?.(materiaId)
    }
  }

  // Listas ordenadas para resumen táctil móvil
  const mobilePrevias = useMemo(() => {
    if (!relacionesFoco) return []
    const items = []
    for (const [id, info] of relacionesFoco.previasMap.entries()) {
      const m = mapaData.nodesMetaById.get(id)
      if (m) items.push({ materia: m, ...info })
    }
    return items.sort((a, b) => (a.materia.anio || 0) - (b.materia.anio || 0))
  }, [relacionesFoco, mapaData.nodesMetaById])

  const mobileHabilita = useMemo(() => {
    if (!relacionesFoco) return []
    const items = []
    for (const [id, info] of relacionesFoco.habilitaMap.entries()) {
      const m = mapaData.nodesMetaById.get(id)
      if (m) items.push({ materia: m, ...info })
    }
    return items.sort((a, b) => (a.materia.anio || 0) - (b.materia.anio || 0))
  }, [relacionesFoco, mapaData.nodesMetaById])

  // Estado vacío 1: Sin materias en la carrera
  if (!ctx?.materias || ctx.materias.length === 0) {
    return (
      <div className="bg-[#f4f0e6] border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-10 text-center max-w-xl mx-auto my-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-white border-2 border-[#111111] shadow-fanzine-sm flex items-center justify-center p-2">
          <TitoAvatar variant="mate" className="w-16 h-16" />
        </div>
        <div className="inline-block bg-white text-[#111111] font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#111111] mb-2">
          SIN MATERIAS
        </div>
        <h3 className="font-display text-base font-bold uppercase text-[#111111]">
          No hay materias cargadas
        </h3>
        <p className="font-mono text-xs text-[#52525b] mt-1.5 leading-relaxed">
          Cuando esta carrera tenga materias cargadas, acá vas a ver el mapa completo de correlatividades.
        </p>
      </div>
    )
  }

  const { stats } = mapaData

  return (
    <div
      className={
        fullscreen
          ? 'fixed inset-0 z-[70] w-screen h-screen bg-[#f4f0e6] bg-riso-halftone flex flex-col overflow-hidden'
          : 'space-y-3'
      }
      data-testid="mapa-correlativas-root"
    >
      {/* ── MODO NORMAL: BARRA SUPERIOR + BANNER DE FOCO + RESUMEN MÓVIL ── */}
      {!fullscreen && (
        <>
          <div className="bg-white border-3 border-[#111111] shadow-fanzine-sm p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] font-bold">
              <span className="px-2 py-1 bg-[#111111] text-[#ccff00] border border-[#111111] uppercase">
                {stats.visibles} de {stats.total} materias
              </span>
              <span className="px-2 py-1 bg-[#ccff00] text-[#111111] border border-[#111111]">
                {stats.aprobadas} aprobadas
              </span>
              <span className="px-2 py-1 bg-[#fef08a] text-[#111111] border border-[#111111]">
                {stats.regulares} regulares
              </span>
              {stats.cursando > 0 && (
                <span className="px-2 py-1 bg-[#0047ff] text-white border border-[#111111]">
                  {stats.cursando} cursando
                </span>
              )}
              <span className="px-2 py-1 bg-[#ff1464] text-[#111111] border border-[#111111]">
                {stats.cursables} cursables
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {stats.totalElectivas > 0 && (
                <button
                  type="button"
                  aria-pressed={incluirElectivas}
                  onClick={() => setIncluirElectivas(prev => !prev)}
                  className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 border-2 border-[#111111] font-mono text-[11px] font-bold uppercase cursor-pointer transition-colors ${
                    incluirElectivas
                      ? 'bg-[#111111] text-[#ccff00] shadow-[2px_2px_0px_#ff1464]'
                      : 'bg-[#f4f0e6] text-[#111111] hover:bg-white shadow-[2px_2px_0px_#111111]'
                  }`}
                >
                  Electivas ({stats.totalElectivas})
                </button>
              )}

              <button
                type="button"
                onClick={enterFullscreen}
                className="min-h-[44px] sm:min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-[11px] font-bold uppercase cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Pantalla completa</span>
              </button>
            </div>
          </div>

          {relacionesFoco && focusedMateria ? (
            <div
              aria-live="polite"
              className="bg-white border-3 border-[#111111] shadow-fanzine-md p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#111111] text-[#ccff00] font-mono text-xs font-bold border border-[#111111]">
                    {focusedMateria.codigo}
                  </span>
                  <h3 className="font-sans text-sm sm:text-base font-bold text-[#111111] leading-tight">
                    {focusedMateria.nombre}
                  </h3>
                  <span className="font-mono text-[11px] font-bold text-[#52525b]">
                    · {focusedMateria.anio ? `${focusedMateria.anio}º Año` : 'Electiva'}
                  </span>
                  <EstadoMiniBadge materia={focusedMateria} />
                </div>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs font-bold">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#ccff00] text-[#111111] border-2 border-[#111111]">
                    <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden="true" className="shrink-0">
                      <line x1="0" y1="4" x2="18" y2="4" stroke="#166534" strokeWidth="3" />
                    </svg>
                    <span>Con Aprobada habilita: {relacionesFoco.conAprobadaCount}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#0047ff] text-white border-2 border-[#111111]">
                    <svg width="18" height="8" viewBox="0 0 18 8" aria-hidden="true" className="shrink-0">
                      <line x1="0" y1="4" x2="18" y2="4" stroke="#ffffff" strokeWidth="3" strokeDasharray="4 3" />
                    </svg>
                    <span>Con Regular habilita: {relacionesFoco.conRegularCount}</span>
                  </span>

                  <span className="text-[#52525b]">
                    (Requiere {relacionesFoco.totalPrevias} {relacionesFoco.totalPrevias === 1 ? 'previa' : 'previas'})
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenDetalle?.(focusedMateria.id)}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f0e6] hover:bg-[#ccff00] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Editar estado</span>
                </button>

                <button
                  type="button"
                  onClick={() => onFocusMateria?.(null)}
                  className="min-h-[44px] sm:min-h-[38px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] hover:bg-[#ff1464] text-white hover:text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ver todo</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#fffdf5] border-2 border-[#111111] px-3 py-2 font-mono text-xs text-[#111111] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0047ff] shrink-0" aria-hidden="true" />
              <span>
                Arrastrá la pizarra con click o con la rueda del ratón (Ctrl + rueda para zoom) · Tocá una materia para ver sus previas y qué habilita.
              </span>
            </div>
          )}

          {relacionesFoco && focusedMateria && (
            <div className="md:hidden bg-white border-2 border-[#111111] shadow-fanzine-sm p-3 space-y-2.5">
              <div>
                <div className="font-mono text-[10px] font-bold uppercase text-[#52525b] mb-1">
                  Previas requeridas ({mobilePrevias.length})
                </div>
                {mobilePrevias.length === 0 ? (
                  <p className="font-mono text-[11px] text-[#52525b]">No requiere correlativas previas.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {mobilePrevias.map(({ materia, tipo, cumplida }) => (
                      <button
                        key={materia.id}
                        type="button"
                        onClick={() => {
                          onFocusMateria?.(materia.id)
                          scrollToNode(materia.id)
                        }}
                        className={`min-h-[44px] px-2.5 py-1.5 border-2 border-[#111111] text-left font-mono text-[11px] font-bold cursor-pointer ${
                          tipo === 'APROBADA' ? 'bg-[#f0fdf4] text-[#111111]' : 'bg-[#eff6ff] text-[#111111]'
                        }`}
                      >
                        <span className="block leading-tight">
                          {cumplida ? '✓' : '✕'} [{materia.codigo}] {materia.nombre}
                        </span>
                        <span className="text-[10px] text-[#52525b]">
                          {tipo === 'APROBADA' ? 'Debés tenerla Aprobada' : 'Debés tenerla Regular'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#111111]">
                <div className="font-mono text-[10px] font-bold uppercase text-[#52525b] mb-1">
                  Materias que habilita ({mobileHabilita.length})
                </div>
                {mobileHabilita.length === 0 ? (
                  <p className="font-mono text-[11px] text-[#52525b]">Es una materia final de ciclo.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {mobileHabilita.map(({ materia, tipo }) => (
                      <button
                        key={materia.id}
                        type="button"
                        onClick={() => {
                          onFocusMateria?.(materia.id)
                          scrollToNode(materia.id)
                        }}
                        className={`min-h-[44px] px-2.5 py-1.5 border-2 border-[#111111] text-left font-mono text-[11px] font-bold cursor-pointer ${
                          tipo === 'APROBADA' ? 'bg-[#ccff00] text-[#111111]' : 'bg-[#0047ff] text-white'
                        }`}
                      >
                        <span className="block leading-tight">
                          → [{materia.codigo}] {materia.nombre}
                        </span>
                        <span className={`text-[10px] ${tipo === 'APROBADA' ? 'text-[#111111]' : 'text-white'}`}>
                          {tipo === 'APROBADA' ? 'Desbloquea con Aprobada' : 'Desbloquea con Regular'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODO PANTALLA COMPLETA: BARRA SUPERIOR SÓLIDA SIN TAPAR EL LIENZO ── */}
      {fullscreen && (
        <div className="shrink-0 bg-white border-b-3 border-[#111111] px-2.5 sm:px-3 py-2 flex flex-col xl:flex-row xl:items-center justify-between gap-2 z-30">
          {/* Izquierda: Salir + stats + electivas */}
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] font-bold">
            <button
              type="button"
              onClick={exitFullscreen}
              className="min-h-[44px] sm:min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 bg-[#111111] hover:bg-[#ff1464] text-[#ccff00] hover:text-[#111111] border border-[#111111] uppercase cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Salir</span>
            </button>

            <span className="px-2 py-1 bg-[#111111] text-[#ccff00] border border-[#111111]">
              {stats.visibles}/{stats.total}
            </span>
            <span className="px-2 py-1 bg-[#ccff00] text-[#111111] border border-[#111111]">
              {stats.aprobadas} aprobadas
            </span>
            <span className="hidden sm:inline-block px-2 py-1 bg-[#fef08a] text-[#111111] border border-[#111111]">
              {stats.regulares} regulares
            </span>
            <span className="hidden sm:inline-block px-2 py-1 bg-[#ff1464] text-[#111111] border border-[#111111]">
              {stats.cursables} cursables
            </span>

            {stats.totalElectivas > 0 && (
              <button
                type="button"
                aria-pressed={incluirElectivas}
                onClick={() => setIncluirElectivas(prev => !prev)}
                className={`min-h-[44px] sm:min-h-[34px] px-2 py-1 border border-[#111111] uppercase cursor-pointer ${
                  incluirElectivas
                    ? 'bg-[#111111] text-[#ccff00]'
                    : 'bg-[#f4f0e6] text-[#111111] hover:bg-white'
                }`}
              >
                Electivas ({stats.totalElectivas})
              </button>
            )}
          </div>

          {/* Derecha: Foco compacto cuando hay materia seleccionada */}
          {relacionesFoco && focusedMateria && (
            <div
              aria-live="polite"
              className="flex flex-wrap items-center justify-between xl:justify-end gap-1.5 sm:gap-2 pt-1.5 xl:pt-0 border-t-2 xl:border-t-0 border-[#111111]"
            >
              <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                <span className="px-1.5 py-0.5 bg-[#111111] text-[#ccff00] font-mono text-[11px] font-bold border border-[#111111]">
                  {focusedMateria.codigo}
                </span>
                <span className="font-sans text-xs sm:text-sm font-bold text-[#111111] truncate max-w-[180px] sm:max-w-[260px]">
                  {focusedMateria.nombre}
                </span>
                <EstadoMiniBadge materia={focusedMateria} />
                <span className="px-1.5 py-0.5 bg-[#ccff00] text-[#111111] border border-[#111111] font-mono text-[11px] font-bold">
                  Con Aprobada: {relacionesFoco.conAprobadaCount}
                </span>
                <span className="px-1.5 py-0.5 bg-[#0047ff] text-white border border-[#111111] font-mono text-[11px] font-bold">
                  Con Regular: {relacionesFoco.conRegularCount}
                </span>
                <span className="font-mono text-[11px] font-bold text-[#52525b]">
                  (Req. {relacionesFoco.totalPrevias})
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenDetalle?.(focusedMateria.id)}
                  className="min-h-[44px] sm:min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 bg-[#f4f0e6] hover:bg-[#ccff00] text-[#111111] border-2 border-[#111111] font-mono text-[11px] font-bold uppercase cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Editar estado</span>
                </button>

                <button
                  type="button"
                  onClick={() => onFocusMateria?.(null)}
                  className="min-h-[44px] sm:min-h-[34px] inline-flex items-center gap-1 px-2.5 py-1 bg-[#111111] hover:bg-[#ff1464] text-white hover:text-[#111111] border-2 border-[#111111] font-mono text-[11px] font-bold uppercase cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ver todo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ESTADO VACÍO POR FILTROS / BÚSQUEDA ── */}
      {stats.visibles === 0 ? (
        <div
          className={`bg-[#f4f0e6] border-3 border-[#111111] shadow-fanzine-md p-6 sm:p-8 text-center ${
            fullscreen ? 'mx-auto my-auto max-w-md' : ''
          }`}
        >
          <div className="w-16 h-16 mx-auto mb-3 bg-white border-2 border-[#111111] shadow-fanzine-sm flex items-center justify-center p-1.5">
            <TitoAvatar variant="lupa" className="w-12 h-12" />
          </div>
          <h3 className="font-display text-sm sm:text-base font-bold uppercase text-[#111111]">
            Ninguna materia coincide con ese filtro
          </h3>
          <p className="font-mono text-xs text-[#52525b] mt-1 mb-4">
            Probá limpiando la búsqueda o volviendo al filtro &quot;Todas&quot;.
          </p>
          {onResetFiltros && (
            <button
              type="button"
              onClick={onResetFiltros}
              className="min-h-[44px] px-4 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111] font-mono text-xs font-bold uppercase cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        /* ── LIENZO INTERACTIVO CON SCROLL, DRAG-TO-PAN, ZOOM Y CAPA SVG ── */
        <div
          className={
            fullscreen
              ? 'relative flex-1 min-h-0'
              : 'relative border-3 border-[#111111] bg-[#f4f0e6] bg-riso-halftone shadow-fanzine-md overflow-hidden'
          }
        >
          <div
            ref={scrollContainerRef}
            onMouseDown={e => {
              if (e.button === 1) e.preventDefault()
            }}
            onAuxClick={e => {
              if (e.button === 1) e.preventDefault()
            }}
            onPointerDown={handlePointerDown}
            onClickCapture={handleContainerClickCapture}
            className={`overflow-auto select-none ${
              fullscreen ? 'w-full h-full' : 'h-[68vh] min-h-[460px]'
            } ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            <div style={fullscreen ? { padding: '8px 16px 68px 16px' } : undefined}>
              <div
                style={{
                  width: `${layout.width * zoom}px`,
                  height: `${layout.height * zoom}px`,
                }}
                className="relative"
              >
                <div
                  style={{
                    width: `${layout.width}px`,
                    height: `${layout.height}px`,
                    transform: `scale(${zoom})`,
                    transformOrigin: '0 0',
                  }}
                  className="relative"
                >
                  {/* Encabezados de columnas por año */}
                  {layout.columnHeaders.map(col => (
                    <div
                      key={col.key}
                      style={{ left: `${col.x}px`, top: '14px', width: `${col.w}px`, height: '38px' }}
                      className="absolute bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] px-2.5 flex items-center justify-between z-10 pointer-events-none"
                    >
                      <span className="font-display text-xs font-bold uppercase text-[#111111]">
                        {col.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold bg-[#f4f0e6] text-[#111111] px-1.5 py-0.5 border border-[#111111]">
                        {col.aprobadas}/{col.count}
                      </span>
                    </div>
                  ))}

                  {/* Capa de tarjetas HTML (z-10) */}
                  <div className="absolute inset-0 z-10">
                    {Array.from(layout.nodesById.values()).map(node => {
                      const materia = mapaData.nodesMetaById.get(node.id)
                      if (!materia) return null

                      const isFocused = effectiveFocusId === node.id
                      let relationRole = null
                      let relationInfo = null

                      if (relacionesFoco) {
                        if (relacionesFoco.previasMap.has(node.id)) {
                          relationRole = 'previa'
                          relationInfo = relacionesFoco.previasMap.get(node.id)
                        } else if (relacionesFoco.habilitaMap.has(node.id)) {
                          relationRole = 'habilita'
                          relationInfo = relacionesFoco.habilitaMap.get(node.id)
                        }
                      }

                      const isDimmedByFocus = Boolean(relacionesFoco) && !isFocused && !relationRole
                      const isDimmedByFilter = !materia.matchesView && !isFocused && !relationRole
                      const isDimmed = isDimmedByFocus || isDimmedByFilter

                      return (
                        <MapaMateriaCard
                          key={node.id}
                          materia={materia}
                          node={node}
                          isFocused={isFocused}
                          relationRole={relationRole}
                          relationInfo={relationInfo}
                          isDimmed={isDimmed}
                          isPanning={isPanning}
                          showPorts={!relacionesFoco}
                          hasInPort={portMaps.hasIn.has(node.id)}
                          hasOutPort={portMaps.hasOut.has(node.id)}
                          onClick={() => handleCardClick(node.id)}
                          onMouseEnter={() => {
                            if (!relacionesFoco) setHoveredId(node.id)
                          }}
                          onMouseLeave={() => {
                            setHoveredId(prev => (prev === node.id ? null : prev))
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Capa SVG de flechas ortogonales (z-20 pointer-events-none) */}
                  <svg
                    width={layout.width}
                    height={layout.height}
                    className="absolute inset-0 z-20 pointer-events-none"
                    aria-hidden="true"
                  >
                    <defs>
                      <marker
                        id={arrowAprobadaId}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#166534" />
                      </marker>
                      <marker
                        id={arrowRegularId}
                        viewBox="0 0 10 10"
                        refX="8"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#0047ff" />
                      </marker>
                    </defs>

                    {routedEdges.map(edge => {
                      const isAprobada = edge.tipo === 'APROBADA'
                      const stroke = isAprobada ? '#166534' : '#0047ff'
                      const markerId = isAprobada ? arrowAprobadaId : arrowRegularId
                      const isPreview = activeEdgesSource.isPreview

                      return (
                        <g key={edge.id} opacity={isPreview ? 0.65 : 1}>
                          <circle cx={edge.startX} cy={edge.startY} r="3.5" fill={stroke} />
                          <path
                            d={edge.d}
                            fill="none"
                            stroke={stroke}
                            strokeWidth={isPreview ? 2 : 2.5}
                            strokeLinejoin="round"
                            strokeDasharray={isAprobada ? undefined : '6 4'}
                            markerEnd={`url(#${markerId})`}
                          />
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Barra inferior dentro del lienzo: leyenda compacta (fullscreen) + zoom sin solapamiento */}
          <div
            className={`pointer-events-none absolute bottom-3 left-3 right-3 z-30 flex items-end gap-3 ${
              fullscreen ? 'justify-end lg:justify-between' : 'justify-end'
            }`}
          >
            {fullscreen && (
              <div className="hidden lg:flex pointer-events-auto bg-white border-2 border-[#111111] shadow-fanzine-sm px-2.5 py-1.5 items-center gap-2 font-mono text-[10px] font-bold flex-wrap">
                <span className="px-1 bg-[#ccff00] text-[#111111] border border-[#111111]">✓ Aprobada</span>
                <span className="px-1 bg-[#fef08a] text-[#111111] border border-[#111111]">✎ Regular</span>
                <span className="px-1 bg-[#0047ff] text-white border border-[#111111]">⚡ Cursando</span>
                <span className="px-1 bg-[#ff1464] text-[#111111] border border-[#111111]">★ Cursable</span>
                <span className="px-1 bg-[#f4f4f5] text-[#111111] border border-[#71717a]">🔒 Bloqueada</span>

                <span className="inline-flex items-center gap-1 text-[#166534]">
                  <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
                    <line x1="0" y1="4" x2="16" y2="4" stroke="#166534" strokeWidth="3" />
                  </svg>
                  <span>Req. Aprobada</span>
                </span>

                <span className="inline-flex items-center gap-1 text-[#0047ff]">
                  <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
                    <line x1="0" y1="4" x2="16" y2="4" stroke="#0047ff" strokeWidth="3" strokeDasharray="4 3" />
                  </svg>
                  <span>Req. Regular</span>
                </span>
              </div>
            )}

            <div
              role="group"
              aria-label="Controles de zoom del mapa"
              className="pointer-events-auto shrink-0 bg-white border-2 border-[#111111] shadow-fanzine-sm p-1 flex items-center gap-1"
            >
              <button
                type="button"
                onClick={() => setZoom(z => clampZoom(z - ZOOM_STEP))}
                disabled={zoom <= MIN_ZOOM}
                aria-label="Alejar mapa"
                title="Alejar"
                className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center bg-[#f4f0e6] hover:bg-[#ccff00] disabled:bg-[#e4e4e7] disabled:text-[#71717a] disabled:border-[#71717a] disabled:cursor-not-allowed border border-[#111111] text-[#111111] cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" aria-hidden="true" />
              </button>

              <span className="font-mono text-[11px] font-bold text-[#111111] px-1.5 min-w-[44px] text-center">
                {Math.round(zoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoom(z => clampZoom(z + ZOOM_STEP))}
                disabled={zoom >= MAX_ZOOM}
                aria-label="Acercar mapa"
                title="Acercar"
                className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center bg-[#f4f0e6] hover:bg-[#ccff00] disabled:bg-[#e4e4e7] disabled:text-[#71717a] disabled:border-[#71717a] disabled:cursor-not-allowed border border-[#111111] text-[#111111] cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleFitZoom}
                title="Ajustar mapa al ancho visible"
                className="min-h-[44px] sm:min-h-[34px] inline-flex items-center gap-1 px-2 bg-white hover:bg-[#ccff00] border border-[#111111] font-mono text-[10px] font-bold uppercase text-[#111111] cursor-pointer"
              >
                <Expand className="w-3 h-3" aria-hidden="true" />
                <span>Ajustar</span>
              </button>

              <button
                type="button"
                onClick={handleResetZoom}
                title="Restablecer zoom al 100%"
                aria-label="Restablecer zoom"
                className="min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center bg-white hover:bg-[#ccff00] border border-[#111111] text-[#111111] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                aria-label={fullscreen ? 'Salir de pantalla completa' : 'Abrir en pantalla completa'}
                className={`min-w-[44px] min-h-[44px] sm:min-w-[34px] sm:min-h-[34px] flex items-center justify-center border border-[#111111] cursor-pointer ${
                  fullscreen
                    ? 'bg-[#111111] text-[#ccff00] hover:bg-[#ff1464] hover:text-[#111111]'
                    : 'bg-[#ccff00] text-[#111111] hover:bg-[#b8e600]'
                }`}
              >
                {fullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LEYENDA INFERIOR EN MODO NORMAL ── */}
      {!fullscreen && (
        <div className="bg-white border-2 border-[#111111] shadow-fanzine-sm px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-2 font-bold">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#ccff00] text-[#111111] border border-[#111111]">
              ✓ Aprobada
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#fef08a] text-[#111111] border border-[#111111]">
              ✎ Regular
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#0047ff] text-white border border-[#111111]">
              <Zap className="w-3 h-3" aria-hidden="true" />
              <span>Cursando</span>
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#ff1464] text-[#111111] border border-[#111111]">
              ★ Cursable
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#f4f4f5] text-[#111111] border border-[#71717a]">
              <Lock className="w-3 h-3" aria-hidden="true" />
              <span>Bloqueada</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 font-bold text-[#111111]">
            <span className="inline-flex items-center gap-1.5">
              <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true">
                <line x1="0" y1="4" x2="22" y2="4" stroke="#166534" strokeWidth="3" />
              </svg>
              <span className="text-[#166534]">Línea sólida: Req. Aprobada</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <svg width="22" height="8" viewBox="0 0 22 8" aria-hidden="true">
                <line x1="0" y1="4" x2="22" y2="4" stroke="#0047ff" strokeWidth="3" strokeDasharray="5 3" />
              </svg>
              <span className="text-[#0047ff]">Línea discontinua: Req. Regular</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function EstadoMiniBadge({ materia }) {
  const cfg = getEstadoConfig(materia)
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 font-mono text-[10px] font-bold shrink-0 ${cfg.badgeClass}`}>
      {cfg.isLocked && <Lock className="w-2.5 h-2.5 shrink-0" aria-hidden="true" />}
      <span>{cfg.short}</span>
    </span>
  )
}

const MapaMateriaCard = memo(function MapaMateriaCard({
  materia,
  node,
  isFocused,
  relationRole,
  relationInfo,
  isDimmed,
  isPanning,
  showPorts,
  hasInPort,
  hasOutPort,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  let containerClass = 'bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
  let ribbon = null

  if (isFocused) {
    containerClass = 'bg-[#fff0f5] border-3 border-[#ff1464] shadow-[4px_4px_0px_#111111] z-20'
    ribbon = (
      <div className="px-1.5 py-0.5 bg-[#111111] text-[#ccff00] font-mono text-[11px] font-bold truncate">
        ★ Materia enfocada
      </div>
    )
  } else if (relationRole === 'previa' && relationInfo) {
    const isApr = relationInfo.tipo === 'APROBADA'
    containerClass = isApr
      ? 'bg-[#f0fdf4] border-3 border-[#166534] shadow-[3px_3px_0px_#166534]'
      : 'bg-[#eff6ff] border-3 border-[#0047ff] shadow-[3px_3px_0px_#0047ff]'
    ribbon = (
      <div
        className={`px-1.5 py-0.5 border border-[#111111] font-mono text-[11px] font-bold flex items-center justify-between gap-1 ${
          isApr ? 'bg-[#ccff00] text-[#111111]' : 'bg-[#0047ff] text-white'
        }`}
      >
        <span className="truncate">
          {isApr ? '✓ Debés tenerla Aprobada' : '✎ Debés tenerla Regular'}
        </span>
        <span className="shrink-0" title={relationInfo.cumplida ? 'Requisito cumplido' : 'Pendiente'}>
          {relationInfo.cumplida ? <Check className="w-3 h-3" aria-hidden="true" /> : '✕'}
        </span>
      </div>
    )
  } else if (relationRole === 'habilita' && relationInfo) {
    const isApr = relationInfo.tipo === 'APROBADA'
    containerClass = isApr
      ? 'bg-[#f0fdf4] border-3 border-[#166534] shadow-[3px_3px_0px_#166534]'
      : 'bg-[#eff6ff] border-3 border-[#0047ff] shadow-[3px_3px_0px_#0047ff]'
    ribbon = (
      <div
        className={`px-1.5 py-0.5 border border-[#111111] font-mono text-[11px] font-bold truncate ${
          isApr ? 'bg-[#ccff00] text-[#111111]' : 'bg-[#0047ff] text-white'
        }`}
      >
        {isApr ? '→ Desbloquea con Aprobada' : '→ Desbloquea con Regular'}
      </div>
    )
  } else if (isDimmed) {
    containerClass = 'bg-[#e4e4e7] border-2 border-dashed border-[#71717a] text-[#52525b]'
  } else if (materia.isAprobada) {
    containerClass = 'bg-white border-2 border-[#166534] shadow-[2px_2px_0px_#166534]'
  } else if (materia.isCursando) {
    containerClass = 'bg-[#eff6ff] border-2 border-[#0047ff] shadow-[2px_2px_0px_#0047ff]'
  } else if (materia.isRegular) {
    containerClass = 'bg-[#fffdf2] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
  } else if (materia.isCursable) {
    containerClass = 'bg-white border-2 border-[#111111] shadow-[2px_2px_0px_#ff1464]'
  } else {
    containerClass = 'bg-[#f9f6ee] border-2 border-[#71717a] shadow-[2px_2px_0px_#71717a]'
  }

  const estadoTexto = getEstadoConfig(materia).short
  const ariaExtra = isFocused
    ? 'Materia enfocada'
    : relationRole === 'previa'
      ? (relationInfo?.tipo === 'APROBADA' ? 'Previa: debés tenerla Aprobada' : 'Previa: debés tenerla Regular')
      : relationRole === 'habilita'
        ? (relationInfo?.tipo === 'APROBADA' ? 'Desbloquea con Aprobada' : 'Desbloquea con Regular')
        : ''

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-pressed={isFocused}
      aria-label={`${materia.nombre} (${materia.codigo}), ${estadoTexto}${ariaExtra ? `, ${ariaExtra}` : ''}`}
      title={materia.nombre}
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: `${node.w}px`,
        height: `${node.h}px`,
      }}
      className={`absolute p-2.5 flex flex-col gap-1 text-left transition-colors ${
        isPanning ? 'cursor-grabbing' : 'cursor-pointer'
      } ${containerClass}`}
    >
      {/* Puertos laterales cuando no hay foco activo */}
      {showPorts && hasInPort && (
        <span
          aria-hidden="true"
          className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#111111] border border-white pointer-events-none"
        />
      )}
      {showPorts && hasOutPort && (
        <span
          aria-hidden="true"
          className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#111111] border border-white pointer-events-none"
        />
      )}

      {/* Fila 1: Código + sello de estado */}
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="font-mono text-[11px] font-bold truncate text-[#52525b]">
          {materia.codigo}
        </span>
        <EstadoMiniBadge materia={materia} />
      </div>

      {/* Fila 2: Nombre de la materia */}
      <div
        className={`font-sans text-[13px] font-bold leading-[1.22] line-clamp-2 ${
          isDimmed ? 'text-[#52525b]' : 'text-[#111111]'
        }`}
      >
        {materia.nombre}
      </div>

      {/* Fila 3: Cinta de relación o foco */}
      {ribbon}

      {/* Fila 4: Horas semanales y cuatrimestre */}
      <div className="mt-auto font-mono text-[11px] font-bold text-[#52525b] flex items-center justify-between">
        <span>{materia.horas_semanales || 4} hs/sem</span>
        <span>{materia.cuatrimestre ? `${materia.cuatrimestre}ºC` : 'Anual'}</span>
      </div>
    </button>
  )
})
