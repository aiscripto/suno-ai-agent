'use client'

import React, { useState } from 'react'

export interface HorizontalBarItem {
  id?: string
  label: string
  subLabel?: string
  value: number
  total?: number
  percentage?: number
  color?: string // 'blue' | 'teal' | 'orange' | 'red' | 'purple' | hex
  segments?: Array<{
    name: string
    value: number
    color: string
    ink?: string
  }>
  badge?: string
}

export interface ThreeDHorizontalBarProps {
  items: HorizontalBarItem[]
  maxValue?: number
  valueFormatter?: (v: number) => string
  unit?: string
  showPercentage?: boolean
  highlightTop?: boolean
  height?: number
  className?: string
  emptyMessage?: string
}

const COLOR_PRESETS: Record<string, { from: string; to: string; depth: string; specular: string }> = {
  blue: {
    from: '#1d4ed8',
    to: '#3b82f6',
    depth: '#1e3a8a',
    specular: 'rgba(147, 197, 253, 0.65)',
  },
  teal: {
    from: '#0f766e',
    to: '#14b8a6',
    depth: '#134e4a',
    specular: 'rgba(94, 234, 212, 0.65)',
  },
  orange: {
    from: '#c2410c',
    to: '#fb923c',
    depth: '#7c2d12',
    specular: 'rgba(253, 186, 116, 0.65)',
  },
  red: {
    from: '#b91c1c',
    to: '#f87171',
    depth: '#7f1d1d',
    specular: 'rgba(252, 165, 165, 0.65)',
  },
  purple: {
    from: '#6d28d9',
    to: '#a78bfa',
    depth: '#4c1d95',
    specular: 'rgba(216, 180, 254, 0.65)',
  },
  green: {
    from: '#15803d',
    to: '#4ade80',
    depth: '#14532d',
    specular: 'rgba(187, 247, 208, 0.65)',
  },
}

const DEFAULT_COLOR_ORDER = ['blue', 'teal', 'orange', 'purple', 'green', 'red']

export function ThreeDHorizontalBar({
  items,
  maxValue,
  valueFormatter = (v) => v.toLocaleString(),
  unit = '',
  showPercentage = true,
  highlightTop = true,
  height = 14,
  className = '',
  emptyMessage = 'No data available',
}: ThreeDHorizontalBarProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  if (!items || items.length === 0) {
    return (
      <div className={`py-6 text-center text-sm font-semibold text-[var(--dash-muted)] ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  // Calculate maximum value across items for percentage normalization
  const computedMax =
    maxValue !== undefined && maxValue > 0
      ? maxValue
      : Math.max(...items.map((it) => it.value), 1)

  const topIndex = highlightTop
    ? items.reduce((maxI, it, i) => (it.value > items[maxI].value ? i : maxI), 0)
    : -1

  return (
    <div className={`space-y-4 select-none ${className}`}>
      {items.map((item, index) => {
        const isHovered = hoveredIndex === index
        const isTop = index === topIndex && item.value > 0

        const pct = item.percentage !== undefined
          ? item.percentage
          : Math.min(100, Math.round((item.value / computedMax) * 100))

        const presetKey = item.color || DEFAULT_COLOR_ORDER[index % DEFAULT_COLOR_ORDER.length]
        const preset = COLOR_PRESETS[presetKey] || COLOR_PRESETS.blue

        return (
          <div
            key={item.id || item.label + index}
            className={`group rounded-xl p-2.5 transition-all duration-200 border ${
              isHovered
                ? 'border-[var(--dash-border)] bg-[var(--dash-inset)] shadow-sm'
                : 'border-transparent'
            }`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Header: Label on Left, Value + Pct on Right */}
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-[var(--dash-heading)] capitalize truncate">
                  {item.label}
                </span>
                {item.subLabel && (
                  <span className="text-[10px] font-semibold text-[var(--dash-muted)] truncate">
                    ({item.subLabel})
                  </span>
                )}
                {isTop && (
                  <span className="rounded-full bg-blue-500/10 text-blue-800 border border-blue-200 text-[9px] font-black px-1.5 py-0.2 uppercase tracking-wider">
                    Leading
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2 shrink-0">
                <span className="text-xs font-black text-[var(--dash-heading)]">
                  {valueFormatter(item.value)}
                  {unit && <span className="ml-0.5 font-normal text-[var(--dash-muted)]">{unit}</span>}
                </span>
                {showPercentage && (
                  <span className="text-[11px] font-bold text-[var(--dash-muted)] min-w-[32px] text-right">
                    {pct}%
                  </span>
                )}
              </div>
            </div>

            {/* ── 3D Cylindrical Bar Container ────────────────────────────── */}
            <div
              className="relative w-full rounded-full bg-[var(--dash-border)]/40 overflow-hidden shadow-inner p-[2px]"
              style={{ height: `${height + 4}px` }}
            >
              {/* Recessed Capsule Track Depth */}
              <div
                className="relative h-full w-full rounded-full overflow-hidden"
                style={{
                  background: 'var(--dash-inset)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.12)',
                }}
              >
                {/* Multi-segment mode OR Single 3D Bar */}
                {item.segments && item.segments.length > 0 ? (
                  <div className="flex h-full w-full rounded-full overflow-hidden">
                    {item.segments.map((seg, sIdx) => {
                      if (seg.value <= 0) return null
                      const segPct = item.value > 0 ? (seg.value / item.value) * 100 : 0
                      return (
                        <div
                          key={seg.name + sIdx}
                          className="relative h-full transition-all duration-300"
                          style={{
                            width: `${segPct}%`,
                            background: seg.color,
                          }}
                          title={`${seg.name}: ${seg.value}`}
                        >
                          {/* Specular gloss streak */}
                          <div
                            className="absolute inset-x-0 top-0 h-[45%] pointer-events-none"
                            style={{
                              background:
                                'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 80%, transparent 100%)',
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  /* Single 3D Cylindrical Extruded Bar */
                  <div
                    className="relative h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(pct, item.value > 0 ? 3 : 0)}%`,
                      background: `linear-gradient(90deg, ${preset.from} 0%, ${preset.to} 100%)`,
                      boxShadow: `0 2px 6px ${preset.depth}50, inset 0 -1px 2px ${preset.depth}`,
                    }}
                  >
                    {/* Longitudinal Specular Curved Highlight */}
                    <div
                      className="absolute inset-x-0 top-0 h-[45%] rounded-t-full pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 75%, transparent 100%)',
                      }}
                    />
                    {/* 3D Round Cap Light Bead on the leading edge */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 rounded-r-full pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, transparent 80%)',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sub-breakdown badges if segments exist */}
            {item.segments && item.segments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5 text-[10px] font-bold">
                {item.segments.map((seg) => (
                  <span
                    key={seg.name}
                    className="inline-flex items-center gap-1"
                    style={{ color: seg.ink || seg.color }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full inline-block"
                      style={{ background: seg.color }}
                    />
                    {seg.name} {seg.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

