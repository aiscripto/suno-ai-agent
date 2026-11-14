'use client'

import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import type { DashboardData } from '@/lib/db/dashboard-query'
import type { AppSession } from '@/lib/auth/session'
import { PROVINCES, CITIES_BY_PROVINCE } from '@/data/pakistan-locations'
import { ReportsTab } from '@/components/dashboard/reports/ReportsTab'
import { useModalA11y } from '@/hooks/use-modal-a11y'
import {
  ThreeDColumnChart,
  ThreeDDonutChart,
  ThreeDHorizontalBar,
  ThreeDMetricCard,
  ThreeDInsightCard,
} from '@/components/dashboard/3d'

// ── Emoji maps ─────────────────────────────────────────────────────────────────
const SENTIMENT_EMOJI: Record<string, string> = {
  positive: '✅',
  negative: '⚠️',
  complaint: '🚨',
  suggestion: '💡',
}
const SENTIMENT_LABEL: Record<string, string> = {
  positive: 'Positive',
  negative: 'Negative',
  complaint: 'Complaint',
  suggestion: 'Suggestion',
}
const SENTIMENT_COLOR: Record<string, string> = {
  positive: '#22c55e',
  negative: '#f97316',
  complaint: '#ef4444',
  suggestion: '#6366f1',
}
// Bright SENTIMENT_COLOR is for bars and dots only. Text uses these per-theme
// ink tokens, which pass WCAG AA on light and dark dashboard surfaces.
const SENTIMENT_INK: Record<string, string> = {
  positive: 'var(--dash-ink-positive)',
  negative: 'var(--dash-ink-negative)',
  complaint: 'var(--dash-ink-complaint)',
  suggestion: 'var(--dash-ink-suggestion)',
}
const CATEGORY_EMOJI: Record<string, string> = {
  product: '🍽️',
  service: '⚡',
  behavioral: '👤',
  facility: '🏢',
  pricing: '💰',
  general: '⭐',
}
const RATING_EMOJI: Record<number, string> = {
  5: '🌟', 4: '✨', 3: '😐', 2: '😞', 1: '😡',
}
// ── Display helpers ────────────────────────────────────────────────────────────
// Strip default sentinel values stored when the customer didn't share details.
const UNKNOWN_NAME = 'Unknown'
const UNKNOWN_EMAIL = 'unknown@email.com'
function fmtContact(v: string | null | undefined): string | null {
  if (!v || v === 'null' || v === UNKNOWN_NAME || v === UNKNOWN_EMAIL) return null
  return v
}
function fmtText(v: string | null | undefined, fallback = '—'): string {
  return v?.trim() || fallback
}
function fmtDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date} · ${time}`
}
function fmtDateTimeShort(dateStr: string): string {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${date}, ${time}`
}

// ── Search types ───────────────────────────────────────────────────────────────
interface SearchSource {
  id: string; shop: string; sentiment: string | null; category: string | null
  subcategory: string | null; rating: number | null; summary: string | null
  keyPoints: string[]; customer: { name: string | null; phone: string | null } | null
  createdAt: string
}
interface SearchResult { answer: string; sources: SearchSource[] }

// ── Palette ────────────────────────────────────────────────────────────────────
const CHART_GRID = '#e5eaf2'
const CHART_TICK = '#64748b'

const surfaceCls = 'bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-[0_18px_50px_var(--dash-shadow)]'
const insetCls = 'bg-[var(--dash-inset)] border border-[var(--dash-border)]'
const inputCls = 'w-full bg-[var(--dash-input)] border border-[var(--dash-input-border)] rounded-lg px-4 py-2.5 text-sm text-[var(--dash-text)] placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[var(--dash-ring)] focus:border-[var(--dash-accent)] transition-colors'

type DashboardThemeKey = 'light' | 'day' | 'dark' | 'night'

const DASHBOARD_THEMES: Record<DashboardThemeKey, {
  name: string
  bgClass: string
  accent: string
  accentDark: string
  accentSoft: string
  mode: 'light' | 'dark'
  vars: CSSProperties
  statPanel: string
  tabHover: string
  positivePanel: string
  queuePanel: string
}> = {
  light: {
    name: 'Light',
    bgClass: 'bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.10),transparent_28rem),linear-gradient(135deg,#f8fafc_0%,#eef4ff_48%,#ffffff_100%)]',
    accent: '#1d4ed8',
    accentDark: '#0f172a',
    accentSoft: '#dbeafe',
    mode: 'light',
    vars: {
      '--dash-surface': 'rgb(255 255 255 / 0.96)',
      '--dash-inset': 'rgb(248 250 252 / 0.92)',
      '--dash-input': '#ffffff',
      '--dash-input-border': '#cbd5e1',
      '--dash-border': '#dbe3ee',
      '--dash-heading': '#0f172a',
      '--dash-text': '#334155',
      '--dash-muted': '#64748b',
      '--dash-subtle': '#64748b',
      '--dash-shadow': 'rgb(15 23 42 / 0.08)',
      '--dash-ring': 'rgb(219 234 254 / 0.9)',
      '--dash-accent': '#1d4ed8',
      '--dash-ink-positive': '#15803d',
      '--dash-ink-negative': '#c2410c',
      '--dash-ink-complaint': '#b91c1c',
      '--dash-ink-suggestion': '#4f46e5',
      '--dash-ink-rating': '#b45309',
      '--dash-ink-info': '#1d4ed8',
    } as CSSProperties,
    statPanel: 'bg-blue-50 text-blue-900 border-blue-100',
    tabHover: 'hover:border-blue-300 hover:text-blue-700',
    positivePanel: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    queuePanel: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  day: {
    name: 'Day',
    bgClass: 'bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.16),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.13),transparent_30rem),linear-gradient(135deg,#eff9fb_0%,#f8fbff_48%,#edf7ff_100%)]',
    accent: '#0e7490',
    accentDark: '#164e63',
    accentSoft: '#cffafe',
    mode: 'light',
    vars: {
      '--dash-surface': 'rgb(255 255 255 / 0.94)',
      '--dash-inset': 'rgb(236 254 255 / 0.58)',
      '--dash-input': '#ffffff',
      '--dash-input-border': '#bae6fd',
      '--dash-border': '#c7e6ef',
      '--dash-heading': '#0c2630',
      '--dash-text': '#274653',
      '--dash-muted': '#5d7782',
      '--dash-subtle': '#557080',
      '--dash-shadow': 'rgb(8 47 73 / 0.09)',
      '--dash-ring': 'rgb(207 250 254 / 0.9)',
      '--dash-accent': '#0e7490',
      '--dash-ink-positive': '#15803d',
      '--dash-ink-negative': '#c2410c',
      '--dash-ink-complaint': '#b91c1c',
      '--dash-ink-suggestion': '#4f46e5',
      '--dash-ink-rating': '#b45309',
      '--dash-ink-info': '#1d4ed8',
    } as CSSProperties,
    statPanel: 'bg-cyan-50 text-cyan-900 border-cyan-100',
    tabHover: 'hover:border-cyan-300 hover:text-cyan-700',
    positivePanel: 'border-cyan-200 bg-cyan-50 text-cyan-700',
    queuePanel: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  dark: {
    name: 'Dark',
    bgClass: 'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_31rem),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_30rem),linear-gradient(135deg,#101827_0%,#172033_50%,#0f172a_100%)]',
    accent: '#60a5fa',
    accentDark: '#2563eb',
    accentSoft: '#1e3a8a',
    mode: 'dark',
    vars: {
      '--dash-surface': 'rgb(23 32 51 / 0.92)',
      '--dash-inset': 'rgb(15 23 42 / 0.66)',
      '--dash-input': 'rgb(15 23 42 / 0.9)',
      '--dash-input-border': 'rgb(71 85 105 / 0.9)',
      '--dash-border': 'rgb(71 85 105 / 0.62)',
      '--dash-heading': '#f8fafc',
      '--dash-text': '#dbeafe',
      '--dash-muted': '#a9bbd2',
      '--dash-subtle': '#9fb0c6',
      '--dash-shadow': 'rgb(0 0 0 / 0.28)',
      '--dash-ring': 'rgb(96 165 250 / 0.22)',
      '--dash-accent': '#60a5fa',
      '--dash-ink-positive': '#86efac',
      '--dash-ink-negative': '#fdba74',
      '--dash-ink-complaint': '#fca5a5',
      '--dash-ink-suggestion': '#a5b4fc',
      '--dash-ink-rating': '#fcd34d',
      '--dash-ink-info': '#93c5fd',
    } as CSSProperties,
    statPanel: 'bg-slate-800/80 text-slate-100 border-slate-700',
    tabHover: 'hover:border-blue-300 hover:text-blue-200',
    positivePanel: 'border-emerald-500/30 bg-emerald-500/12 text-emerald-200',
    queuePanel: 'border-amber-500/30 bg-amber-500/12 text-amber-200',
  },
  night: {
    name: 'Night',
    bgClass: 'bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.20),transparent_30rem),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.10),transparent_29rem),linear-gradient(135deg,#030712_0%,#0b1020_46%,#111827_100%)]',
    accent: '#a78bfa',
    accentDark: '#4c1d95',
    accentSoft: '#312e81',
    mode: 'dark',
    vars: {
      '--dash-surface': 'rgb(12 18 32 / 0.94)',
      '--dash-inset': 'rgb(17 24 39 / 0.72)',
      '--dash-input': 'rgb(3 7 18 / 0.94)',
      '--dash-input-border': 'rgb(75 85 99 / 0.82)',
      '--dash-border': 'rgb(75 85 99 / 0.58)',
      '--dash-heading': '#f9fafb',
      '--dash-text': '#e5e7eb',
      '--dash-muted': '#b7c0cf',
      '--dash-subtle': '#a3adbf',
      '--dash-shadow': 'rgb(0 0 0 / 0.36)',
      '--dash-ring': 'rgb(167 139 250 / 0.24)',
      '--dash-accent': '#a78bfa',
      '--dash-ink-positive': '#86efac',
      '--dash-ink-negative': '#fdba74',
      '--dash-ink-complaint': '#fca5a5',
      '--dash-ink-suggestion': '#a5b4fc',
      '--dash-ink-rating': '#fcd34d',
      '--dash-ink-info': '#93c5fd',
    } as CSSProperties,
    statPanel: 'bg-violet-500/10 text-violet-100 border-violet-400/25',
    tabHover: 'hover:border-violet-300 hover:text-violet-200',
    positivePanel: 'border-teal-400/25 bg-teal-400/10 text-teal-100',
    queuePanel: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-100',
  },
}

// ── Shared UI primitives ───────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 sm:p-6 transition-all duration-300 hover:shadow-xl ${className}`}
      style={{
        boxShadow:
          '0 12px 30px -8px var(--dash-shadow), 0 4px 8px -2px var(--dash-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      }}
    >
      {/* 3D Top Specular Highlight Edge */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
      {children}
    </div>
  )
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-[0.68rem] font-black text-[var(--dash-muted)] uppercase tracking-[0.16em] flex items-center gap-2">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--dash-accent)] shadow-xs inline-block" />
      {children}
    </h2>
  )
}

function ThemeSelector({
  selected,
  onSelect,
}: {
  selected: DashboardThemeKey
  onSelect: (theme: DashboardThemeKey) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      {(Object.entries(DASHBOARD_THEMES) as Array<[DashboardThemeKey, typeof DASHBOARD_THEMES[DashboardThemeKey]]>).map(([key, theme]) => {
        const active = selected === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={active}
            className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black transition-colors ${active ? 'text-white border-transparent shadow-sm' : 'bg-[var(--dash-input)] text-[var(--dash-text)] border-[var(--dash-border)] hover:border-slate-400'
              }`}
            style={active ? { background: theme.accentDark } : undefined}
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
            {theme.name}
          </button>
        )
      })}
    </div>
  )
}

// ── Rating Bar ─────────────────────────────────────────────────────────────────
function RatingBar({ rating, count, max }: { rating: number; count: number; max: number }) {
  const pct = max ? Math.round((count / max) * 100) : 0
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const color = colors[rating] || '#2563eb'
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs font-black text-[var(--dash-muted)] w-14 flex items-center gap-1">
        <span>{rating}</span>
        <span className="text-amber-400 text-[11px]">★</span>
        <span className="text-[10px] font-normal">star</span>
      </span>
      <div className="relative flex-1 bg-[var(--dash-border)]/50 rounded-full h-3 overflow-hidden shadow-inner p-[1px]">
        <div className="relative h-full w-full rounded-full overflow-hidden bg-[var(--dash-inset)]">
          <div
            className="relative h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}, ${color}ee)`,
              boxShadow: `0 1px 4px ${color}60`,
            }}
          >
            {/* 3D Specular curved highlight */}
            <div
              className="absolute inset-x-0 top-0 h-[45%] pointer-events-none rounded-t-full"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.15) 80%, transparent 100%)',
              }}
            />
          </div>
        </div>
      </div>
      <span className="text-xs font-black text-[var(--dash-heading)] w-8 text-right">{count}</span>
      <span className="text-[10px] font-semibold text-[var(--dash-muted)] w-8 text-right">{pct}%</span>
    </div>
  )
}

