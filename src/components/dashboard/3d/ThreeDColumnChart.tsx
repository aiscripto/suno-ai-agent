'use client'

import React, { useState, useId, useMemo } from 'react'

export interface ColumnDataPoint {
  label: string
  value: number
  subLabel?: string
  color?: string
  highlight?: boolean
}

export interface ThreeDColumnChartProps {
  data: ColumnDataPoint[]
  height?: number
  benchmarkValue?: number
  benchmarkLabel?: string
  valueFormatter?: (v: number) => string
  unit?: string
  primaryColor?: string
  showTrack?: boolean
  className?: string
  emptyMessage?: string
}

export function ThreeDColumnChart({
  data,
  height = 280,
  benchmarkValue,
  benchmarkLabel = 'Average',
  valueFormatter = (v) => v.toLocaleString(),
  unit = '',
  showTrack = true,
  className = '',
  emptyMessage = 'No data available',
}: ThreeDColumnChartProps) {
  const chartId = useId().replace(/:/g, '')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const { maxValue, computedBenchmark, highestIndex } = useMemo(() => {
    if (!data || data.length === 0) {
      return { maxValue: 0, computedBenchmark: 0, highestIndex: -1 }
    }
    const max = Math.max(...data.map((d) => d.value), 0)
    const sum = data.reduce((acc, d) => acc + d.value, 0)
    const avg = data.length > 0 ? sum / data.length : 0
    const bench = benchmarkValue !== undefined ? benchmarkValue : avg
    const effectiveMax = Math.max(max, bench * 1.15, 1)

    // Find the highest performing index
    let highest = 0
    data.forEach((d, i) => {
      if (d.value > (data[highest]?.value ?? 0)) highest = i
    })

    return { maxValue: effectiveMax, computedBenchmark: bench, highestIndex: highest }
  }, [data, benchmarkValue])

  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
        <div className="text-3xl mb-2 opacity-50">📊</div>
        <p className="text-sm font-semibold text-[var(--dash-muted)]">{emptyMessage}</p>
      </div>
    )
  }

  // Layout calculations
  const svgWidth = 600
  const svgHeight = height
  const padding = { top: 40, right: 30, bottom: 44, left: 52 }
  const plotWidth = svgWidth - padding.left - padding.right
  const plotHeight = svgHeight - padding.top - padding.bottom

  const columnWidth = Math.min(38, Math.max(22, (plotWidth / data.length) * 0.42))
  const trackWidth = columnWidth + 14
  const step = plotWidth / data.length

  // Generate 4-5 Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: Math.round(maxValue * pct),
    y: padding.top + plotHeight - plotHeight * pct,
  }))

  const benchmarkY =
    computedBenchmark > 0
      ? padding.top + plotHeight - (Math.min(computedBenchmark, maxValue) / maxValue) * plotHeight
      : null

  return (
    <div className={`relative w-full select-none ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        style={{ minHeight: `${height}px` }}
      >
        <defs>
          {/* Subtle Ambient Drop Shadow for 3D Columns */}
          <filter id={`shadow-${chartId}`} x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.22" />
          </filter>

          {/* Soft base shadow for the cylinder ground reflection */}
          <radialGradient id={`base-shadow-${chartId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          {/* Translucent Track Gradient (Recessed Capsule) */}
          <linearGradient id={`track-grad-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--dash-muted)" stopOpacity="0.08" />
            <stop offset="50%" stopColor="var(--dash-muted)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--dash-muted)" stopOpacity="0.08" />
          </linearGradient>

          {/* Primary Blue 3D Cylinder Gradients */}
          <linearGradient id={`bar-blue-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="25%" stopColor="#2563eb" />
            <stop offset="60%" stopColor="#3b82f6" />
            <stop offset="90%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id={`cap-blue-${chartId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>

          {/* Teal 3D Cylinder Gradients */}
          <linearGradient id={`bar-teal-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0f766e" />
            <stop offset="25%" stopColor="#0d9488" />
            <stop offset="60%" stopColor="#14b8a6" />
            <stop offset="90%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#115e59" />
          </linearGradient>
          <linearGradient id={`cap-teal-${chartId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#5eead4" />
          </linearGradient>

          {/* Orange/Amber 3D Cylinder Gradients */}
          <linearGradient id={`bar-orange-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c2410c" />
            <stop offset="25%" stopColor="#ea580c" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="90%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#9a3412" />
          </linearGradient>
          <linearGradient id={`cap-orange-${chartId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          {/* Red 3D Cylinder Gradients */}
          <linearGradient id={`bar-red-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="25%" stopColor="#dc2626" />
            <stop offset="60%" stopColor="#ef4444" />
            <stop offset="90%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id={`cap-red-${chartId}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>

          {/* Specular Left Flank Reflection (Simulates 3D curved gloss) */}
          <linearGradient id={`specular-${chartId}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── Background Grid & Y-Axis ───────────────────────────────────── */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={svgWidth - padding.right}
              y2={tick.y}
              stroke="var(--dash-border)"
              strokeOpacity="0.6"
              strokeDasharray={i === 0 ? undefined : '3 3'}
              strokeWidth="1"
            />
            <text
              x={padding.left - 10}
              y={tick.y + 3.5}
              textAnchor="end"
              className="text-[10px] font-semibold fill-[var(--dash-muted)]"
            >
              {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(0)}k` : tick.value}
            </text>
          </g>
        ))}

        {/* ── Benchmark / Average Line ──────────────────────────────────── */}
        {benchmarkY !== null && (
          <g>
            <line
              x1={padding.left}
              y1={benchmarkY}
              x2={svgWidth - padding.right}
              y2={benchmarkY}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth="1.5"
              strokeOpacity="0.85"
            />
            <text
              x={svgWidth - padding.right}
              y={benchmarkY - 6}
              textAnchor="end"
              className="text-[10px] font-black fill-[#ef4444]"
            >
              {benchmarkLabel}: {valueFormatter(Math.round(computedBenchmark))}
            </text>
          </g>
        )}

        {/* ── Columns & Tracks ─────────────────────────────────────────── */}
        {data.map((d, index) => {
          const centerX = padding.left + index * step + step / 2
          const colX = centerX - columnWidth / 2
          const trackX = centerX - trackWidth / 2

          const valueRatio = maxValue > 0 ? Math.min(d.value / maxValue, 1) : 0
          const barHeight = Math.max(valueRatio * plotHeight, 6)
          const barY = padding.top + plotHeight - barHeight
          const capHeight = Math.min(columnWidth * 0.28, 8)

          // Palette selection
          let barFill = `url(#bar-blue-${chartId})`
          let capFill = `url(#cap-blue-${chartId})`
          if (d.color === 'teal' || d.color === '#0d9488' || d.color === '#14b8a6') {
            barFill = `url(#bar-teal-${chartId})`
            capFill = `url(#cap-teal-${chartId})`
          } else if (d.color === 'orange' || d.color === '#f97316' || d.color === '#ea580c') {
            barFill = `url(#bar-orange-${chartId})`
            capFill = `url(#cap-orange-${chartId})`
          } else if (d.color === 'red' || d.color === '#dc2626' || d.color === '#ef4444') {
            barFill = `url(#bar-red-${chartId})`
            capFill = `url(#cap-red-${chartId})`
          }

          const isHovered = hoveredIndex === index
          const isHighest = index === highestIndex && d.value > 0

          return (
            <g
              key={d.label + index}
              className="cursor-pointer transition-transform duration-200"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Recessed Capsule Track (Behind column) */}
              {showTrack && (
                <rect
                  x={trackX}
                  y={padding.top}
                  width={trackWidth}
                  height={plotHeight}
                  rx={trackWidth / 2}
                  fill={`url(#track-grad-${chartId})`}
                  className="transition-opacity duration-200"
                  opacity={isHovered ? 0.9 : 0.6}
                />
              )}

              {/* Base Drop Shadow */}
              {d.value > 0 && (
                <ellipse
                  cx={centerX}
                  cy={padding.top + plotHeight + 2}
                  rx={columnWidth * 0.65}
                  ry={capHeight * 0.5}
                  fill={`url(#base-shadow-${chartId})`}
                />
              )}

              {/* 3D Cylindrical Column Body */}
              {d.value > 0 && (
                <g filter={`url(#shadow-${chartId})`}>
                  {/* Column Body Rectangle with rounded bottom */}
                  <rect
                    x={colX}
                    y={barY}
                    width={columnWidth}
                    height={barHeight}
                    rx={columnWidth * 0.2}
                    fill={barFill}
                    className="transition-all duration-300"
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${centerX}px ${padding.top + plotHeight}px`,
                    }}
                  />

                  {/* Left Specular Gloss Line (Curved cylinder sheen) */}
                  <rect
                    x={colX + 2}
                    y={barY + capHeight / 2}
                    width={columnWidth * 0.32}
                    height={Math.max(barHeight - capHeight, 2)}
                    rx={2}
                    fill={`url(#specular-${chartId})`}
                    pointerEvents="none"
                  />

                  {/* Top 3D Elliptical Cap */}
                  <ellipse
                    cx={centerX}
                    cy={barY}
                    rx={columnWidth / 2}
                    ry={capHeight / 2}
                    fill={capFill}
                    stroke="#ffffff"
                    strokeWidth="0.8"
                    strokeOpacity="0.5"
                    className="transition-all duration-300"
                    style={{
                      transform: isHovered ? 'scale(1.03)' : 'scale(1)',
                      transformOrigin: `${centerX}px ${padding.top + plotHeight}px`,
                    }}
                  />
                </g>
              )}

              {/* Floating Pill Badge (Highest Column or Hovered) */}
              {(isHighest || isHovered) && d.value > 0 && (
                <g
                  className="transition-all duration-200"
                  style={{
                    transform: `translate(${centerX}px, ${barY - 14}px)`,
                  }}
                >
                  <rect
                    x="-26"
                    y="-13"
                    width="52"
                    height="20"
                    rx="10"
                    fill="#0f172a"
                    stroke="#3b82f6"
                    strokeWidth="1.2"
                    className="shadow-lg"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-black fill-white tracking-wider"
                  >
                    {d.value >= 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                  </text>
                </g>
              )}

              {/* X-Axis Month / Category Label */}
              <text
                x={centerX}
                y={padding.top + plotHeight + 22}
                textAnchor="middle"
                className={`text-[11px] transition-colors duration-150 ${
                  isHovered || isHighest
                    ? 'font-black fill-[var(--dash-heading)]'
                    : 'font-semibold fill-[var(--dash-muted)]'
                }`}
              >
                {d.label}
              </text>
              {d.subLabel && (
                <text
                  x={centerX}
                  y={padding.top + plotHeight + 35}
                  textAnchor="middle"
                  className="text-[9px] font-medium fill-[var(--dash-subtle)]"
                >
                  {d.subLabel}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Floating Detailed Tooltip on Hover */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="pointer-events-none absolute z-20 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 shadow-xl backdrop-blur-md transition-all duration-150"
          style={{
            left: `${((padding.left + hoveredIndex * step + step / 2) / svgWidth) * 100}%`,
            top: '8px',
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[11px] font-black uppercase tracking-wider text-[var(--dash-muted)]">
            {data[hoveredIndex].label}
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-black text-[var(--dash-heading)]">
              {valueFormatter(data[hoveredIndex].value)}
            </span>
            {unit && <span className="text-xs font-semibold text-[var(--dash-muted)]">{unit}</span>}
          </div>
          {computedBenchmark > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-[var(--dash-muted)]">
              {data[hoveredIndex].value >= computedBenchmark ? (
                <span className="text-emerald-700 font-bold">
                  +{(
                    ((data[hoveredIndex].value - computedBenchmark) / computedBenchmark) *
                    100
                  ).toFixed(0)}
                  % vs average
                </span>
              ) : (
                <span className="text-amber-700 font-bold">
                  {(
                    ((data[hoveredIndex].value - computedBenchmark) / computedBenchmark) *
                    100
                  ).toFixed(0)}
                  % vs average
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
