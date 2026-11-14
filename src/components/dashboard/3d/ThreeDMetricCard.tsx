'use client'

import React from 'react'

export interface ThreeDMetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  color?: string
  progressPct?: number
  progressColor?: string
  info?: string
  highlight?: boolean
  tone?: 'blue' | 'teal' | 'orange' | 'red' | 'amber' | 'slate' | 'green' | 'purple'
  className?: string
  isNegative?: boolean
}

const TONE_TOKENS: Record<string, {
  dot: string
  iconBg: string
  iconBorder: string
  progress: string
  glow: string
  badgeText: string
}> = {
  blue: {
    dot: '#2563eb',
    iconBg: 'bg-blue-500/15',
    iconBorder: 'border-blue-400/40',
    progress: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 100%)',
    glow: 'rgba(37, 99, 235, 0.16)',
    badgeText: 'text-blue-600',
  },
  teal: {
    dot: '#0d9488',
    iconBg: 'bg-teal-500/15',
    iconBorder: 'border-teal-400/40',
    progress: 'linear-gradient(90deg, #0f766e 0%, #14b8a6 100%)',
    glow: 'rgba(13, 148, 136, 0.16)',
    badgeText: 'text-teal-600',
  },
  green: {
    dot: '#16a34a',
    iconBg: 'bg-emerald-500/15',
    iconBorder: 'border-emerald-400/40',
    progress: 'linear-gradient(90deg, #15803d 0%, #22c55e 100%)',
    glow: 'rgba(22, 163, 74, 0.16)',
    badgeText: 'text-emerald-600',
  },
  orange: {
    dot: '#ea580c',
    iconBg: 'bg-orange-500/15',
    iconBorder: 'border-orange-400/40',
    progress: 'linear-gradient(90deg, #c2410c 0%, #f97316 100%)',
    glow: 'rgba(234, 88, 12, 0.16)',
    badgeText: 'text-orange-600',
  },
  red: {
    dot: '#dc2626',
    iconBg: 'bg-red-500/15',
    iconBorder: 'border-red-400/40',
    progress: 'linear-gradient(90deg, #b91c1c 0%, #ef4444 100%)',
    glow: 'rgba(220, 38, 38, 0.16)',
    badgeText: 'text-red-600',
  },
  amber: {
    dot: '#d97706',
    iconBg: 'bg-amber-500/15',
    iconBorder: 'border-amber-400/40',
    progress: 'linear-gradient(90deg, #b45309 0%, #f59e0b 100%)',
    glow: 'rgba(217, 119, 6, 0.16)',
    badgeText: 'text-amber-600',
  },
  purple: {
    dot: '#6366f1',
    iconBg: 'bg-indigo-500/15',
    iconBorder: 'border-indigo-400/40',
    progress: 'linear-gradient(90deg, #4f46e5 0%, #818cf8 100%)',
    glow: 'rgba(99, 102, 241, 0.16)',
    badgeText: 'text-indigo-600',
  },
  slate: {
    dot: '#64748b',
    iconBg: 'bg-slate-500/15',
    iconBorder: 'border-slate-400/40',
    progress: 'linear-gradient(90deg, #475569 0%, #94a3b8 100%)',
    glow: 'rgba(100, 116, 139, 0.16)',
    badgeText: 'text-slate-600',
  },
}

