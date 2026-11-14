'use client'

import React, { useState, useId, useMemo } from 'react'

export interface DonutSegment {
  name: string
  value: number
  color?: string
  gradientFrom?: string
  gradientTo?: string
}

export interface ThreeDDonutChartProps {
  data: DonutSegment[]
  centerLabel?: string
  centerValue?: string | number
  size?: number
  thickness?: number
  depth?: number
  valueFormatter?: (v: number) => string
  className?: string
  showLegend?: boolean
}

// Pre-defined modern 3D gradients matching the visual language
const DEFAULT_GRADIENTS = [
  { from: '#0d9488', to: '#14b8a6', depth: '#0f766e', ink: '#0f766e' }, // Teal
  { from: '#2563eb', to: '#60a5fa', depth: '#1d4ed8', ink: '#1d4ed8' }, // Blue
  { from: '#ea580c', to: '#fb923c', depth: '#c2410c', ink: '#c2410c' }, // Orange
  { from: '#dc2626', to: '#f87171', depth: '#b91c1c', ink: '#b91c1c' }, // Red
  { from: '#16a34a', to: '#4ade80', depth: '#15803d', ink: '#15803d' }, // Green
  { from: '#7c3aed', to: '#a78bfa', depth: '#6d28d9', ink: '#6d28d9' }, // Purple
]

