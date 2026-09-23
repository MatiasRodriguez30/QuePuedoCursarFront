export default function GraficoAnualBarras({ datos }) {
  if (!datos || datos.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="font-mono text-xs text-[#71717a]">
          Todavía no hay materias aprobadas
        </p>
      </div>
    )
  }

  const maxCantidad = Math.max(...datos.map(d => Number(d.cantidad) || 0), 1)

  const barWidth = 36
  const barGap = 20
  const paddingX = 24
  const marginTop = 26
  const maxBarHeight = 90
  const marginBottom = 28
  const totalHeight = marginTop + maxBarHeight + marginBottom // 144
  const contentWidth = datos.length * barWidth + (datos.length - 1) * barGap
  const totalWidth = Math.max(contentWidth + paddingX * 2, 220)
  const startX = (totalWidth - contentWidth) / 2
  const baseY = marginTop + maxBarHeight

  return (
    <div className="w-full overflow-x-auto py-1">
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="w-full h-auto max-h-48 overflow-visible select-none"
        role="img"
        aria-label="Gráfico de materias aprobadas por año"
      >
        <title>Materias aprobadas por año</title>

        {/* Línea de base del eje X */}
        <line
          x1={Math.max(4, startX - 16)}
          y1={baseY}
          x2={Math.min(totalWidth - 4, startX + contentWidth + 16)}
          y2={baseY}
          stroke="#111111"
          strokeWidth="2"
        />

        {datos.map((d, index) => {
          const x = startX + index * (barWidth + barGap)
          const cant = Number(d.cantidad) || 0
          const barHeight = cant > 0 ? Math.max(Math.round((cant / maxCantidad) * maxBarHeight), 4) : 0
          const y = baseY - barHeight

          return (
            <g key={d.anio ?? index}>
              {/* Sombra offset risograph (detrás de la barra) */}
              {barHeight > 0 && (
                <rect
                  x={x + 2}
                  y={y + 2}
                  width={barWidth}
                  height={barHeight}
                  fill="#111111"
                />
              )}

              {/* Barra de color flat */}
              {barHeight > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="#ccff00"
                  stroke="#111111"
                  strokeWidth="2"
                />
              )}

              {/* Cantidad sobre la barra */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fill="#111111"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {cant}
              </text>

              {/* Año debajo de la barra como eje X */}
              <text
                x={x + barWidth / 2}
                y={baseY + 18}
                textAnchor="middle"
                fill="#111111"
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {d.anio}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