// ── Shop Performance Card ──────────────────────────────────────────────────────
function ShopCard({ shop, rank }: {
  shop: DashboardData['shops'][0]; rank: number
}) {
  const scoreColor = !shop.satisfaction ? 'var(--dash-muted)'
    : shop.satisfaction >= 70 ? 'var(--dash-ink-positive)'
      : shop.satisfaction >= 45 ? 'var(--dash-ink-rating)'
        : 'var(--dash-ink-complaint)'

  return (
    <div
      className={`${surfaceCls} relative rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg overflow-hidden`}
      style={{
        boxShadow:
          '0 10px 25px -5px var(--dash-shadow), inset 0 1px 0 rgba(255,255,255,0.4)',
      }}
    >
      {/* Top 3D highlight edge */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="grid h-7 w-7 place-items-center rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-xs font-black text-white shadow-md border border-slate-700/50"
              style={{ boxShadow: '0 2px 6px rgba(15,23,42,0.35)' }}
            >
              #{rank}
            </span>
            <span className="text-base font-black text-[var(--dash-heading)] break-words">{shop.name}</span>
          </div>
          {shop.city && <p className="text-xs font-semibold text-[var(--dash-muted)] mt-1 ml-9">{shop.city}</p>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-black tracking-tight" style={{ color: scoreColor }}>
            {shop.satisfaction !== null ? `${shop.satisfaction}%` : '—'}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[var(--dash-muted)]">Satisfaction</div>
        </div>
      </div>

      {/* Sentiment split */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Positive', count: shop.positive, color: SENTIMENT_COLOR.positive, ink: SENTIMENT_INK.positive },
          { label: 'Negative', count: shop.negative, color: SENTIMENT_COLOR.negative, ink: SENTIMENT_INK.negative },
          { label: 'Complaint', count: shop.complaint, color: SENTIMENT_COLOR.complaint, ink: SENTIMENT_INK.complaint },
          { label: 'Suggestion', count: shop.suggestion, color: SENTIMENT_COLOR.suggestion, ink: SENTIMENT_INK.suggestion },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[var(--dash-inset)] rounded-xl p-2.5 text-center border border-[var(--dash-border)] min-w-0 shadow-inner"
          >
            <div
              className="mx-auto mb-1 h-1.5 w-6 rounded-full shadow-sm"
              style={{ background: s.color, boxShadow: `0 0 5px ${s.color}80` }}
            />
            <div className="text-lg font-black" style={{ color: s.ink }}>{s.count}</div>
            <div className="text-[0.62rem] font-bold text-[var(--dash-muted)] uppercase tracking-wider truncate">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Avg rating */}
      <div className="flex items-center justify-between mb-3 text-xs font-bold border-t border-[var(--dash-border)] pt-3">
        <span className="text-[var(--dash-muted)]">Average Rating</span>
        <span className="font-black text-sm" style={{ color: 'var(--dash-ink-rating)' }}>
          {shop.avgRating !== null ? `${shop.avgRating} / 5` : '—'}
        </span>
      </div>

      {/* Category breakdown with 3D capsule progress bars */}
      <div className="space-y-2">
        {Object.entries(shop.categoryBreakdown)
          .sort((a, b) => b[1].total - a[1].total)
          .map(([cat, d]) => {
            const barColor = d.complaint > 0 ? '#ef4444' : d.negative > 0 ? '#f97316' : '#22c55e'
            const pct = shop.total ? (d.total / shop.total) * 100 : 0
            return (
              <div key={cat} className="flex items-center gap-2 text-xs">
                <span>{CATEGORY_EMOJI[cat] ?? '📌'}</span>
                <span className="text-[var(--dash-text)] font-semibold capitalize w-20 min-w-0 break-words truncate">{cat}</span>
                <div className="relative flex-1 bg-[var(--dash-border)]/40 rounded-full h-2 overflow-hidden shadow-inner p-[1px]">
                  <div className="relative h-full w-full rounded-full overflow-hidden bg-[var(--dash-inset)]">
                    <div
                      className="relative h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${barColor}, ${barColor}ee)`,
                        boxShadow: `0 1px 3px ${barColor}60`,
                      }}
                    >
                      {/* Specular gloss highlight */}
                      <div
                        className="absolute inset-x-0 top-0 h-[50%] pointer-events-none rounded-t-full"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[var(--dash-muted)] font-black w-6 text-right">{d.total}</span>
              </div>
            )
          })}
      </div>
    </div>
  )
}

// ── Status badge + cycle button ────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string; next: string; nextLabel: string }> = {
  pending: { label: 'Pending', color: '#c2410c', next: 'contacted', nextLabel: 'Mark Contacted' },
  contacted: { label: 'Contacted', color: '#2563eb', next: 'resolved', nextLabel: 'Mark Resolved' },
  resolved: { label: 'Resolved', color: '#15803d', next: 'pending', nextLabel: 'Reopen' },
}

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] ?? STATUS_META['pending']
  return (
    <span
      className="relative inline-flex items-center gap-1 overflow-hidden px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
      style={{
        background: `linear-gradient(180deg, ${meta.color} 0%, ${meta.color}dd 100%)`,
        boxShadow: `0 1px 3px ${meta.color}50`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[40%] pointer-events-none rounded-t-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.45) 0%, transparent 100%)',
        }}
      />
      {meta.label}
    </span>
  )
}

function TicketBadge({ ticketId, priority }: { ticketId: string | null; priority?: string | null }) {
  if (!ticketId) return null
  const isUrgent = priority === 'urgent'
  const isHigh = priority === 'high'

  const borderStyle = isUrgent
    ? 'rgba(239, 68, 68, 0.45)'
    : isHigh
      ? 'rgba(245, 158, 11, 0.45)'
      : 'var(--dash-border)'

  const bgStyle = isUrgent
    ? 'rgba(239, 68, 68, 0.12)'
    : isHigh
      ? 'rgba(245, 158, 11, 0.12)'
      : 'var(--dash-inset)'

  const textStyle = isUrgent
    ? 'var(--dash-ink-complaint)'
    : isHigh
      ? 'var(--dash-ink-negative)'
      : 'var(--dash-text)'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-xs"
      style={{
        backgroundColor: bgStyle,
        borderColor: borderStyle,
        color: textStyle,
      }}
    >
      <span className="text-[11px] leading-none">🎫</span>
      <span>{ticketId}</span>
    </span>
  )
}

// ── Numeric phone pad ──────────────────────────────────────────────────────────
const PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['+', '0', '⌫'],
]