export function ThreeDDonutChart({
  data,
  centerLabel = 'Total',
  centerValue,
  size = 240,
  thickness = 38,
  depth = 12,
  valueFormatter = (v) => v.toLocaleString(),
  className = '',
  showLegend = true,
}: ThreeDDonutChartProps) {
  const chartId = useId().replace(/:/g, '')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const total = useMemo(() => {
    return data.reduce((acc, d) => acc + (d.value || 0), 0)
  }, [data])

  // Convert slices to angles
  const slices = useMemo(() => {
    if (total === 0) return []
    let currentAngle = -Math.PI / 2 // start at top

    return data.map((item, index) => {
      const sliceAngle = (item.value / total) * (Math.PI * 2)
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle
      currentAngle = endAngle

      const grad = DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length]
      const fromColor = item.gradientFrom || item.color || grad.from
      const toColor = item.gradientTo || grad.to
      const depthColor = grad.depth
      const pct = Math.round((item.value / total) * 100)

      return {
        ...item,
        startAngle,
        endAngle,
        sliceAngle,
        fromColor,
        toColor,
        depthColor,
        pct,
      }
    })
  }, [data, total])

  // Geometry
  const cx = size / 2
  const cy = size / 2 - depth / 2
  const outerR = size * 0.42
  const innerR = outerR - thickness

  // Helper to calculate arc path
  function describeArc(
    centerX: number,
    centerY: number,
    start: number,
    end: number,
    rIn: number,
    rOut: number
  ) {
    // If nearly a full circle (e.g. single item = 100%)
    const isFullCircle = end - start >= Math.PI * 1.999
    const actualEnd = isFullCircle ? start + Math.PI * 1.999 : end

    const x1 = centerX + rOut * Math.cos(start)
    const y1 = centerY + rOut * Math.sin(start)
    const x2 = centerX + rOut * Math.cos(actualEnd)
    const y2 = centerY + rOut * Math.sin(actualEnd)

    const x3 = centerX + rIn * Math.cos(actualEnd)
    const y3 = centerY + rIn * Math.sin(actualEnd)
    const x4 = centerX + rIn * Math.cos(start)
    const y4 = centerY + rIn * Math.sin(start)

    const largeArc = actualEnd - start > Math.PI ? 1 : 0

    return [
      `M ${x1} ${y1}`,
      `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ')
  }

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null
  const displayTotal = centerValue !== undefined ? centerValue : total
  const displayLabel = activeSlice ? activeSlice.name : centerLabel

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 ${className}`}>
      {/* 3D Extruded Donut Canvas */}
      <div className="relative shrink-0 select-none" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          width={size}
          height={size}
          className="overflow-visible"
        >
          <defs>
            {/* Ambient Base Shadow */}
            <filter id={`donut-shadow-${chartId}`} x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.22" />
            </filter>

            {/* Specular Bevel Filter for soft 3D lighting */}
            <linearGradient id={`bevel-specular-${chartId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>

            {/* Gradients for each slice */}
            {slices.map((s, i) => (
              <React.Fragment key={i}>
                <linearGradient id={`slice-grad-${chartId}-${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={s.toColor} />
                  <stop offset="100%" stopColor={s.fromColor} />
                </linearGradient>
                <linearGradient id={`slice-depth-${chartId}-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.fromColor} />
                  <stop offset="100%" stopColor={s.depthColor} />
                </linearGradient>
              </React.Fragment>
            ))}
          </defs>

          {/* ── 3D Extruded Depth Layers (Bottom Wall of the Donut) ──────── */}
          <g filter={`url(#donut-shadow-${chartId})`}>
            {slices.map((slice, i) => {
              if (slice.value === 0) return null
              // Create lower depth arc by shifting Y down by depth
              const dPath = describeArc(cx, cy + depth, slice.startAngle, slice.endAngle, innerR, outerR)
              return (
                <path
                  key={`depth-${i}`}
                  d={dPath}
                  fill={`url(#slice-depth-${chartId}-${i})`}
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.6 : 1}
                  className="transition-all duration-200"
                />
              )
            })}

            {/* Side wall connector for realistic solid extrusion */}
            {slices.map((slice, i) => {
              if (slice.value === 0) return null
              // Render vertical extrusion band along the outer rim
              const arcSamples = 20
              const points: string[] = []
              for (let step = 0; step <= arcSamples; step++) {
                const angle = slice.startAngle + (slice.sliceAngle * step) / arcSamples
                const x = cx + outerR * Math.cos(angle)
                const y = cy + outerR * Math.sin(angle)
                points.push(`${x},${y}`)
              }
              for (let step = arcSamples; step >= 0; step--) {
                const angle = slice.startAngle + (slice.sliceAngle * step) / arcSamples
                const x = cx + outerR * Math.cos(angle)
                const y = cy + depth + outerR * Math.sin(angle)
                points.push(`${x},${y}`)
              }
              return (
                <polygon
                  key={`wall-${i}`}
                  points={points.join(' ')}
                  fill={slice.depthColor}
                  opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.6 : 0.95}
                  className="transition-all duration-200"
                />
              )
            })}

            {/* ── Top Face of the 3D Donut ────────────────────────────────── */}
            {slices.map((slice, i) => {
              if (slice.value === 0) return null
              const isHovered = hoveredIndex === i
              const topPath = describeArc(cx, cy, slice.startAngle, slice.endAngle, innerR, outerR)

              return (
                <g
                  key={`top-${i}`}
                  className="cursor-pointer transition-transform duration-200"
                  style={{
                    transformOrigin: `${cx}px ${cy}px`,
                    transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Base slice with vibrant gradient */}
                  <path
                    d={topPath}
                    fill={`url(#slice-grad-${chartId}-${i})`}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? '2' : '1.2'}
                    strokeOpacity={isHovered ? '0.9' : '0.5'}
                    className="transition-all duration-200"
                    opacity={hoveredIndex !== null && hoveredIndex !== i ? 0.7 : 1}
                  />

                  {/* Top Specular Rim Lighting */}
                  <path
                    d={topPath}
                    fill={`url(#bevel-specular-${chartId})`}
                    style={{ mixBlendMode: 'overlay' }}
                    pointerEvents="none"
                  />
                </g>
              )
            })}
          </g>

          {/* ── Central Circular Area ────────────────────────────────────── */}
          {/* Subtle 3D inner well gradient and clean circular white/light cutout */}
          <circle
            cx={cx}
            cy={cy}
            r={innerR - 1}
            fill="var(--dash-surface)"
            stroke="var(--dash-border)"
            strokeWidth="1.5"
            className="shadow-inner"
          />
        </svg>

        {/* Central Metric Value & Label (Overlay HTML for crisp text rendering) */}
        <div
          className="pointer-events-none absolute flex flex-col items-center justify-center text-center transition-all duration-200"
          style={{
            left: `${cx}px`,
            top: `${cy}px`,
            transform: 'translate(-50%, -50%)',
            width: `${innerR * 1.8}px`,
            height: `${innerR * 1.8}px`,
          }}
        >
          <span className="text-2xl font-black text-[var(--dash-heading)] tracking-tight leading-none sm:text-3xl">
            {activeSlice ? valueFormatter(activeSlice.value) : displayTotal}
          </span>
          <span className="mt-1 text-[11px] font-bold text-[var(--dash-muted)] uppercase tracking-wider truncate max-w-full px-2">
            {displayLabel}
          </span>
          {activeSlice && (
            <span className="text-[10px] font-black text-[var(--dash-accent)]">
              {activeSlice.pct}% share
            </span>
          )}
        </div>
      </div>

      {/* ── Interactive Category Legend Alongside Chart ─────────────────── */}
      {showLegend && (
        <div className="flex-1 w-full space-y-2 select-none">
          {slices.map((slice, i) => {
            const isHovered = hoveredIndex === i
            return (
              <div
                key={slice.name}
                className={`flex items-center justify-between gap-3 p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'border-[var(--dash-accent)] bg-[var(--dash-inset)] shadow-sm'
                    : 'border-transparent hover:bg-[var(--dash-inset)]'
                }`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* 3D pill badge indicator */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${slice.toColor}, ${slice.fromColor})`,
                      boxShadow: `0 2px 4px ${slice.depthColor}60`,
                      transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                    }}
                  />
                  <span className="text-sm font-bold text-[var(--dash-text)] capitalize truncate">
                    {slice.name}
                  </span>
                </div>

                {/* Values & Percentage */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-black text-[var(--dash-heading)]">
                    {valueFormatter(slice.value)}
                  </span>
                  <span className="text-xs font-bold text-[var(--dash-muted)] w-9 text-right">
                    {slice.pct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