export function ThreeDMetricCard({
  label,
  value,
  sub,
  icon,
  color,
  progressPct,
  progressColor,
  info,
  highlight = false,
  tone = 'blue',
  className = '',
  isNegative = false,
}: ThreeDMetricCardProps) {
  const currentTone = TONE_TOKENS[tone] || TONE_TOKENS.blue
  const activeDot = color || currentTone.dot

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? 'border-[var(--dash-accent)] ring-4 ring-[var(--dash-ring)] shadow-md'
          : 'hover:border-[var(--dash-accent)]/50'
      } ${className}`}
      style={{
        boxShadow: `0 10px 25px -5px var(--dash-shadow), 0 4px 6px -2px var(--dash-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
      }}
    >
      {/* 3D Top Bevel Specular Sheen */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {/* Header: Badge Icon, Label, Dot & Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${currentTone.iconBorder} ${currentTone.iconBg} ${currentTone.badgeText} text-xs font-black shadow-xs`}
            >
              {icon}
            </div>
          ) : (
            <span
              className="h-2 w-2 rounded-full shrink-0 shadow-sm"
              style={{ background: activeDot, boxShadow: `0 0 6px ${activeDot}90` }}
            />
          )}
          <span className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-[var(--dash-muted)] truncate">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="h-2 w-2 rounded-full shadow-xs transition-transform duration-200 group-hover:scale-125"
            style={{ background: activeDot, boxShadow: `0 0 6px ${activeDot}90` }}
          />
          {info && (
            <div
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-[var(--dash-muted)] opacity-60 hover:opacity-100 cursor-help transition-opacity"
              title={info}
            >
              ⓘ
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <span
          className={`text-2xl font-black leading-none tracking-tight sm:text-3xl ${
            isNegative ? 'text-red-700 font-extrabold' : 'text-[var(--dash-heading)]'
          }`}
        >
          {value}
        </span>
      </div>

      {/* 3D Micro Progress Bar */}
      {progressPct !== undefined && (
        <div className="mt-2.5">
          <div className="relative h-1.5 w-full rounded-full bg-[var(--dash-border)]/50 overflow-hidden shadow-inner p-[0.5px]">
            <div
              className="relative h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(progressPct, 4))}%`,
                background: progressColor || currentTone.progress,
                boxShadow: `0 1px 3px ${currentTone.glow}`,
              }}
            >
              {/* Specular curved highlight on micro bar */}
              <div
                className="absolute inset-x-0 top-0 h-[50%] pointer-events-none rounded-t-full"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtext */}
      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-[var(--dash-muted)] truncate">
        <span>{sub || 'Current dataset'}</span>
      </div>
    </div>
  )
}

export interface ThreeDInsightCardProps {
  label: string
  value: string | number
  detail: string
  icon?: React.ReactNode
  tone?: 'blue' | 'teal' | 'orange' | 'red' | 'amber' | 'green' | 'slate'
  progressPct?: number
  info?: string
  className?: string
  coloredValue?: boolean
}

export function ThreeDInsightCard({
  label,
  value,
  detail,
  icon,
  tone = 'blue',
  progressPct,
  info,
  className = '',
  coloredValue = true,
}: ThreeDInsightCardProps) {
  const currentTone = TONE_TOKENS[tone] || TONE_TOKENS.blue

  const valueStyle: React.CSSProperties = coloredValue
    ? {
        color:
          tone === 'red'
            ? 'var(--dash-ink-complaint)'
            : tone === 'amber' || tone === 'orange'
              ? 'var(--dash-ink-negative)'
              : tone === 'blue'
                ? 'var(--dash-accent)'
                : tone === 'green' || tone === 'teal'
                  ? 'var(--dash-ink-positive)'
                  : 'var(--dash-heading)',
      }
    : {}

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[var(--dash-accent)]/50 ${className}`}
      style={{
        boxShadow: `0 10px 25px -5px var(--dash-shadow), 0 4px 6px -2px var(--dash-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.4)`,
      }}
    >
      {/* 3D Top Bevel Specular Sheen */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {/* Header: Icon, Label with > arrow, Info */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon ? (
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${currentTone.iconBorder} ${currentTone.iconBg} ${currentTone.badgeText} text-xs font-black shadow-xs`}
            >
              {icon}
            </div>
          ) : (
            <span
              className="h-2 w-2 rounded-full shrink-0 shadow-sm"
              style={{ background: currentTone.dot, boxShadow: `0 0 6px ${currentTone.dot}90` }}
            />
          )}
          <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[var(--dash-muted)] truncate">
            {label}
          </span>
          <span className="text-[var(--dash-accent)] font-bold text-xs">›</span>
        </div>

        {info && (
          <div
            className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-[var(--dash-muted)] opacity-60 hover:opacity-100 cursor-help transition-opacity"
            title={info}
          >
            ⓘ
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="mt-3">
        <span
          className="text-xl font-black leading-tight tracking-tight sm:text-2xl text-[var(--dash-heading)]"
          style={valueStyle}
        >
          {value}
        </span>
      </div>

      {/* Micro 3D Progress Bar */}
      {progressPct !== undefined && (
        <div className="mt-2.5">
          <div className="relative h-1.5 w-full rounded-full bg-[var(--dash-border)]/50 overflow-hidden shadow-inner p-[0.5px]">
            <div
              className="relative h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(progressPct, 4))}%`,
                background: currentTone.progress,
                boxShadow: `0 1px 3px ${currentTone.glow}`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-[50%] pointer-events-none rounded-t-full"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(255,255,255,0.7) 0%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Detail explanation */}
      <p className="mt-2 text-xs font-semibold leading-5 text-[var(--dash-muted)] truncate">{detail}</p>
    </div>
  )
}