function PhonePad({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  function press(k: string) {
    if (k === '⌫') { onChange(value.slice(0, -1)); return }
    if (value.length >= 16) return
    onChange(value + k)
  }
  return (
    <div className="select-none">
      {/* Display */}
      <div className="flex items-center gap-2 bg-slate-900 rounded-xl px-4 py-3 mb-3">
        <span className="text-slate-400 text-sm">📞</span>
        <span className="flex-1 text-white font-mono text-lg tracking-widest min-h-[1.5rem]">
          {value || <span className="text-slate-500 text-sm font-sans">Enter number…</span>}
        </span>
        {value && (
          <button onClick={() => onChange('')}
            className="text-[var(--dash-muted)] hover:text-red-700 text-xs px-2 py-0.5 rounded transition-colors">
            Clear
          </button>
        )}
      </div>
      {/* Keys */}
      <div className="grid grid-cols-3 gap-2">
        {PAD_KEYS.flat().map((k) => (
          <button
            key={k}
            onClick={() => press(k)}
            className={`py-3 rounded-xl text-base font-semibold transition-colors ${k === '⌫'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                : 'bg-white border border-slate-200 text-slate-800 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 active:scale-95'
              }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Edit Contact Panel ─────────────────────────────────────────────────────────
function EditContactPanel({
  review,
  onSaved,
  onCancel,
}: {
  review: ReviewRow
  onSaved: (lead: { name: string | null; phone: string | null; email: string | null }) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(fmtContact(review.leadName) ?? '')
  const [phone, setPhone] = useState(review.leadPhone ?? '')
  const [email, setEmail] = useState(fmtContact(review.leadEmail) ?? '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  async function save() {
    if (!review.leadId) { setErr('No contact record to update'); return }
    setSaving(true); setErr(null)
    try {
      const res = await fetch(`/api/leads/${review.leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      })
      if (!res.ok) { setErr('Save failed'); return }
      const data = await res.json()
      setOk(true)
      setTimeout(() => onSaved({ name: data.name, phone: data.phone, email: data.email }), 600)
    } catch { setErr('Network error') }
    finally { setSaving(false) }
  }

  const fieldCls = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition-colors'

  return (
    <div className="space-y-4">
      {ok && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm text-center px-4 py-2 rounded-xl">
          Saved!
        </div>
      )}
      {err && <p role="alert" className="text-red-700 text-sm">{err}</p>}

      <div>
        <label htmlFor="lead-edit-name" className="block text-xs text-slate-500 mb-1 font-semibold">👤 Name</label>
        <input id="lead-edit-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name"
          className={fieldCls} />
      </div>

      <div>
        <p id="lead-edit-phone" className="block text-xs text-slate-500 mb-2 font-semibold">📞 Phone</p>
        <div role="group" aria-labelledby="lead-edit-phone"><PhonePad value={phone} onChange={setPhone} /></div>
      </div>

      <div>
        <label htmlFor="lead-edit-email" className="block text-xs text-slate-500 mb-1 font-semibold">✉️ Email</label>
        <input id="lead-edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com"
          className={fieldCls} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={save} disabled={saving || ok}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-xl transition-colors">
          {saving ? 'Saving…' : 'Save Contact'}
        </button>
        <button onClick={onCancel} disabled={saving}
          className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Transcript Modal ───────────────────────────────────────────────────────────
type ReviewRow = DashboardData['recentReviews'][0]

function TranscriptModal({
  review,
  onClose,
  onStatusChange,
  onLeadChange,
}: {
  review: ReviewRow
  onClose: () => void
  onStatusChange: (id: string, status: string) => void
  onLeadChange: (id: string, lead: { name: string | null; phone: string | null; email: string | null }) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  useModalA11y(panelRef, true, onClose)
  const [status, setStatus] = useState(review.status)
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const [editLead, setEditLead] = useState(false)
  const [lead, setLead] = useState({
    name: review.leadName,
    phone: review.leadPhone,
    email: review.leadEmail,
  })

  async function cycleStatus() {
    const next = STATUS_META[status]?.next ?? 'pending'
    setSaving(true); setSaveErr(null)
    try {
      const res = await fetch(`/api/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.ok) {
        setStatus(next)
        onStatusChange(review.id, next)
      } else {
        const data = await res.json().catch(() => ({}))
        setSaveErr(data?.error ?? `Failed (${res.status})`)
      }
    } catch {
      setSaveErr('Network error — please retry')
    } finally { setSaving(false) }
  }

  function handleLeadSaved(updated: { name: string | null; phone: string | null; email: string | null }) {
    setLead(updated)
    setEditLead(false)
    onLeadChange(review.id, updated)
  }

  const messages: Array<{ role: string; content: string }> = (() => {
    try { return JSON.parse(review.transcript ?? '[]') } catch { return [] }
  })().filter((m: { role: string; content: string }) => m.content !== '__GREET__')

  const keyPoints: string[] = (() => {
    try { return JSON.parse(review.keyPoints ?? '[]') } catch { return [] }
  })()

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4"
      onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />

      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="transcript-modal-title" tabIndex={-1}
        className="relative z-10 w-full max-w-2xl max-h-[90dvh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{SENTIMENT_EMOJI[review.sentiment ?? ''] ?? '💬'}</span>
              <h2 id="transcript-modal-title" className="text-sm font-bold text-slate-900 break-words">🏪 {review.shopName}</h2>
              {review.category && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize border border-slate-200">
                  {CATEGORY_EMOJI[review.category]} {review.category}
                </span>
              )}
              <TicketBadge ticketId={review.ticketId} priority={review.ticketPriority} />
              {review.rating && (
                <span className="text-xs font-semibold" style={{ color: 'var(--dash-ink-rating)' }}>{RATING_EMOJI[review.rating]} {review.rating}★</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {fmtDateTime(review.createdAt)}
              {review.subcategory && ` · ${review.subcategory}`}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close conversation"
            className="shrink-0 grid h-10 w-10 place-items-center rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xl leading-none">
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">

          {/* Contact + Status row */}
          <div className="flex flex-col sm:flex-row gap-4">

            {/* Contact card */}
            <div className={`flex-1 ${insetCls} rounded-xl p-4`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Contact</p>
                {review.leadId && !editLead && (
                  <button onClick={() => setEditLead(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-0.5 rounded-lg hover:bg-blue-50 transition-colors">
                    ✏️ Edit
                  </button>
                )}
              </div>

              {editLead ? (
                <EditContactPanel
                  review={{ ...review, leadName: lead.name, leadPhone: lead.phone, leadEmail: lead.email }}
                  onSaved={handleLeadSaved}
                  onCancel={() => setEditLead(false)}
                />
              ) : (() => {
                const dName = fmtContact(lead.name)
                const dPhone = fmtContact(lead.phone)
                const dEmail = fmtContact(lead.email)
                return (dName || dPhone || dEmail) ? (
                  <div className="space-y-2">
                    {dName && <p className="text-sm text-slate-800">👤 {dName}</p>}
                    {dPhone && (
                      <p className="text-sm text-slate-800 flex items-center gap-2">
                        📞 <button onClick={() => navigator.clipboard.writeText(dPhone)}
                          className="text-blue-600 hover:underline font-mono" title="Tap to copy">
                          {dPhone}
                        </button>
                      </p>
                    )}
                    {dEmail && (
                      <p className="text-sm text-slate-800 flex items-center gap-2 break-words">
                        ✉️ <button onClick={() => navigator.clipboard.writeText(dEmail!)}
                          className="text-blue-600 hover:underline break-all" title="Tap to copy">
                          {dEmail}
                        </button>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--dash-muted)] italic">No contact details provided</p>
                )
              })()}
            </div>

            {/* Status card */}
            {!editLead && (
              <div className={`flex-1 ${insetCls} rounded-xl p-4 flex flex-col gap-3`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Follow-up Status</p>
                <StatusBadge status={status} />
                {saveErr && (
                  <p role="alert" className="text-xs text-red-700 font-semibold">{saveErr}</p>
                )}
                <button onClick={cycleStatus} disabled={saving}
                  className="mt-auto px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-700 disabled:opacity-40 transition-colors">
                  {saving ? 'Saving…' : STATUS_META[status]?.nextLabel ?? 'Update'}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          {!editLead && review.summary && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200">
                {review.summary}
              </p>
            </div>
          )}

          {!editLead && review.ticketId && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ticket</p>
                <p className="mt-1 font-mono text-sm font-black text-slate-900">{review.ticketId}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</p>
                <p className="mt-1 text-sm font-black capitalize text-slate-900">{review.ticketPriority ?? 'normal'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">SLA</p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {review.slaDueAt
                    ? new Date(review.slaDueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : 'Queued'}
                </p>
              </div>
            </div>
          )}

          {/* Key Points */}
          {!editLead && keyPoints.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Key Points</p>
              <ul className="space-y-1.5">
                {keyPoints.map((kp, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <span className="text-blue-700 shrink-0 mt-0.5" aria-hidden="true">•</span>
                    <span>{kp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          {!editLead && messages.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Full Transcript</p>
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-slate-100 text-slate-800 rounded-bl-md border border-slate-200'
                      }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Filter helpers ─────────────────────────────────────────────────────────────
const DATE_RANGES = [
  { label: 'Today', days: 0 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '3 months', days: 90 },
  { label: 'All time', days: -1 },
] as const

const CATEGORIES = ['all', 'product', 'service', 'behavioral', 'facility', 'pricing', 'general'] as const
const SENTIMENTS = ['all', 'complaint', 'negative', 'positive', 'suggestion'] as const
const STATUSES = ['all', 'pending', 'contacted', 'resolved'] as const
const SORT_OPTIONS = [
  { label: 'Newest first', fn: (a: ReviewRow, b: ReviewRow) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() },
  { label: 'Oldest first', fn: (a: ReviewRow, b: ReviewRow) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() },
  { label: 'Rating ↑', fn: (a: ReviewRow, b: ReviewRow) => (a.rating ?? 0) - (b.rating ?? 0) },
  { label: 'Rating ↓', fn: (a: ReviewRow, b: ReviewRow) => (b.rating ?? 0) - (a.rating ?? 0) },
] as const

type SortKey = 0 | 1 | 2 | 3

interface ReviewFilters {
  search: string
  dateRange: number   // days back, -1 = all
  shop: string   // shop name or 'all'
  category: string
  sentiment: string
  status: string
  rating: number   // 0 = all
  sort: SortKey
}

const DEFAULT_FILTERS: ReviewFilters = {
  search: '', dateRange: -1, shop: 'all',
  category: 'all', sentiment: 'all', status: 'all',
  rating: 0, sort: 0,
}

function countActive(f: ReviewFilters): number {
  return [
    f.search !== '',
    f.dateRange !== -1,
    f.shop !== 'all',
    f.category !== 'all',
    f.sentiment !== 'all',
    f.status !== 'all',
    f.rating !== 0,
    f.sort !== 0,
  ].filter(Boolean).length
}

function applyFilters(reviews: ReviewRow[], f: ReviewFilters): ReviewRow[] {
  const q = f.search.toLowerCase().trim()
  const cutoff = f.dateRange >= 0
    ? Date.now() - f.dateRange * 86_400_000
    : 0

  return reviews
    .filter((r) => {
      if (f.dateRange >= 0 && new Date(r.createdAt).getTime() < cutoff) return false
      if (f.shop !== 'all' && r.shopName !== f.shop) return false
      if (f.category !== 'all' && r.category !== f.category) return false
      if (f.sentiment !== 'all' && r.sentiment !== f.sentiment) return false
      if (f.status !== 'all' && r.status !== f.status) return false
      if (f.rating !== 0 && r.rating !== f.rating) return false
      if (q) {
        const hay = [r.summary, r.subcategory, r.shopName, r.leadName, r.leadPhone, r.category]
          .filter(Boolean).join(' ').toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    .sort(SORT_OPTIONS[f.sort].fn)
}

// ── Filter pill ────────────────────────────────────────────────────────────────
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors border whitespace-nowrap ${active
          ? 'bg-slate-900 text-white border-slate-900'
          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
        }`}>
      {label}
    </button>
  )
}

// ── Reviews Panel ─────────────────────────────────────────────────────────────
function ReviewsPanel({ reviews: initial }: { reviews: DashboardData['recentReviews'] }) {
  const [reviews, setReviews] = useState(initial)
  const [filters, setFilters] = useState<ReviewFilters>(DEFAULT_FILTERS)
  const [open, setOpen] = useState(false)   // filter panel expanded
  const [selected, setSelected] = useState<ReviewRow | null>(null)

  const set = useCallback(<K extends keyof ReviewFilters>(key: K, val: ReviewFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val })), [])

  const clearAll = useCallback(() => setFilters(DEFAULT_FILTERS), [])

  const handleStatusChange = useCallback((id: string, status: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status } : r))
    setSelected((prev) => prev?.id === id ? { ...prev, status } : prev)
  }, [])

  const handleLeadChange = useCallback((id: string, lead: { name: string | null; phone: string | null; email: string | null }) => {
    setReviews((prev) => prev.map((r) => r.id === id
      ? { ...r, leadName: lead.name, leadPhone: lead.phone, leadEmail: lead.email }
      : r))
    setSelected((prev) => prev?.id === id
      ? { ...prev, leadName: lead.name, leadPhone: lead.phone, leadEmail: lead.email }
      : prev)
  }, [])

  const shops = useMemo(() => ['all', ...[...new Set(reviews.map((r) => r.shopName))].sort()], [reviews])
  const filtered = useMemo(() => applyFilters(reviews, filters), [reviews, filters])
  const activeCount = countActive(filters)
  const pendingCount = reviews.filter((r) => r.sentiment !== 'positive' && r.status === 'pending').length

  const selCls = `${inputCls} text-xs py-1.5`

  return (
    <>
      {selected && (
        <TranscriptModal
          review={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onLeadChange={handleLeadChange}
        />
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 mb-4">

        {/* Search + toggle row */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-[180px]">
            <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">🔍</span>
            <label htmlFor="review-search" className="sr-only">Search reviews</label>
            <input
              id="review-search"
              type="search" value={filters.search}
              onChange={(e) => set('search', e.target.value)}
              placeholder="Search reviews, outlet, customer name, phone…"
              className={`${inputCls} pl-8 text-sm`}
            />
            {filters.search && (
              <button type="button" onClick={() => set('search', '')} aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded text-slate-500 hover:text-slate-700 text-xs">
                <span aria-hidden="true">✕</span>
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${open || activeCount > 0
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:border-blue-400'
              }`}>
            <span>⚙ Filters</span>
            {activeCount > 0 && (
              <span className="bg-white text-blue-600 text-xs font-black rounded-full w-5 h-5 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {activeCount > 0 && (
            <button onClick={clearAll}
              className="px-3 py-2.5 text-xs font-semibold text-red-700 hover:text-red-800 border border-red-200 hover:border-red-400 rounded-lg bg-red-50 transition-colors">
              ✕ Clear all
            </button>
          )}
        </div>

        {/* Expandable filter panel */}
        {open && (
          <div className={`${insetCls} rounded-xl p-4 space-y-4`}>

            {/* Row 1: Date range + Shop + Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">📅 Date Range</p>
                <div className="flex flex-wrap gap-1.5">
                  {DATE_RANGES.map((d) => (
                    <Pill key={d.label} label={d.label}
                      active={filters.dateRange === d.days}
                      onClick={() => set('dateRange', d.days)} />
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-filter-shop" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">🏪 Outlet</label>
                <select id="review-filter-shop" value={filters.shop} onChange={(e) => set('shop', e.target.value)} className={selCls}>
                  {shops.map((s) => (
                    <option key={s} value={s}>{s === 'all' ? 'All Outlets' : s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="review-filter-sort" className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">↕ Sort By</label>
                <select id="review-filter-sort" value={filters.sort}
                  onChange={(e) => set('sort', Number(e.target.value) as SortKey)}
                  className={selCls}>
                  {SORT_OPTIONS.map((s, i) => (
                    <option key={i} value={i}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Category */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">📂 Category</p>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <Pill key={c} active={filters.category === c}
                    label={c === 'all' ? 'All' : `${CATEGORY_EMOJI[c] ?? ''} ${c}`}
                    onClick={() => set('category', c)} />
                ))}
              </div>
            </div>

            {/* Row 3: Sentiment */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">😊 Sentiment</p>
              <div className="flex flex-wrap gap-1.5">
                {SENTIMENTS.map((s) => (
                  <Pill key={s} active={filters.sentiment === s}
                    label={s === 'all' ? 'All' : `${SENTIMENT_EMOJI[s] ?? ''} ${s}`}
                    onClick={() => set('sentiment', s)} />
                ))}
              </div>
            </div>

            {/* Row 4: Status + Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">📌 Follow-up Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <Pill key={s} active={filters.status === s}
                      label={s === 'all' ? 'All' : s}
                      onClick={() => set('status', s)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">⭐ Rating</p>
                <div className="flex flex-wrap gap-1.5">
                  <Pill label="All" active={filters.rating === 0} onClick={() => set('rating', 0)} />
                  {[1, 2, 3, 4, 5].map((r) => (
                    <Pill key={r} active={filters.rating === r}
                      label={`${RATING_EMOJI[r]} ${r}★`}
                      onClick={() => set('rating', r)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 flex-wrap gap-2">
          <span>
            Showing <span className="font-bold text-slate-800">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-800">{reviews.length}</span> reviews
          </span>
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 bg-orange-100 text-orange-700 font-bold rounded-full border border-orange-200">
              {pendingCount} need follow-up
            </span>
          )}
        </div>
      </div>

      {/* ── Review list ─────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-slate-500 text-sm font-semibold">No reviews match the selected filters</p>
          <button onClick={clearAll} className="mt-3 text-xs text-blue-600 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((r) => (
            <button key={r.id} onClick={() => setSelected(r)}
              className="w-full text-left flex gap-3.5 p-3.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--dash-accent)]/50 group"
              style={{
                boxShadow: '0 2px 8px -2px var(--dash-shadow), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}
            >
              <span className="text-xl mt-0.5 shrink-0">
                {SENTIMENT_EMOJI[r.sentiment ?? ''] ?? '💬'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="text-xs font-bold text-[var(--dash-heading)] break-words">🏪 {r.shopName}</span>
                    {r.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--dash-surface)] text-[var(--dash-text)] border border-[var(--dash-border)] capitalize shadow-xs">
                        {CATEGORY_EMOJI[r.category]} {r.category}
                      </span>
                    )}
                    <TicketBadge ticketId={r.ticketId} priority={r.ticketPriority} />
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.rating && <span className="text-xs font-semibold" style={{ color: 'var(--dash-ink-rating)' }}>{RATING_EMOJI[r.rating]} {r.rating}★</span>}
                    <span className="text-xs font-medium text-[var(--dash-muted)]">
                      {fmtDateTimeShort(r.createdAt)}
                    </span>
                    <span className="text-xs text-[var(--dash-accent)] opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity font-bold">View →</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--dash-text)] leading-relaxed line-clamp-2">
                  {fmtText(r.summary, 'No summary available')}
                </p>
                {(() => {
                  const n = fmtContact(r.leadName)
                  const p = fmtContact(r.leadPhone)
                  return (n || p) ? (
                    <p className="text-xs text-[var(--dash-muted)] mt-1">
                      {n && `👤 ${n}`}{p && `${n ? ' · ' : ''}📞 ${p}`}
                    </p>
                  ) : null
                })()}
              </div>
            </button>
          ))}
        </div>
      )}
    </>
  )
}

// ── AI Search Panel ────────────────────────────────────────────────────────────
const EXAMPLE_QUERIES = [
  'Which outlet has the most hygiene complaints?',
  'What are customers saying about staff behaviour?',
  'Show me all negative product reviews',
  'Which shop has the highest satisfaction?',
]

function SearchPanel() {
  const [query, setQuery] = useState('')
  const [loading, setLoad] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function search(q: string) {
    const clean = q.replace(/^[^\w]+ ?/, '')
    if (!clean.trim()) return
    setQuery(clean)
    setLoad(true); setResult(null); setError(null)
    try {
      const res = await fetch('/api/dashboard/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: clean, limit: 6 }),
      })
      const data = await res.json()
      if (data.error) setError(data.error)
      else setResult(data as SearchResult)
    } catch { setError('Search failed. Please try again.') }
    finally { setLoad(false) }
  }

  return (
    <Card className="mb-5">
      <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <SectionTitle>Ask about your reviews</SectionTitle>
          <p className="text-xs font-semibold text-[var(--dash-muted)]">Ask in plain English. Answers come from the reviews in this dashboard.</p>
        </div>
        <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-widest text-blue-700">
          AI search
        </span>
      </div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="review-ask" className="sr-only">Ask a question about your reviews</label>
        <input
          id="review-ask"
          ref={inputRef}
          type="text" value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search(query)}
          placeholder="e.g. Which outlet has the most behavioral complaints?"
          className={`${inputCls} flex-1`}
        />
        <button
          onClick={() => search(query)} disabled={loading || !query.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </div>
      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button key={q} onClick={() => search(q)}
              className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-inset)] px-3 py-1.5 text-xs text-[var(--dash-muted)] transition-colors hover:bg-blue-50 hover:text-blue-700">
              {q}
            </button>
          ))}
        </div>
      )}
      {loading && (
        <div role="status" className="flex items-center gap-3 py-6 text-[var(--dash-muted)] text-sm">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Analysing reviews…
        </div>
      )}
      {error && <p role="alert" className="text-sm mt-2" style={{ color: 'var(--dash-ink-complaint)' }}>{error}</p>}
      {result && (
        <div className="mt-4">
          <div aria-live="polite" className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <p className="text-xs text-blue-700 font-bold mb-2 uppercase tracking-widest">AI analysis</p>
            <p className="text-slate-800 text-sm leading-relaxed">{result.answer}</p>
          </div>
          {result.sources.length > 0 && (
            <>
              <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">
                Based on {result.sources.length} matching review{result.sources.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.sources.map((s) => (
                  <div key={s.id} className={`${insetCls} rounded-lg p-3`}>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-slate-800 break-words">🏪 {s.shop}</span>
                      <span className="text-sm">{SENTIMENT_EMOJI[s.sentiment ?? ''] ?? '💬'}</span>
                    </div>
                    {s.category && (
                      <p className="text-xs text-slate-500 mb-1 capitalize">
                        {CATEGORY_EMOJI[s.category]} {s.category}{s.subcategory ? ` · ${s.subcategory}` : ''}
                      </p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{fmtText(s.summary, 'No summary available')}</p>
                    {s.rating && (
                      <div className="mt-1.5 text-xs" style={{ color: 'var(--dash-ink-rating)' }}>{RATING_EMOJI[s.rating]} {s.rating}★</div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <button onClick={() => { setResult(null); setQuery(''); inputRef.current?.focus() }}
            className="mt-4 text-xs text-[var(--dash-muted)] hover:text-[var(--dash-heading)] underline">
            ✕ Clear search
          </button>
        </div>
      )}
    </Card>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="min-h-dvh bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="text-7xl mb-4">📊</div>
        <p className="text-xl font-bold text-slate-900">No reviews yet</p>
        <p className="text-sm text-slate-500 mt-2">Reviews will appear once customers start leaving feedback.</p>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export type { DashboardThemeKey }
export const DASHBOARD_THEME_COOKIE = 'dashboard-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function persistTheme(key: DashboardThemeKey) {
  // Cookie: lets the server render the saved theme on first paint (no light flash).
  document.cookie = `${DASHBOARD_THEME_COOKIE}=${key}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`
  try { window.localStorage.removeItem('dashboard-theme') } catch { /* storage unavailable */ }
}

export function DashboardClient({ data, session, initialTheme }: {
  data: DashboardData | null
  session: Pick<AppSession, 'role' | 'shopId'>
  initialTheme?: DashboardThemeKey
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'analytics' | 'reviews' | 'shops' | 'reports'>('analytics')
  const [trendView, setTrendView] = useState<'3d' | 'line'>('3d')
  const [themeKey, setThemeKey] = useState<DashboardThemeKey>(initialTheme ?? 'light')
  // Data is fetched on the server per request, so "as of" is when this page loaded.
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  useEffect(() => {
    setLoadedAt(new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))
  }, [data])

  useEffect(() => {
    // One-time migration from the old localStorage setting to the cookie.
    if (initialTheme) return
    let saved: DashboardThemeKey | null = null
    try { saved = window.localStorage.getItem('dashboard-theme') as DashboardThemeKey | null } catch { /* storage unavailable */ }
    if (saved && saved in DASHBOARD_THEMES) { setThemeKey(saved); persistTheme(saved) }
  }, [initialTheme])

  const selectTheme = useCallback((nextTheme: DashboardThemeKey) => {
    setThemeKey(nextTheme)
    persistTheme(nextTheme)
  }, [])

  if (!data) return <EmptyState />

  const { totalReviews, avgRating, bysentiment, categorySentiment, trend, ratingDist, topIssues, topSuggestions, recentReviews, shops } = data

  const positive = bysentiment['positive'] ?? 0
  const negative = bysentiment['negative'] ?? 0
  const complaint = bysentiment['complaint'] ?? 0
  const suggestion = bysentiment['suggestion'] ?? 0
  const satisfaction = avgRating ? Math.round((avgRating / 5) * 100) : null

  const trendData = trend.map((t) => ({ month: t.month.slice(5), count: Number(t.count) }))
  const busiestMonth = trendData.length > 0
    ? [...trendData].sort((a, b) => b.count - a.count)[0]
    : null
  const avgMonthlyCount = trendData.length > 0
    ? Math.round(trendData.reduce((acc, d) => acc + d.count, 0) / trendData.length)
    : 0
  const maxRating = Math.max(...ratingDist.map((r) => r.count), 1)
  const rankedShops = [...shops].sort((a, b) => (b.satisfaction ?? 0) - (a.satisfaction ?? 0))
  const maxCatTotal = Math.max(...Object.values(categorySentiment).map((c) => c.total), 1)
  const pendingFollowUps = recentReviews.filter((r) => r.sentiment !== 'positive' && r.status === 'pending').length
  const complaintRate = totalReviews ? Math.round((complaint / totalReviews) * 100) : 0
  const positiveRate = totalReviews ? Math.round((positive / totalReviews) * 100) : 0
  const bestShop = rankedShops.find((shop) => shop.total > 0)
  const lowestShop = [...shops]
    .filter((shop) => shop.total > 0)
    .sort((a, b) => (a.satisfaction ?? -1) - (b.satisfaction ?? -1))[0]

  const satisfactionColor = !satisfaction ? '#94a3b8'
    : satisfaction >= 70 ? '#22c55e' : satisfaction >= 45 ? '#eab308' : '#ef4444'
  const theme = DASHBOARD_THEMES[themeKey] ?? DASHBOARD_THEMES.light

  const tabBtn = (active: boolean) => `shrink-0 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-black transition-colors border ${active
      ? 'text-white border-transparent shadow-sm'
      : `bg-[var(--dash-input)] text-[var(--dash-text)] border-[var(--dash-border)] ${theme.tabHover}`
    }`

  return (
    <div
      className={`dash-dashboard min-h-dvh ${theme.bgClass} text-[var(--dash-text)] font-sans`}
      data-dashboard-theme={themeKey}
      style={theme.vars}
    >
      <div className="mx-auto w-full max-w-[1720px] px-4 py-5 sm:px-6 lg:px-8">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className={`${surfaceCls} mb-5 overflow-hidden rounded-2xl`} style={{ borderTop: `3px solid ${theme.accent}` }}>
          <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_auto] lg:p-6">
            <div className="min-w-0">
              <h1 className="max-w-4xl text-2xl font-black leading-tight text-[var(--dash-heading)] sm:text-3xl lg:text-4xl">
                Outlet performance and review analytics
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[var(--dash-muted)]">
                Monitor complaint risk, satisfaction quality, and follow-up work across every shop.
              </p>
            </div>

            <div className="grid min-w-[min(100%,23rem)] grid-cols-3 gap-2">
              <div className={`rounded-xl border p-3 ${theme.statPanel}`}>
                <p className="text-[0.68rem] font-black uppercase tracking-widest">Reviews</p>
                <p className="mt-1.5 text-xl font-black">{totalReviews}</p>
              </div>
              <div className={`rounded-xl border p-3 ${theme.positivePanel}`}>
                <p className="text-[0.68rem] font-black uppercase tracking-widest">Positive</p>
                <p className="mt-1.5 text-xl font-black">{positiveRate}%</p>
              </div>
              <div className={`rounded-xl border p-3 ${theme.queuePanel}`}>
                <p className="text-[0.68rem] font-black uppercase tracking-widest">Queue</p>
                <p className="mt-1.5 text-xl font-black">{pendingFollowUps}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--dash-border)] bg-[var(--dash-inset)] px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <nav className="flex shrink-0 flex-wrap gap-2 lg:flex-nowrap" aria-label="Dashboard sections">
              <button type="button" aria-current={tab === 'analytics' ? 'page' : undefined} onClick={() => setTab('analytics')} className={tabBtn(tab === 'analytics')} style={tab === 'analytics' ? { background: theme.accentDark } : undefined}>
                Analytics
              </button>
              <button type="button" aria-current={tab === 'reviews' ? 'page' : undefined} onClick={() => setTab('reviews')} className={tabBtn(tab === 'reviews')} style={tab === 'reviews' ? { background: theme.accentDark } : undefined}>
                Reviews
                {pendingFollowUps > 0 && (
                  <span className="ml-2 rounded-full bg-orange-700 px-2 py-0.5 text-xs font-black text-white">
                    {pendingFollowUps}
                  </span>
                )}
              </button>
              <button type="button" aria-current={tab === 'shops' ? 'page' : undefined} onClick={() => setTab('shops')} className={tabBtn(tab === 'shops')} style={tab === 'shops' ? { background: theme.accentDark } : undefined}>
                Shops
              </button>
              <button type="button" aria-current={tab === 'reports' ? 'page' : undefined} onClick={() => setTab('reports')} className={tabBtn(tab === 'reports')} style={tab === 'reports' ? { background: theme.accentDark } : undefined}>
                Reports
              </button>
            </nav>

            <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
              <ThemeSelector selected={themeKey} onSelect={selectTheme} />
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-bold text-[var(--dash-muted)]">
                {loadedAt && <span>Data as of {loadedAt}</span>}
              </div>
              <button
                onClick={() => router.refresh()}
                className="w-fit rounded-full border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-1.5 text-xs font-black text-[var(--dash-muted)] transition-colors hover:border-blue-300 hover:text-blue-500"
              >
                ↻ Refresh
              </button>
              <button
                onClick={async () => {
                  await fetch('/api/dashboard/auth', { method: 'DELETE' })
                  router.push('/dashboard/login')
                }}
                className="w-fit rounded-full border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-1.5 text-xs font-black text-[var(--dash-muted)] transition-colors hover:border-red-300 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Tab content ───────────────────────────────────────────────────── */}
        {tab === 'analytics' && (
          <>
            {/* ── AI Search ───────────────────────────────────────────────── */}
            <SearchPanel />

            {/* ── Operational Health & Sentiment (3D Cards) ── */}
            <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--dash-accent)] shadow-xs inline-block" />
                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                  Operational Health & Sentiment
                </h2>
              </div>
              <p className="text-xs font-semibold text-[var(--dash-muted)]">
                Live customer sentiment shares & satisfaction index
              </p>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                    <ThreeDMetricCard
                      label="Total"
                      value={totalReviews}
                      sub="All recorded reviews"
                      icon="📋"
                      tone="blue"
                      progressPct={100}
                      highlight
                      info="Total customer interactions and feedback received across all outlets."
                    />
                    <ThreeDMetricCard
                      label="Positive"
                      value={positive}
                      sub={`${totalReviews ? Math.round(positive / totalReviews * 100) : 0}% of dataset`}
                      icon="✨"
                      tone="green"
                      progressPct={totalReviews ? Math.round(positive / totalReviews * 100) : 0}
                      info="Reviews indicating positive customer satisfaction and approval."
                    />
                    <ThreeDMetricCard
                      label="Negative"
                      value={negative}
                      sub={`${totalReviews ? Math.round(negative / totalReviews * 100) : 0}% of dataset`}
                      icon="⚠️"
                      tone="orange"
                      progressPct={totalReviews ? Math.round(negative / totalReviews * 100) : 0}
                      info="Dissatisfied feedback not escalating to formal complaints."
                    />
                    <ThreeDMetricCard
                      label="Complaints"
                      value={complaint}
                      sub={`${totalReviews ? Math.round(complaint / totalReviews * 100) : 0}% of dataset`}
                      icon="🚨"
                      tone="red"
                      isNegative={complaint > 0}
                      progressPct={totalReviews ? Math.round(complaint / totalReviews * 100) : 0}
                      info="High-priority customer grievances requiring active management."
                    />
                    <ThreeDMetricCard
                      label="Suggestions"
                      value={suggestion}
                      sub={`${totalReviews ? Math.round(suggestion / totalReviews * 100) : 0}% of dataset`}
                      icon="💡"
                      tone="purple"
                      progressPct={totalReviews ? Math.round(suggestion / totalReviews * 100) : 0}
                      info="Actionable proposals and product improvement suggestions."
                    />
                    <ThreeDMetricCard
                      label="Avg Rating"
                      value={avgRating !== null ? `${avgRating}/5` : '—'}
                      sub={avgRating ? `${Math.round((avgRating / 5) * 100)}% overall score` : 'No rating data'}
                      icon="★"
                      tone="amber"
                      progressPct={avgRating ? Math.round((avgRating / 5) * 100) : 0}
                      info="Weighted star rating across all rated customer encounters."
                    />
                    <ThreeDMetricCard
                      label="Satisfaction"
                      value={satisfaction !== null ? `${satisfaction}%` : '—'}
                    sub={satisfaction !== null && satisfaction >= 70 ? 'Target achieved' : 'Needs attention'}
                    icon="🎯"
                    color={satisfactionColor}
                    tone={satisfaction !== null && satisfaction >= 70 ? 'green' : satisfaction !== null && satisfaction >= 50 ? 'amber' : 'red'}
                    progressPct={satisfaction ?? 0}
                    info="Net customer satisfaction percentage."
            />
                  </div>

            {/* ── Risk & Outlet Standing ── */}
            <div className="mb-3 mt-6 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 shadow-xs inline-block" />
                <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                  Risk & Outlet Benchmarks
                </h2>
              </div>
              <p className="text-xs font-semibold text-[var(--dash-muted)]">
                Follow-up queue and branch comparative standing
              </p>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <ThreeDInsightCard
              label="Complaint Rate"
                      value={`${complaintRate}%`}
                      detail={complaintRate >= 20 ? 'Needs active management' : 'Within current tolerance'}
                      icon="🚨"
                      tone={complaintRate >= 20 ? 'red' : 'green'}
                      progressPct={complaintRate}
                      info="Percentage of interactions classified as formal complaints."
                    />
                      <ThreeDInsightCard
              label="Follow-up Queue"
                      value={pendingFollowUps}
                      detail={pendingFollowUps === 0 ? 'No open recovery work' : `${pendingFollowUps} open customer recovery items`}
                      icon="⏱️"
                      tone={pendingFollowUps > 0 ? 'amber' : 'green'}
                      progressPct={totalReviews ? Math.min(100, Math.round((pendingFollowUps / totalReviews) * 100)) : 0}
                      info="Pending unresolved feedback awaiting outreach."
                    />
                      <ThreeDInsightCard
              label="Strongest Outlet"
                      value={bestShop?.name ?? '—'}
                      detail={bestShop?.satisfaction !== null && bestShop?.satisfaction !== undefined ? `${bestShop.satisfaction}% satisfaction score` : 'No rated outlet yet'}
                      icon="🏆"
                      tone="blue"
                      progressPct={bestShop?.satisfaction ?? 0}
                      info="Highest rated branch by customer satisfaction."
                    />
                      <ThreeDInsightCard
              label="Lowest Rated"
                      value={lowestShop?.name ?? '—'}
                      detail={lowestShop?.satisfaction !== null && lowestShop?.satisfaction !== undefined ? `${lowestShop.satisfaction}% satisfaction score` : 'No rated outlet yet'}
                      icon="📍"
                      tone={lowestShop && (lowestShop.satisfaction ?? 100) < 60 ? 'red' : 'slate'}
                      progressPct={lowestShop?.satisfaction ?? 0}
                      info="Lowest ranking outlet requiring quality review."
                    />
                  </div>

                  {/* ── Sentiment & Category Intelligence ── */}
                  <div className="mb-3 mt-8 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-500 shadow-xs inline-block" />
                      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                        Sentiment & Category Intelligence
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">
                      Dimensional distribution of customer responses and operational domains
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

                    {/* Sentiment Analysis - 3D Extruded Donut */}
                    <Card className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <div>
                            <SectionTitle>Sentiment Breakdown</SectionTitle>
                            <p className="text-xs text-[var(--dash-muted)] font-medium">
                              {totalReviews ? `${positiveRate}% satisfaction across ${totalReviews} recorded reviews` : 'Customer sentiment breakdown'}
                            </p>
                          </div>
                          <span className="rounded-full border border-[var(--dash-border)] bg-[var(--dash-inset)] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] shadow-xs">
                            {totalReviews} Total
                          </span>
                        </div>
                        <ThreeDDonutChart
                          data={[
                            { name: SENTIMENT_LABEL['positive'] ?? 'Positive', value: positive, color: '#22c55e', gradientFrom: '#16a34a', gradientTo: '#4ade80' },
                            { name: SENTIMENT_LABEL['negative'] ?? 'Negative', value: negative, color: '#f97316', gradientFrom: '#ea580c', gradientTo: '#fb923c' },
                            { name: SENTIMENT_LABEL['complaint'] ?? 'Complaint', value: complaint, color: '#ef4444', gradientFrom: '#dc2626', gradientTo: '#f87171' },
                            { name: SENTIMENT_LABEL['suggestion'] ?? 'Suggestion', value: suggestion, color: '#6366f1', gradientFrom: '#4f46e5', gradientTo: '#818cf8' },
                          ]}
                          centerLabel="reviews"
                          centerValue={totalReviews}
                          size={220}
                        />
                      </div>

                      {/* Sentiment Intelligence Breakdown Metrics */}
                      <div className="mt-6 pt-5 border-t border-[var(--dash-border)]">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block">Positive</span>
                            <span className="text-lg font-black text-[var(--dash-ink-positive)] block mt-0.5">{positive}</span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">{positiveRate}% share</span>
                          </div>
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block">Negative</span>
                            <span className="text-lg font-black text-[var(--dash-ink-negative)] block mt-0.5">{negative}</span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">{totalReviews ? Math.round((negative / totalReviews) * 100) : 0}% share</span>
                          </div>
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block">Complaint</span>
                            <span className="text-lg font-black text-[var(--dash-ink-complaint)] block mt-0.5">{complaint}</span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">{complaintRate}% share</span>
                          </div>
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block">Suggestion</span>
                            <span className="text-lg font-black text-[var(--dash-ink-suggestion)] block mt-0.5">{suggestion}</span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">{totalReviews ? Math.round((suggestion / totalReviews) * 100) : 0}% share</span>
                          </div>
                        </div>

                        {/* Executive Sentiment Health Callout */}
                        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] px-3.5 py-2 text-xs font-semibold text-[var(--dash-muted)]">
                          <span className="text-base shrink-0">
                            {positiveRate >= 50 ? '🌟' : complaintRate >= 30 ? '⚠️' : '📊'}
                          </span>
                          <span className="truncate">
                            {positiveRate >= 50
                              ? `Healthy sentiment balance with ${positiveRate}% positive feedback across active branches.`
                              : complaintRate >= 30
                                ? `Active customer friction detected (${complaintRate}% complaints). Fast resolution advised.`
                                : `Balanced customer feedback across ${totalReviews} recorded interactions.`}
                          </span>
                        </div>
                      </div>
                    </Card>

                    {/* Category Analysis - 3D Horizontal Bars */}
                    <Card className="flex flex-col justify-between">
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div>
                          <SectionTitle>Category Breakdown</SectionTitle>
                          <p className="text-xs text-[var(--dash-muted)] font-medium">
                            Feedback volume and sentiment split across operations
                          </p>
                        </div>
                      </div>
                      <ThreeDHorizontalBar
                        items={Object.entries(categorySentiment)
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([cat, d]) => ({
                            label: cat,
                            value: d.total,
                            percentage: maxCatTotal ? Math.round((d.total / maxCatTotal) * 100) : 0,
                            segments: [
                              { name: 'Positive', value: d.positive, color: '#22c55e', ink: SENTIMENT_INK.positive },
                              { name: 'Negative', value: d.negative, color: '#f97316', ink: SENTIMENT_INK.negative },
                              { name: 'Complaint', value: d.complaint, color: '#ef4444', ink: SENTIMENT_INK.complaint },
                              { name: 'Suggestion', value: d.suggestion, color: '#6366f1', ink: SENTIMENT_INK.suggestion },
                            ],
                          }))}
                        maxValue={maxCatTotal}
                        unit="reviews"
                        highlightTop={true}
                      />
                      <div className="flex gap-3 mt-4 text-xs text-[var(--dash-muted)] flex-wrap pt-3 border-t border-[var(--dash-border)]">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block shadow-sm" />Positive</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block shadow-sm" />Negative</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-sm" />Complaint</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] inline-block shadow-sm" />Suggestion</span>
                      </div>
                    </Card>
                  </div>

                  {/* ── Outlet Performance & Rankings ── */}
                  <div className="mb-3 mt-8 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--dash-accent)] shadow-xs inline-block" />
                      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                        Outlet Performance & Rankings
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">
                      Branch satisfaction index, volume split and operational health
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">
                    {rankedShops.map((shop, i) => <ShopCard key={shop.id} shop={shop} rank={i + 1} />)}
                  </div>

                  {/* ── Customer Voice & Issues ── */}
                  <div className="mb-3 mt-8 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-500 shadow-xs inline-block" />
                      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                        Customer Issues & Voice
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">
                      High-friction pain points, complaints and guest feature suggestions
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

                    {/* Top Issues */}
                    <Card>
                      <div className="mb-4">
                        <SectionTitle>Top Issues Requiring Attention</SectionTitle>
                        <p className="text-xs font-semibold text-[var(--dash-muted)]">
                          Recurring operational and service friction points
                        </p>
                      </div>
                      {topIssues.length === 0 ? (
                        <p className="text-xs font-semibold text-[var(--dash-muted)] py-6 text-center">
                          No critical issues found.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {topIssues.map((issue, i) => {
                            const isComplaint = issue.sentiment === 'complaint'
                            const accentColor = isComplaint ? '#ef4444' : '#f97316'
                            const inkColor = isComplaint ? 'var(--dash-ink-complaint)' : 'var(--dash-ink-negative)'
                            return (
                              <div
                                key={i}
                                className="group relative flex items-center gap-3.5 p-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                style={{
                                  boxShadow: '0 2px 8px -2px var(--dash-shadow), inset 0 1px 0 rgba(255,255,255,0.4)',
                                }}
                              >
                                <div
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold shadow-xs transition-transform group-hover:scale-105"
                                  style={{
                                    backgroundColor: `${accentColor}18`,
                                    borderColor: `${accentColor}40`,
                                    color: accentColor,
                                    boxShadow: `0 2px 6px ${accentColor}25`,
                                  }}
                                >
                                  {isComplaint ? '🚨' : '⚠️'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[var(--dash-heading)] capitalize break-words leading-snug">
                                    {issue.subcategory}
                                  </p>
                                  <p className="text-xs font-semibold text-[var(--dash-muted)] capitalize mt-0.5">
                                    {issue.category}
                                  </p>
                                </div>
                                <div
                                  className="relative shrink-0 overflow-hidden rounded-full px-3 py-1 text-xs font-black border shadow-xs"
                                  style={{
                                    backgroundColor: `${accentColor}15`,
                                    borderColor: `${accentColor}35`,
                                    color: inkColor,
                                  }}
                                >
                                  <div
                                    className="absolute inset-x-0 top-0 h-[40%] pointer-events-none rounded-t-full"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                                    }}
                                  />
                                  {issue.count}×
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </Card>

                    {/* Top Suggestions */}
                    <Card>
                      <div className="mb-4">
                        <SectionTitle>Top Customer Suggestions</SectionTitle>
                        <p className="text-xs font-semibold text-[var(--dash-muted)]">
                          Product, service and experience upgrades requested by guests
                        </p>
                      </div>
                      {topSuggestions.length === 0 ? (
                        <p className="text-xs font-semibold text-[var(--dash-muted)] py-6 text-center">
                          No suggestions recorded yet.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {topSuggestions.map((s, i) => {
                            const accentColor = '#6366f1'
                            const inkColor = 'var(--dash-ink-suggestion)'
                            return (
                              <div
                                key={i}
                                className="group relative flex items-center gap-3.5 p-3 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                                style={{
                                  boxShadow: '0 2px 8px -2px var(--dash-shadow), inset 0 1px 0 rgba(255,255,255,0.4)',
                                }}
                              >
                                <div
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-bold shadow-xs transition-transform group-hover:scale-105"
                                  style={{
                                    backgroundColor: `${accentColor}18`,
                                    borderColor: `${accentColor}40`,
                                    color: accentColor,
                                    boxShadow: `0 2px 6px ${accentColor}25`,
                                  }}
                                >
                                  💡
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-[var(--dash-heading)] capitalize break-words leading-snug">
                                    {s.subcategory}
                                  </p>
                                  <p className="text-xs font-semibold text-[var(--dash-muted)] capitalize mt-0.5">
                                    {s.category}
                                  </p>
                                </div>
                                <div
                                  className="relative shrink-0 overflow-hidden rounded-full px-3 py-1 text-xs font-black border shadow-xs"
                                  style={{
                                    backgroundColor: `${accentColor}15`,
                                    borderColor: `${accentColor}35`,
                                    color: inkColor,
                                  }}
                                >
                                  <div
                                    className="absolute inset-x-0 top-0 h-[40%] pointer-events-none rounded-t-full"
                                    style={{
                                      background: 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, transparent 100%)',
                                    }}
                                  />
                                  {s.count}×
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* ── Volume Trends & Rating Distribution ── */}
                  <div className="mb-3 mt-8 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500 shadow-xs inline-block" />
                      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                        Volume Trends & Rating Distribution
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">
                      Historical review trajectory and customer score segmentation
                    </p>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mb-8">

                    {/* Monthly Trend - 3D Cylindrical Columns & Trend Line Toggle */}
                    <Card className="flex flex-col justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <div>
                          <SectionTitle>Monthly Review Volume</SectionTitle>
                          <p className="text-xs text-[var(--dash-muted)] font-medium">
                            {busiestMonth
                              ? `${busiestMonth.month} was the busiest month with ${busiestMonth.count} reviews recorded.`
                              : 'Historical monthly review volume'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-1 text-xs font-black shrink-0 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setTrendView('3d')}
                            className={`px-3 py-1 rounded-lg transition-all ${trendView === '3d'
                                ? 'bg-[var(--dash-surface)] text-[var(--dash-heading)] shadow-sm'
                                : 'text-[var(--dash-muted)] hover:text-[var(--dash-heading)]'
                              }`}
                          >
                            3D Columns
                          </button>
                          <button
                            type="button"
                            onClick={() => setTrendView('line')}
                            className={`px-3 py-1 rounded-lg transition-all ${trendView === 'line'
                                ? 'bg-[var(--dash-surface)] text-[var(--dash-heading)] shadow-sm'
                                : 'text-[var(--dash-muted)] hover:text-[var(--dash-heading)]'
                              }`}
                          >
                            Trend Line
                          </button>
                        </div>
                      </div>

                      {trendView === '3d' ? (
                        <ThreeDColumnChart
                          data={trendData.map((t) => ({
                            label: t.month,
                            value: t.count,
                            color: 'blue',
                          }))}
                          unit="reviews"
                          benchmarkValue={avgMonthlyCount}
                          benchmarkLabel="Monthly Average"
                          height={260}
                        />
                      ) : (
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={trendData} margin={{ left: 0, right: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                            <XAxis dataKey="month" tick={{ fill: CHART_TICK, fontSize: 11 }} />
                            <YAxis tick={{ fill: CHART_TICK, fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: 'var(--dash-surface)', border: '1px solid var(--dash-border)', color: 'var(--dash-text)', borderRadius: 8 }}
                              labelStyle={{ color: '#0f172a' }} />
                            <Line type="monotone" dataKey="count" stroke={theme.accent} strokeWidth={2.5}
                              dot={{ fill: theme.accent, r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </Card>

                    {/* Rating Distribution */}
                    <Card className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-2">
                          <div>
                            <SectionTitle>Rating Distribution</SectionTitle>
                            <p className="text-xs text-[var(--dash-muted)] font-medium">
                              Customer star score segmentation and review volume
                            </p>
                          </div>
                          {avgRating !== null && (
                            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] px-3 py-1 shadow-xs">
                              <span className="text-sm font-black" style={{ color: 'var(--dash-ink-rating)' }}>{avgRating}</span>
                              <span className="text-amber-400 text-xs">★</span>
                              <span className="text-[10px] font-bold text-[var(--dash-muted)]">avg</span>
                            </div>
                          )}
                        </div>

                        {ratingDist.length === 0
                          ? <p className="text-slate-500 text-sm py-8 text-center">No ratings collected yet</p>
                          : (
                            <div className="space-y-2 my-2">
                              {[5, 4, 3, 2, 1].map((star) => {
                                const found = ratingDist.find((r) => r.rating === star)
                                return <RatingBar key={star} rating={star} count={found?.count ?? 0} max={maxRating} />
                              })}
                            </div>
                          )}
                      </div>

                      {/* CSAT / NPS Tier Segmentation & Quality Breakdown */}
                      <div className="mt-5 pt-4 border-t border-[var(--dash-border)]">
                        <div className="grid grid-cols-3 gap-2.5">
                          {/* Promoters */}
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block truncate">Promoters (4-5★)</span>
                            <span className="text-lg font-black text-[var(--dash-ink-positive)] block mt-0.5">
                              {(ratingDist.find((r) => r.rating === 5)?.count ?? 0) + (ratingDist.find((r) => r.rating === 4)?.count ?? 0)}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">
                              {totalReviews
                                ? Math.round(
                                    (((ratingDist.find((r) => r.rating === 5)?.count ?? 0) +
                                      (ratingDist.find((r) => r.rating === 4)?.count ?? 0)) /
                                      totalReviews) *
                                      100
                                  )
                                : 0}% share
                            </span>
                          </div>

                          {/* Neutral */}
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block truncate">Neutral (3★)</span>
                            <span className="text-lg font-black text-amber-500 block mt-0.5">
                              {ratingDist.find((r) => r.rating === 3)?.count ?? 0}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">
                              {totalReviews
                                ? Math.round(((ratingDist.find((r) => r.rating === 3)?.count ?? 0) / totalReviews) * 100)
                                : 0}% share
                            </span>
                          </div>

                          {/* Detractors */}
                          <div className="rounded-xl border border-[var(--dash-border)] bg-[var(--dash-inset)] p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--dash-muted)] block truncate">Detractors (1-2★)</span>
                            <span className="text-lg font-black text-[var(--dash-ink-complaint)] block mt-0.5">
                              {(ratingDist.find((r) => r.rating === 2)?.count ?? 0) + (ratingDist.find((r) => r.rating === 1)?.count ?? 0)}
                            </span>
                            <span className="text-[10px] font-semibold text-[var(--dash-muted)]">
                              {totalReviews
                                ? Math.round(
                                    (((ratingDist.find((r) => r.rating === 2)?.count ?? 0) +
                                      (ratingDist.find((r) => r.rating === 1)?.count ?? 0)) /
                                      totalReviews) *
                                      100
                                  )
                                : 0}% share
                            </span>
                          </div>
                        </div>

                        {/* Summary footer */}
                        <div className="mt-3 flex items-center justify-between text-xs px-1">
                          <span className="font-semibold text-[var(--dash-muted)]">Satisfaction Index:</span>
                          <span className="font-black" style={{ color: 'var(--dash-ink-rating)' }}>
                            {avgRating ? `${Math.round((avgRating / 5) * 100)}% CSAT (${avgRating} / 5.0)` : '—'}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* ── Recent Reviews (preview, click to see all) ──────────────── */}
                  <div className="mb-3 mt-8 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[var(--dash-accent)] shadow-xs inline-block" />
                      <h2 className="text-xs font-black uppercase tracking-[0.16em] text-[var(--dash-heading)]">
                        Recent Customer Reviews
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-[var(--dash-muted)]">
                      Live customer feedback feed with instant triage
                    </p>
                  </div>
                  <Card className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <SectionTitle>Live Feedback Feed</SectionTitle>
                      <button onClick={() => setTab('reviews')}
                        className="text-xs font-black hover:underline"
                        style={{ color: theme.accent }}>
                        View all reviews →
                      </button>
                    </div>
                    <ReviewsPanel reviews={recentReviews.slice(0, 6)} />
                  </Card>

                  <p className="text-center text-slate-700 text-xs mt-8">
                    NexusAgent · Customer Review Analytics · © {new Date().getFullYear()}
                  </p>
                </>
      )}

                {tab === 'reviews' && (
                  <Card>
                    <SectionTitle>All Reviews — Follow-up Tracker</SectionTitle>
                    <ReviewsPanel reviews={recentReviews} />
                  </Card>
                )}

                {tab === 'shops' && <ShopsPanel />}

                {tab === 'reports' && (
                  <ReportsTab
                    shops={shops.map((s) => ({ id: s.id, name: s.name, city: s.city ?? null }))}
                    isAdmin={session.role === 'admin'}
                  />
                )}
            </div>
          </div>
        )
}

        // ── ShopsPanel ─────────────────────────────────────────────────────────────────

        interface ShopRow {
          id: string
        tenantId: string
        name: string
        city: string | null
        state: string | null
        town: string | null
        address: string | null
        phone: string | null
        mobile: string | null
        email: string | null
        lat: number | null
        lng: number | null
        branchCode: string | null
        createdAt: string
}

        // Shape of the edit form while the user is editing a shop
        interface EditFormState {
          name: string
        city: string
        state: string
        town: string
        address: string
        phone: string
        mobile: string
        email: string
        lat: string
        lng: string
}

        function shopToForm(shop: ShopRow): EditFormState {
  return {
          name:    shop.name,
        city:    shop.city    ?? '',
        state:   shop.state   ?? '',
        town:    shop.town    ?? '',
        address: shop.address ?? '',
        phone:   shop.phone   ?? '',
        mobile:  shop.mobile  ?? '',
        email:   shop.email   ?? '',
        lat:     shop.lat     !== null ? String(shop.lat) : '',
        lng:     shop.lng     !== null ? String(shop.lng) : '',
  }
}

        // ── Single shop card (view mode) ───────────────────────────────────────────────
        function ShopViewCard({
          shop,
          onEdit,
}: {
          shop: ShopRow
  onEdit: () => void
}) {
  return (
        <div className={`${surfaceCls} rounded-xl p-5 flex flex-col gap-3`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 break-words">🏪 {shop.name}</p>
              {shop.branchCode && (
                <p className="text-xs text-slate-500 mt-0.5">Code: {shop.branchCode}</p>
              )}
            </div>
            <button
              onClick={onEdit}
              className="shrink-0 px-3 py-1 bg-white hover:bg-blue-50 text-xs text-slate-600 hover:text-blue-700 rounded-lg transition-colors font-semibold border border-slate-200"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-500">
            {shop.state && <span>📍 {shop.state}</span>}
            {shop.city && <span>🏙️ {shop.city}</span>}
            {shop.town && <span>🗺️ {shop.town}</span>}
            {shop.address && <span className="sm:col-span-2 text-slate-600 break-words">{shop.address}</span>}
            {shop.phone && <span>📞 {shop.phone}</span>}
            {shop.mobile && <span>📱 {shop.mobile}</span>}
            {shop.email && <span className="sm:col-span-2 break-words">✉️ {shop.email}</span>}
            {(shop.lat !== null && shop.lng !== null) && (
              <span className="sm:col-span-2">
                🌐 {shop.lat?.toFixed(5)}, {shop.lng?.toFixed(5)}
              </span>
            )}
          </div>
        </div>
        )
}

        // ── Single shop card (edit mode) ───────────────────────────────────────────────
        function ShopEditCard({
          shop,
          onSaved,
          onCancel,
}: {
          shop: ShopRow
  onSaved: (updated: ShopRow) => void
  onCancel: () => void
}) {
  const [form, setForm]       = useState<EditFormState>(shopToForm(shop))
          const [saving, setSaving]   = useState(false)
          const [toast, setToast]     = useState(false)
          const [errMsg, setErrMsg]   = useState<string | null>(null)

          // Derive city list based on selected state
          const cityOptions: string[] = form.state ? (CITIES_BY_PROVINCE[form.state] ?? []) : []
          const freeCityInput = cityOptions.length === 0

          function set(field: keyof EditFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }))
          }
  }

          // If state changes, reset city only if the current city is not in the new list
          function handleStateChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newState = e.target.value
            const newCities = CITIES_BY_PROVINCE[newState] ?? []
    setForm((prev) => ({
              ...prev,
              state: newState,
            city: newCities.includes(prev.city) ? prev.city : '',
    }))
  }

            function detectLocation() {
    if (!navigator.geolocation) return
            navigator.geolocation.getCurrentPosition(
      (pos) => {
              setForm((prev) => ({
                ...prev,
                lat: String(pos.coords.latitude),
                lng: String(pos.coords.longitude),
              }))
            },
      () => { /* ignore errors silently */},
            )
  }

            async function handleSave() {
              setSaving(true)
    setErrMsg(null)
            try {
      const res = await fetch(`/api/shops/${shop.id}`, {
              method: 'PATCH',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify({
              name:    form.name,
            city:    form.city,
            state:   form.state,
            town:    form.town,
            address: form.address,
            phone:   form.phone,
            mobile:  form.mobile,
            email:   form.email,
            lat:     form.lat,
            lng:     form.lng,
        }),
      })
            const data = await res.json() as ShopRow & {error ?: string}
            if (!res.ok) {
              setErrMsg(data.error ?? 'Save failed')
        return
      }
            onSaved(data)
            setToast(true)
      setTimeout(() => setToast(false), 2500)
    } catch {
              setErrMsg('Network error. Please try again.')
            } finally {
              setSaving(false)
            }
  }

            const shopInputCls = 'w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-600 transition-colors'
            const labelCls = 'block text-xs text-slate-600 mb-1'

            return (
            <div className={`${surfaceCls} rounded-xl p-5 flex flex-col gap-4 ring-4 ring-blue-50`}>
              {/* Success toast */}
              {toast && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg text-center">
                  Saved!
                </div>
              )}
              {errMsg && (
                <p role="alert" className="text-sm text-red-700">{errMsg}</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor={`shop-name-${shop.id}`} className={labelCls}>Name</label>
                  <input id={`shop-name-${shop.id}`} type="text" value={form.name} onChange={set('name')} className={shopInputCls} />
                </div>

                {/* Branch Code — readonly */}
                <div>
                  <label htmlFor={`shop-branch-code-${shop.id}`} className={labelCls}>Branch Code</label>
                  <input id={`shop-branch-code-${shop.id}`} type="text" value={shop.branchCode ?? ''} disabled readOnly className={`${shopInputCls} opacity-60 cursor-not-allowed bg-slate-50`} />
                </div>

                {/* State/Province */}
                <div>
                  <label htmlFor={`shop-province-state-${shop.id}`} className={labelCls}>Province / State</label>
                  <select id={`shop-province-state-${shop.id}`} value={form.state} onChange={handleStateChange} className={shopInputCls}>
                    <option value="">— Select province —</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* City — dropdown if province has cities, otherwise free text */}
                <div>
                  <label htmlFor={`shop-city-${shop.id}`} className={labelCls}>City</label>
                  {freeCityInput ? (
                    <input id={`shop-city-${shop.id}`} type="text" value={form.city} onChange={set('city')} placeholder="Enter city" className={shopInputCls} />
                  ) : (
                    <select id={`shop-city-${shop.id}`} value={form.city} onChange={set('city')} className={shopInputCls}>
                      <option value="">— Select city —</option>
                      {cityOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Town */}
                <div>
                  <label htmlFor={`shop-town-area-${shop.id}`} className={labelCls}>Town / Area</label>
                  <input id={`shop-town-area-${shop.id}`} type="text" value={form.town} onChange={set('town')} placeholder="e.g. Model Town" className={shopInputCls} />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor={`shop-phone-${shop.id}`} className={labelCls}>Phone</label>
                  <input id={`shop-phone-${shop.id}`} type="text" value={form.phone} onChange={set('phone')} placeholder="+92 XX XXXXXXX" className={shopInputCls} />
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor={`shop-mobile-${shop.id}`} className={labelCls}>Mobile</label>
                  <input id={`shop-mobile-${shop.id}`} type="text" value={form.mobile} onChange={set('mobile')} placeholder="+92 3XX XXXXXXX" className={shopInputCls} />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor={`shop-email-${shop.id}`} className={labelCls}>Email</label>
                  <input id={`shop-email-${shop.id}`} type="email" value={form.email} onChange={set('email')} placeholder="shop@example.com" className={shopInputCls} />
                </div>

                {/* Address — full width */}
                <div className="sm:col-span-2">
                  <label htmlFor={`shop-address-${shop.id}`} className={labelCls}>Address</label>
                  <textarea id={`shop-address-${shop.id}`} rows={2} value={form.address} onChange={set('address')} placeholder="Street address" className={shopInputCls} />
                </div>

                {/* Latitude */}
                <div>
                  <label htmlFor={`shop-latitude-${shop.id}`} className={labelCls}>Latitude</label>
                  <input id={`shop-latitude-${shop.id}`} type="number" step="0.000001" value={form.lat} onChange={set('lat')} placeholder="e.g. 33.6844" className={shopInputCls} />
                </div>

                {/* Longitude */}
                <div>
                  <label htmlFor={`shop-longitude-${shop.id}`} className={labelCls}>Longitude</label>
                  <input id={`shop-longitude-${shop.id}`} type="number" step="0.000001" value={form.lng} onChange={set('lng')} placeholder="e.g. 73.0479" className={shopInputCls} />
                </div>

                {/* Detect location button — full width */}
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-xs text-slate-700 rounded-lg border border-slate-300 transition-colors"
                  >
                    📍 Detect Location
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1 flex-wrap">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={onCancel}
                  disabled={saving}
                  className="px-5 py-2 bg-white hover:bg-slate-50 text-sm text-slate-700 rounded-lg border border-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            )
}

            // ── ShopsPanel — fetches shops and renders the grid ───────────────────────────
            function ShopsPanel() {
  const [shops, setShops]     = useState<ShopRow[]>([])
            const [loading, setLoading] = useState(true)
            const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
              fetch('/api/shops')
                .then((r) => r.json())
                .then((data: ShopRow[]) => setShops(data))
                .catch(() => { /* silently fail — shops will just remain empty */ })
                .finally(() => setLoading(false))
            }, [])

            function handleSaved(updated: ShopRow) {
              setShops((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    setEditingId(null)
  }

            if (loading) {
    return (
            <div role="status" className="flex items-center gap-3 py-16 text-[var(--dash-muted)] text-sm justify-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Loading shops…
            </div>
            )
  }

            if (shops.length === 0) {
    return (
            <div className="py-16 text-center">
              <p className="text-[var(--dash-muted)] text-sm">No shops found.</p>
            </div>
            )
  }

            return (
            <div>
              <SectionTitle>🏪 Shop Management</SectionTitle>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {shops.map((shop) =>
                  editingId === shop.id ? (
                    <ShopEditCard
                      key={shop.id}
                      shop={shop}
                      onSaved={handleSaved}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <ShopViewCard
                      key={shop.id}
                      shop={shop}
                      onEdit={() => setEditingId(shop.id)}
                    />
                  ),
                )}
              </div>
            </div>
            )
}
