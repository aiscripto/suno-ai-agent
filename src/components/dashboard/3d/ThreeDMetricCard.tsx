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

const TONE_MAP: Record<string, {
  dot: string
  iconBg: string
  iconText: string
  iconBorder: string
  progress: string
  border: string
  glow: string
  textInk: string
}> = {
  blue: {
    dot: '#2563eb',
    iconBg: 'bg-gradient-to-br from-blue-50 to-blue-100',
    iconText: 'text-blue-700',
    iconBorder: 'border-blue-200/80',
    progress: 'linear-gradient(90deg, #2563eb, #60a5fa)',
    border: 'border-blue-200/70 hover:border-blue-400',
    glow: 'rgba(37, 99, 235, 0.12)',
    textInk: 'text-blue-900',
  },
  teal: {
    dot: '#0d9488',
    iconBg: 'bg-gradient-to-br from-teal-50 to-teal-100',
    iconText: 'text-teal-700',
    iconBorder: 'border-teal-200/80',
    progress: 'linear-gradient(90deg, #0d9488, #2dd4bf)',
    border: 'border-teal-200/70 hover:border-teal-400',
    glow: 'rgba(13, 148, 136, 0.12)',
    textInk: 'text-teal-900',
  },
  green: {
    dot: '#16a34a',
    iconBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    iconText: 'text-emerald-700',
    iconBorder: 'border-emerald-200/80',
    progress: 'linear-gradient(90deg, #16a34a, #4ade80)',
    border: 'border-emerald-200/70 hover:border-emerald-400',
    glow: 'rgba(22, 163, 74, 0.12)',
    textInk: 'text-emerald-900',
  },
  orange: {
    dot: '#ea580c',
    iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100',
    iconText: 'text-orange-700',
    iconBorder: 'border-orange-200/80',
    progress: 'linear-gradient(90deg, #ea580c, #fb923c)',
    border: 'border-orange-200/70 hover:border-orange-400',
    glow: 'rgba(234, 88, 12, 0.12)',
    textInk: 'text-orange-900',
  },
  red: {
    dot: '#dc2626',
    iconBg: 'bg-gradient-to-br from-red-50 to-red-100',
    iconText: 'text-red-700',
    iconBorder: 'border-red-200/80',
    progress: 'linear-gradient(90deg, #dc2626, #f87171)',
    border: 'border-red-200/70 hover:border-red-400',
    glow: 'rgba(220, 38, 38, 0.12)',
    textInk: 'text-red-900',
  },
  amber: {
    dot: '#d97706',
    iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100',
    iconText: 'text-amber-800',
    iconBorder: 'border-amber-200/80',
    progress: 'linear-gradient(90deg, #d97706, #fbbf24)',
    border: 'border-amber-200/70 hover:border-amber-400',
    glow: 'rgba(217, 119, 6, 0.12)',
    textInk: 'text-amber-900',
  },
  purple: {
    dot: '#6366f1',
    iconBg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    iconText: 'text-indigo-700',
    iconBorder: 'border-indigo-200/80',
    progress: 'linear-gradient(90deg, #6366f1, #a5b4fc)',
    border: 'border-indigo-200/70 hover:border-indigo-400',
    glow: 'rgba(99, 102, 241, 0.12)',
    textInk: 'text-indigo-900',
  },
  slate: {
    dot: '#64748b',
    iconBg: 'bg-gradient-to-br from-slate-50 to-slate-100',
    iconText: 'text-slate-700',
    iconBorder: 'border-slate-200/80',
    progress: 'linear-gradient(90deg, #64748b, #94a3b8)',
    border: 'border-slate-200/70 hover:border-slate-400',
    glow: 'rgba(100, 116, 139, 0.12)',
    textInk: 'text-slate-900',
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
  tone = 'amber',
  className = '',
  isNegative = false,
}: ThreeDMetricCardProps) {
  const currentTone = TONE_MAP[tone] || TONE_MAP.amber
  const activeDot = color || currentTone.dot

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 sm:p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${highlight
          ? 'border-amber-400/90 ring-4 ring-amber-100/80 shadow-md'
          : 'border-amber-200/60 dark:border-slate-700 hover:border-amber-400'
        } ${className}`}
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 253, 248, 0.98) 0%, rgba(255, 250, 240, 0.92) 50%, rgba(255, 255, 255, 0.98) 100%)',
        boxShadow: `0 10px 24px -5px ${currentTone.glow}, 0 4px 6px -2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)`,
      }}
    >
      {/* 3D Top Bevel Specular Sheen */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent pointer-events-none" />

      {/* Header: Badge Icon, Label, Dot & Info */}
      <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon ? (
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${currentTone.iconBorder} ${currentTone.iconBg} ${currentTone.iconText} text-xs font-black shadow-xs`}
              >
                {icon}
              </div>
            ) : (
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                style={{ background: activeDot, boxShadow: `0 0 6px ${activeDot}90` }}
              />
            )}
            <span className="text-[0.66rem] font-black uppercase tracking-[0.14em] text-amber-900/80 truncate">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className="h-2 w-2 rounded-full shadow-xs"
              style={{ background: activeDot, boxShadow: `0 0 5px ${activeDot}90` }}
            />
              {info && (
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-amber-800/60 hover:text-amber-900 cursor-help transition-colors"
                  title={info}
                >
                  ⓘ
                </div>
              )}
          </div>
        </div>

        {/* Main Metric Value (Warm 3D typography inspired by 3D.png) */}
        <div className="mt-2.5">
          <span
            className={`text-2xl font-black leading-none tracking-tight sm:text-3xl ${isNegative ? 'text-red-700' : 'text-amber-950 font-black'
              }`}
            style={{
              textShadow: '0 1px 1px rgba(0,0,0,0.04)',
            }}
          >
            {value}
          </span>
        </div>

        {/* 3D Micro Glowing Progress Bar (Like Total Accounts / Posted Vouchers) */}
        {progressPct !== undefined && (
          <div className="mt-2">
            <div className="relative h-1.5 w-full rounded-full bg-amber-100/70 overflow-hidden shadow-inner p-[0.5px]">
              <div
                className="relative h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, Math.max(progressPct, 4))}%`,
                  background: progressColor || currentTone.progress,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              >
                {/* Specular gloss highlight on the micro bar */}
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
        <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500 truncate">
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
}: ThreeDInsightCardProps) {
  const currentTone = TONE_MAP[tone] || TONE_MAP.blue

      return (
      <div
        className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-amber-200/60 hover:border-amber-400 ${className}`}
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 253, 248, 0.98) 0%, rgba(255, 250, 240, 0.92) 50%, rgba(255, 255, 255, 0.98) 100%)',
          boxShadow: `0 10px 24px -5px ${currentTone.glow}, 0 4px 6px -2px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.95)`,
        }}
      >
        {/* 3D Top Bevel Specular Sheen */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-200/70 to-transparent pointer-events-none" />

        {/* Header: Icon, Label with > arrow, Info */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon ? (
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border ${currentTone.iconBorder} ${currentTone.iconBg} ${currentTone.iconText} text-xs font-black shadow-xs`}
              >
                {icon}
              </div>
            ) : (
              <span
                className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                style={{ background: currentTone.dot, boxShadow: `0 0 6px ${currentTone.dot}90` }}
              />
            )}
            <span className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-amber-900/80 truncate">
              {label}
            </span>
            <span className="text-amber-700/60 font-bold text-xs">›</span>
          </div>

          {info && (
            <div
              className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-amber-800/60 hover:text-amber-900 cursor-help"
              title={info}
            >
              ⓘ
            </div>
          )}
        </div>

        {/* Main Metric Value */}
          <div className="mt-2.5">
            <span
              className="text-xl font-black leading-tight tracking-tight sm:text-2xl text-amber-950"
              style={{ textShadow: '0 1px 1px rgba(0,0,0,0.04)' }}
            >
              {value}
            </span>
          </div>

                {/* Micro 3D Progress Bar */}
                {progressPct !== undefined && (
                  <div className="mt-2">
                    <div className="relative h-1.5 w-full rounded-full bg-amber-100/70 overflow-hidden shadow-inner p-[0.5px]">
                      <div
                        className="relative h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, Math.max(progressPct, 4))}%`,
                          background: currentTone.progress,
                          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
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
              <p className="mt-2 text-xs font-semibold leading-5 text-slate-500 truncate">{detail}</p>
            </div>
          )
          }
