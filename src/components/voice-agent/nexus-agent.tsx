'use client'

import { memo, useRef, useEffect, useState, useCallback, useId, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { useVoiceAgent }    from '@/hooks/use-voice-agent'
import { useTypingSound }   from '@/hooks/use-typing-sound'
import { AnimatedAvatar }   from './avatar'
import type { VoiceThemeName } from './theme-provider'
import { COPY, uiLangFor } from './copy'

// The accent stays the tenant/theme colour for the whole call. The agent's
// classification (sentiment, complaint, lead) is for managers on the dashboard;
// the customer never sees it reflected in colour or labels.
const DEFAULT_COLOR = '#00E5FF'
const ARABIC_SCRIPT = /[\u0600-\u06FF]/

// ── Theme system ───────────────────────────────────────────────────────────────
const THEMES: VoiceThemeName[] = ['nexus', 'daylight', 'emerald', 'ember']

// ── Timing ─────────────────────────────────────────────────────────────────────
const IDLE_WARNING_AFTER_MS = 60_000   // silence before we ask "are you still there?"
const IDLE_WARNING_SECS     = 15       // grace period on that question before reset
const SAVE_SLOW_AFTER_MS    = 20_000   // when "saving" starts to feel stuck
const RESET_SECS_WITH_TICKET = 20      // long enough to note a ticket ID
const RESET_SECS_DEFAULT     = 10

// ── Public interface ───────────────────────────────────────────────────────────
interface Props { tenantId?: string; token?: string; shopCode?: string; shopName?: string }

const RECORDING_LIMIT_SECS = 60

function formatClock(totalSecs: number): string {
  const safe = Math.max(0, totalSecs)
  const mm = Math.floor(safe / 60)
  const ss = (safe % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

// Session wrapper — remounts NexusAgentInner on reset to avoid a full page reload.
export function NexusAgent(props: Props) {
  const [sessionKey, setSessionKey] = useState(0)
  const handleReset = useCallback(() => setSessionKey(k => k + 1), [])

  // Chrome extensions that react to microphone / SpeechRecognition activity
  // (Grammarly, Google Translate, Speechify, etc.) use chrome.runtime messaging
  // internally. When their service-worker channel closes during React re-renders
  // Chrome logs an "Uncaught (in promise)" to the active tab's console even
  // though the error originates entirely inside the extension, not our code.
  // Intercepting unhandledrejection lets us suppress that noise while the
  // voice agent is mounted without masking any errors from our own code.
  useEffect(() => {
    function suppressExtensionChannelNoise(e: PromiseRejectionEvent) {
      const msg: string = e.reason?.message ?? ''
      if (
        msg.includes('message channel closed') ||
        msg.includes('listener indicated an asynchronous response')
      ) {
        e.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', suppressExtensionChannelNoise)
    return () => window.removeEventListener('unhandledrejection', suppressExtensionChannelNoise)
  }, [])

  return <NexusAgentInner key={sessionKey} {...props} onReset={handleReset} />
}

// ── Inner component ────────────────────────────────────────────────────────────
function NexusAgentInner({ tenantId, token, shopCode, shopName, onReset }: Props & { onReset: () => void }) {
  // Shop validation is handled server-side (resolveReviewShop in /api/summarize).
  // A missing shopCode is the only case where we block the UI.
  const validShop = Boolean(shopCode)

  const {
    phase, transcript, partialReply, error, errorKind,
    isRecording, isPlaying,
    agentName, companyName,
    language, setLanguage,
    reviewData, callSummary,
    toggleMic, endCall, sendText, retrySave,
  } = useVoiceAgent({
    tenantId,
    token,
    shopCode,
    defaultOutputMode: 'voice',
    continuousRecording: true,
    webSpeech: false,
    browserTts: false,
  })

  const uiLang = uiLangFor(language)
  const t      = COPY[uiLang]
  const agent  = agentName || 'The agent'

  const transcriptRef = useRef<HTMLDivElement>(null)
  const doneTitleRef  = useRef<HTMLHeadingElement>(null)
  const endTimerRef    = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const resetTickRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idleTimerRef   = useRef<ReturnType<typeof setTimeout>  | null>(null)
  const endCallRef     = useRef(endCall)
  const toggleMicRef   = useRef(toggleMic)

  const [recordSecs,           setRecordSecs]           = useState(0)
  const [endStep,              setEndStep]              = useState<'sending' | 'confirmed' | null>(null)
  // null = countdown paused by the user ("Keep this screen")
  const [resetSecs,            setResetSecs]            = useState<number | null>(RESET_SECS_DEFAULT)
  const [saveSlow,             setSaveSlow]             = useState(false)
  const [themeColor,           setThemeColor]           = useState(DEFAULT_COLOR)
  const [showIncompletePrompt, setShowIncompletePrompt] = useState(false)
  // Seconds left on the "Are you still there?" question; null = not shown
  const [idleWarningSecs,      setIdleWarningSecs]      = useState<number | null>(null)
  const [typeOpen,             setTypeOpen]             = useState(false)
  const [pageHidden,           setPageHidden]           = useState(false)
  const [typedText,            setTypedText]            = useState('')
  // Status-text fade: track displayed text separately so we can cross-fade
  const [statusText,           setStatusText]           = useState('')
  const [statusOpacity,        setStatusOpacity]        = useState(1)

  const spokenTurns     = transcript.filter((m) => m.role === 'user').length
  const hasCustomerTurn = spokenTurns > 0

  useEffect(() => {
    endCallRef.current = endCall
    toggleMicRef.current = toggleMic
  }, [endCall, toggleMic])

  // Sync --nx-accent → themeColor and data-va-theme → activeTheme via MutationObserver.
  // The observer covers both direct attribute changes and postMessage-driven style updates
  // (ThemeProvider calls root.style.setProperty which triggers the 'style' attribute watch).
  useEffect(() => {
    const readAccent = () => {
      const root  = document.documentElement
      const value = getComputedStyle(root).getPropertyValue('--nx-accent').trim()
      if (/^#[0-9a-fA-F]{6}$/.test(value)) setThemeColor(value)
      const t = root.dataset.vaTheme
      if (t && !THEMES.includes(t as VoiceThemeName)) root.dataset.vaTheme = 'nexus'
    }

    readAccent()
    const observer = new MutationObserver(readAccent)
    observer.observe(document.documentElement, {
      attributes:     true,
      attributeFilter: ['style', 'data-va-theme'],
    })
    return () => observer.disconnect()
  }, [])

  // Pause ambient motion while the tab/app is in the background.
  useEffect(() => {
    const sync = () => setPageHidden(document.visibilityState === 'hidden')
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [])

  // Auto-scroll transcript
  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [transcript, partialReply])

  // Session countdown — hard cap for the full interaction.
  // Resets only when phase returns to 'connecting' (new session).

  // Per-turn recording cap — prevents unlimited speech, but submits the turn
  // to the agent instead of ending the whole call.
  useEffect(() => {
    if (!isRecording) {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current)
        recordTimerRef.current = null
      }
      setRecordSecs(0)
      return
    }

    setRecordSecs(0)
    recordTimerRef.current = setInterval(() => {
      setRecordSecs((s) => {
        if (s >= RECORDING_LIMIT_SECS - 1) {
          if (recordTimerRef.current) {
            clearInterval(recordTimerRef.current)
            recordTimerRef.current = null
          }
          toggleMicRef.current()
          return RECORDING_LIMIT_SECS
        }
        return s + 1
      })
    }, 1000)

    return () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current)
        recordTimerRef.current = null
      }
    }
  }, [isRecording])

  // Typing sound — fires blips as agent reply streams in
  const { onTextGrow } = useTypingSound(true)
  useEffect(() => { onTextGrow(partialReply) }, [partialReply, onTextGrow])

  // Timers are owned by this component instance; clear them only on unmount.
  // (Clearing them on every phase change is what used to strand the end screen.)
  useEffect(() => () => {
    if (endTimerRef.current)  clearTimeout(endTimerRef.current)
    if (resetTickRef.current) clearInterval(resetTickRef.current)
  }, [])

  // Interval only decrements — never calls onReset() inside a state updater
  // (calling a parent setState inside a child updater violates React's rules).
  function startResetCountdown(secs: number) {
    if (resetTickRef.current) clearInterval(resetTickRef.current)
    setResetSecs(secs)
    resetTickRef.current = setInterval(() => {
      setResetSecs(s => (s === null ? null : Math.max(0, s - 1)))
    }, 1000)
  }

  function keepEndScreen() {
    if (resetTickRef.current) { clearInterval(resetTickRef.current); resetTickRef.current = null }
    setResetSecs(null)
  }

  // onReset fires in an effect (post-render), not inside the updater
  useEffect(() => {
    if (resetSecs === 0 && endStep === 'confirmed') {
      if (resetTickRef.current) { clearInterval(resetTickRef.current); resetTickRef.current = null }
      onReset()
    }
  }, [resetSecs, endStep, onReset])

  // Step 1 — once the call has ended AND the agent has finished its last
  // sentence, show "Saving…". Every path (positive or not) waits for the save
  // result; nothing is confirmed before the server has confirmed it.
  useEffect(() => {
    // A save error can arrive before the end screen opened (e.g. while the last
    // sentence was still playing); it must still land on the end screen.
    const callOver = phase === 'ended' || errorKind === 'save'
    if (!callOver || isPlaying || endStep !== null) return
    // Nothing was said, so nothing is being saved: start fresh instead of
    // showing a "saving" screen that would never resolve.
    if (!hasCustomerTurn) { onReset(); return }
    setEndStep('sending')
  }, [phase, errorKind, isPlaying, endStep, hasCustomerTurn, onReset])

  // While saving, flag it as slow after a while so the screen can say so
  // honestly (and offer a way out) instead of pretending it succeeded.
  useEffect(() => {
    if (endStep !== 'sending' || phase !== 'ended') { setSaveSlow(false); return }
    const t = setTimeout(() => setSaveSlow(true), SAVE_SLOW_AFTER_MS)
    return () => clearTimeout(t)
  }, [endStep, phase])

  // Step 2 — the save succeeded: brief hold, then the confirmation screen.
  useEffect(() => {
    if (endStep !== 'sending' || !callSummary) return
    const hold = reviewData.sentiment === 'positive' ? 400 : 1500
    endTimerRef.current = setTimeout(() => {
      setEndStep('confirmed')
      startResetCountdown(callSummary.ticket ? RESET_SECS_WITH_TICKET : RESET_SECS_DEFAULT)
    }, hold)
    return () => { if (endTimerRef.current) clearTimeout(endTimerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callSummary, endStep])

  // The confirmation replaces the whole main UI; move focus to its heading so
  // keyboard and screen-reader users land on "Thank you" instead of <body>.
  useEffect(() => {
    if (endStep === 'confirmed') doneTitleRef.current?.focus()
  }, [endStep])

  // Dismiss incomplete prompt automatically if the user picks up the mic again
  useEffect(() => {
    if (phase !== 'idle') setShowIncompletePrompt(false)
  }, [phase])

  // Idle — after 60 s of silence, ask "Are you still there?" instead of wiping
  // the session. Any activity (or the question being answered) cancels it.
  useEffect(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null }
    if (phase !== 'idle' || endStep !== null || typeOpen) { setIdleWarningSecs(null); return }
    idleTimerRef.current = setTimeout(() => setIdleWarningSecs(IDLE_WARNING_SECS), IDLE_WARNING_AFTER_MS)
    return () => { if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null } }
  }, [phase, endStep, typeOpen])

  // Count the question down; reset only if nobody answers it.
  useEffect(() => {
    if (idleWarningSecs === null) return
    if (idleWarningSecs <= 0) { setIdleWarningSecs(null); onReset(); return }
    const t = setTimeout(() => setIdleWarningSecs(s => (s === null ? null : s - 1)), 1000)
    return () => clearTimeout(t)
  }, [idleWarningSecs, onReset])

  // A blocked microphone means the customer can only continue by typing.
  useEffect(() => {
    if (errorKind === 'mic') setTypeOpen(true)
  }, [errorKind])

  // Status-text cross-fade: fade out → swap text → fade in on every phase change.
  // Error detail lives in the alert banner, so the status line stays short.
  useEffect(() => {
    const next = t.status(phase, agent)
    setStatusOpacity(0)
    const timer = setTimeout(() => { setStatusText(next); setStatusOpacity(1) }, 130)
    return () => clearTimeout(timer)
  }, [phase, t, agent])

  function submitTyped(e: FormEvent) {
    e.preventDefault()
    const text = typedText.trim()
    if (!text) return
    sendText(text)
    setTypedText('')
  }

  const color = themeColor
  const busy  = phase === 'thinking' || phase === 'transcribing' || phase === 'connecting'
  // "Calm until it is spoken to": the ambient background moves only while a
  // conversation is actually happening, and never in a hidden tab.
  const conversing = isRecording || phase === 'listening' || phase === 'transcribing'
    || phase === 'thinking' || phase === 'speaking'
  const motion = conversing && !pageHidden ? 'live' : 'calm'

  const recordingRemaining = RECORDING_LIMIT_SECS - recordSecs
  const recordingCountdown = formatClock(recordingRemaining)

  // SVG progress arc — depletes as time is used
  const R    = 68
  const CIRC = 2 * Math.PI * R
  const dash = CIRC * (recordSecs / RECORDING_LIMIT_SECS)
  const agentInitial = (agentName || 'AI').trim().charAt(0).toUpperCase()
  const ticket = callSummary?.ticket ?? null
  // After the call ends, an error can only mean the save failed.
  const saveFailed = endStep !== null && phase === 'error'
  const canType = phase === 'idle' || phase === 'error'
  const micBlocked = errorKind === 'mic'
  const lastAgentReply = [...transcript].reverse().find((m) => m.role === 'assistant')?.content ?? ''
  // The arc shows the whole minute; the numbers only appear for the last 15 s.
  const showTurnCountdown = isRecording && recordingRemaining <= 15
  const speaking = phase === 'speaking'
  const handleManualEnd = useCallback(() => {
    // Already ending — nothing to do
    if (phase === 'ended' || endStep !== null) return

    // During processing or recording: abort and end immediately — always honour the request
    if (busy || isRecording) {
      endCall()
      return
    }

    // Nothing spoken yet → just restart (no data to save)
    if (!hasCustomerTurn) {
      onReset()
      return
    }

    // User has spoken but agent hasn't classified the request yet → warn before ending
    if (!reviewData.sentiment) {
      setShowIncompletePrompt(true)
      return
    }

    // Context is clear → end and process normally
    endCall()
  }, [busy, endCall, endStep, hasCustomerTurn, isRecording, onReset, phase, reviewData.sentiment])

  return (
    <div className="nx-root" data-motion={motion} lang={uiLang} dir={uiLang === 'ur' ? 'rtl' : 'ltr'}>

      {/* ── Animated background ─────────────────────────────────────────── */}
      <NxBg />

      {/* ════ SHOP NOT CONFIGURED ════════════════════════════════════════ */}
      {!validShop && (
        <div className="nx-shop-required">
          <div className="nx-shop-card">
            <div className="nx-shop-icon">AI</div>
            <h2 className="nx-shop-title">{t.unconfigured.title}</h2>
            <p className="nx-shop-body">{t.unconfigured.body}</p>
          </div>
        </div>
      )}

      {/* ════ SAVE FAILED ═══════════════════════════════════════════════ */}
      {/* Any error after the call ended is a failed save. Shown whatever     */}
      {/* end step we were on, so the screen can never be left without controls. */}
      {validShop && saveFailed && (
        <div className="nx-end-screen">
          <div className="nx-conf-card nx-conf-card--error" role="alert">
            <div className="nx-conf-icon nx-conf-icon--error">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" aria-hidden="true"
                   stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="nx-conf-title nx-conf-title--error">{t.failed.title}</h1>
            <p className="nx-conf-msg">{t.errors.save}</p>
            <p className="nx-conf-msg">{t.failed.staff}</p>
            <div className="nx-end-actions">
              <button type="button" className="nx-action-btn nx-action-btn--primary" onClick={retrySave}>
                {t.failed.retry}
              </button>
              <button type="button" className="nx-action-btn" onClick={onReset}>
                {t.newConversation}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ STEP 1: SAVING ════════════════════════════════════════════ */}
      {validShop && endStep === 'sending' && !saveFailed && (
        <div className="nx-end-screen" role="status" aria-live="polite">
          {saveSlow ? (
            /* ── Taking too long: say so, and let the customer move on ── */
            <div className="nx-conf-card">
              <h1 className="nx-conf-title">{t.saving.slowTitle}</h1>
              <p className="nx-conf-msg">{t.saving.slowBody}</p>
              <div className="nx-end-actions">
                <button type="button" className="nx-action-btn" onClick={onReset}>
                  {t.newConversation}
                </button>
              </div>
            </div>
          ) : (
            /* ── Normal sending animation ── */
            <>
              <div className="nx-send-wrap" aria-hidden="true">
                <div className="nx-send-ring nx-sr1" style={{ borderColor: color }} />
                <div className="nx-send-ring nx-sr2" style={{ borderColor: color }} />
                <div className="nx-send-ring nx-sr3" style={{ borderColor: color }} />
                <div className="nx-send-orb"
                     style={{
                       background: `radial-gradient(circle at 35% 30%, ${color}55, ${color}18 60%, ${color}06)`,
                       boxShadow:  `0 0 0 2px ${color}40, 0 0 50px ${color}28`,
                     }}>
                  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none"
                       stroke={color} strokeWidth={1.8} strokeLinecap="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
              </div>
              <p className="nx-send-title">{t.saving.title}</p>
              <p className="nx-send-sub">{t.saving.body}</p>
              <div className="nx-send-dots" aria-hidden="true">
                <span style={{ background: color }} />
                <span style={{ background: color }} />
                <span style={{ background: color }} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ════ STEP 2: CONFIRMED ══════════════════════════════════════════ */}
      {validShop && endStep === 'confirmed' && !saveFailed && (
        <div className="nx-end-screen">
          <div className="nx-conf-card">

            <div className="nx-conf-icon" style={{ borderColor: color + '50', color }}>
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none"
                   stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 ref={doneTitleRef} tabIndex={-1} className="nx-conf-title" style={{ color }}>
              {t.done.title}
            </h1>

            <p className="nx-conf-msg">
              {t.done.body}
            </p>


            {ticket && (
              <div className="nx-ticket-card" style={{ borderColor: color + '36' }}>
                <span className="nx-ticket-label">{t.done.reference}</span>
                <strong style={{ color }}>{ticket.id}</strong>
                <p className="nx-ticket-note">{t.done.referenceNote}</p>
              </div>
            )}




            <div className="nx-end-actions">
              <button type="button" className="nx-action-btn nx-action-btn--primary" onClick={onReset}>
                {t.newConversation}
              </button>
              {resetSecs !== null && (
                <button type="button" className="nx-action-btn" onClick={keepEndScreen}>
                  {t.done.keep}
                </button>
              )}
            </div>

            <p className="nx-reset-hint" aria-live="off">
              {resetSecs !== null
                ? <>{t.done.resetIn(resetSecs)}</>
                : <>{t.done.stays}</>}
            </p>
          </div>
        </div>
      )}

      {/* ════ MAIN UI ══════════════════════════════════════════════════════ */}
      {/* Gate on endStep===null so a save failure stays on the end screen    */}
      {/* rather than regressing to the voice UI.                              */}
      {validShop && endStep === null && (
        <div className="nx-content relative">

          {/* ── Error banner ────────────────────────────────────────────── */}
          {phase === 'error' && error && (
            <div className="nx-err-banner" role="alert">
              <span className="nx-err-text">{errorKind ? t.errors[errorKind] : error}</span>
              {errorKind === 'mic' && !typeOpen && (
                <button type="button" className="nx-err-action" onClick={() => setTypeOpen(true)}>
                  {t.typeInstead}
                </button>
              )}
              {(errorKind === 'network' || errorKind === 'general') && (
                <button type="button" className="nx-err-action" onClick={toggleMic}>
                  {t.failed.retry}
                </button>
              )}
            </div>
          )}

          {/* ── Idle check: ask before wiping the session ─────────────────── */}
          {idleWarningSecs !== null && (
            <NxDialog
              title={t.idle.title}
              onDismiss={() => setIdleWarningSecs(null)}
            >
              <p className="nx-dialog-text">{t.idle.body(idleWarningSecs)}</p>
              <div className="nx-dialog-actions">
                <button type="button" className="nx-action-btn nx-action-btn--primary"
                        data-autofocus onClick={() => setIdleWarningSecs(null)}>
                  {t.idle.stay}
                </button>
                <button type="button" className="nx-action-btn" onClick={onReset}>
                  {t.idle.restart}
                </button>
              </div>
            </NxDialog>
          )}

          {/* ── Incomplete-request prompt ─────────────────────────────────── */}
          {showIncompletePrompt && (
            <NxDialog
              title={t.endConfirm.title}
              onDismiss={() => setShowIncompletePrompt(false)}
            >
              <p className="nx-dialog-text">{t.endConfirm.body}</p>
              <div className="nx-dialog-actions">
                <button type="button" className="nx-action-btn nx-action-btn--primary"
                        data-autofocus onClick={() => setShowIncompletePrompt(false)}>
                  {t.endConfirm.keep}
                </button>
                <button type="button" className="nx-action-btn nx-action-btn--danger"
                        onClick={() => { setShowIncompletePrompt(false); endCall() }}>
                  {t.endConfirm.end}
                </button>
              </div>
            </NxDialog>
          )}

          {/* ── Header ──────────────────────────────────────────────────── */}
          <header className="nx-header">
            <div className="nx-hdr-l">
              <span className="nx-brand-mark" style={{ borderColor: color + '55', color }}>
                {agentInitial}
              </span>
              <span className="nx-hdr-copy">
                <span className="nx-company">{companyName || 'Customer Experience'}</span>
              </span>
            </div>

            <div className="nx-hdr-actions">
              <div className="nx-lang-toggle">
                <button
                  className={`nx-lang-btn ${language.toLowerCase() === 'english' ? 'nx-lang-active' : ''}`}
                  onClick={() => setLanguage('English')}
                  disabled={isRecording}
                  aria-pressed={language.toLowerCase() === 'english'}
                  lang="en" aria-label={t.aria.english}
                >EN</button>
                <button
                  className={`nx-lang-btn ${language.toLowerCase() === 'urdu' ? 'nx-lang-active' : ''}`}
                  onClick={() => setLanguage('Urdu')}
                  disabled={isRecording}
                  aria-pressed={language.toLowerCase() === 'urdu'}
                  lang="ur" dir="rtl" aria-label={t.aria.urdu}
                >اردو</button>
              </div>

              <button className="nx-header-end-btn" onClick={handleManualEnd} aria-label={t.aria.end}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
                     stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.08 4.18 2 2 0 0 1 4.06 2h3a2 2 0 0 1 2 1.72c.13.95.35 1.88.66 2.76a2 2 0 0 1-.45 2.11L8 9.86a16 16 0 0 0 6.14 6.14l1.27-1.27a2 2 0 0 1 2.11-.45c.88.31 1.81.53 2.76.66A2 2 0 0 1 22 16.92z" />
                  <path d="m2 2 20 20" />
                </svg>
                <span>{t.end}</span>
              </button>
            </div>
          </header>

          {/* Layout: DOM order is agent → conversation → controls, which is the
              reading order on a phone/counter tablet. On wide screens CSS grid
              places the controls under the agent, beside the conversation. */}
          <div className="nx-stage">
            <section className="nx-agent-strip" aria-label={agent} data-speaking={speaking || undefined}>
              <span className="nx-agent-avatar" aria-hidden="true">
                <AnimatedAvatar phase={phase} color={color} size="sm" />
              </span>
              <span className="nx-agent-id">
                <h1 className="nx-agent-title">{agentName || 'Review Agent'}</h1>
                {shopName && (
                  <span className="nx-shop-badge">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    {shopName}
                  </span>
                )}
              </span>
            </section>

            <section className="nx-convo" aria-labelledby="nx-convo-title">
              {/* Announce each finished reply once; the streaming bubble stays silent. */}
              <p className="sr-only" aria-live="polite" lang={ARABIC_SCRIPT.test(lastAgentReply) ? 'ur' : 'en'}>
                {lastAgentReply}
              </p>
              <h2 id="nx-convo-title" className="nx-convo-title">{t.conversation}</h2>
              <div ref={transcriptRef} className="nx-transcript scrollbar-thin">
                {transcript.length === 0 && phase !== 'connecting' && (
                  <div className="nx-empty">
                    <p className="nx-empty-t">{t.emptyTitle}</p>
                    <p className="nx-empty-s">{t.emptyBody}</p>
                  </div>
                )}

                {transcript.map((msg, i) => {
                  const isAgent = msg.role === 'assistant'
                  const isFirst = i === 0 || transcript[i - 1].role !== msg.role
                  return (
                    <div key={msg.id}
                         className={`nx-row ${isAgent ? 'nx-row-l' : 'nx-row-r'} ${isFirst ? 'nx-first' : ''}`}>
                      <div className={`nx-bubble ${isAgent ? 'nx-bbl-a' : 'nx-bbl-u'}`} dir="auto"
                           lang={ARABIC_SCRIPT.test(msg.content) ? 'ur' : 'en'}
                           style={!isAgent ? { borderColor: color + '38' } : {}}>
                        {msg.content}
                      </div>
                    </div>
                  )
                })}

                {partialReply && (
                  <div className="nx-row nx-row-l nx-first">
                    <div className="nx-bubble nx-bbl-a" dir="auto" lang={ARABIC_SCRIPT.test(partialReply) ? 'ur' : 'en'}>
                      {partialReply}
                      <span className="nx-cursor" style={{ background: color }} />
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="nx-dock" aria-label="Controls">
              {/* The one place that says what the agent is doing */}
              <p className="nx-status-txt" role="status" aria-live="polite"
                 style={{ opacity: statusOpacity, transition: 'opacity 0.13s ease' }}>
                {statusText || t.status(phase, agent)}
              </p>

              <div className="nx-btn-wrap">

                {isRecording && (
                  <>
                    <div className="nx-wr nx-wr1" style={{ borderColor: color }} />
                    <div className="nx-wr nx-wr2" style={{ borderColor: color }} />
                    <div className="nx-wr nx-wr3" style={{ borderColor: color }} />
                  </>
                )}

                {isRecording && (
                  <svg className="nx-arc" viewBox="0 0 150 150">
                    <circle cx="75" cy="75" r={R}
                      fill="none" stroke={color} strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray={`${CIRC - dash} ${dash}`}
                      transform="rotate(-90 75 75)"
                      opacity="0.82" />
                  </svg>
                )}

                <button
                  onClick={toggleMic}
                  disabled={busy}
                  className={`nx-btn ${isRecording ? 'nx-btn-rec' : busy ? 'nx-btn-busy' : 'nx-btn-idle'}${speaking ? ' nx-btn-speaking' : ''}${micBlocked && !isRecording ? ' nx-btn-blocked' : ''}`}
                  style={isRecording ? ({ '--nx-rec-color': color } as CSSProperties) : undefined}
                  aria-label={isRecording ? t.aria.stopAndSend
                    : phase === 'speaking' ? t.aria.interrupt
                    : t.aria.record}
                >
                  {isRecording ? (
                    <>
                      <span className="nx-rec-spectrum" aria-hidden>
                        {[0, 1, 2, 3, 4].map((i) => <span key={i} />)}
                      </span>
                      <svg viewBox="0 0 24 24" className="nx-bi nx-stop-icon">
                        <rect x="6" y="6" width="12" height="12" rx="3" fill="white" />
                      </svg>
                    </>
                  ) : busy ? (
                    <div className="nx-spin" style={{ borderTopColor: color }} />
                  ) : (
                    <svg viewBox="0 0 24 24" className="nx-bi" fill="none"
                         stroke="white" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                      <line x1="12" y1="19" x2="12" y2="23" />
                      <line x1="8"  y1="23" x2="16" y2="23" />
                    </svg>
                  )}

                  {isRecording && (
                    <span className="nx-recdot" style={{ background: color }} />
                  )}
                </button>
              </div>

              {showTurnCountdown && (
                <div className="nx-countdown-badge" style={{ borderColor: color + '55', color }}>
                  <span className="nx-countdown-time">{recordingCountdown}</span>
                  <span className="nx-countdown-sub">{t.timeLeft}</span>
                </div>
              )}

              {/* Action hint only: what tapping the button does now. The status line
                  above is the one place that says what the agent is doing. */}
              {!busy && (
                <p className="nx-btn-lbl">
                  {isRecording ? t.hint.send
                   : phase === 'speaking' ? t.hint.interrupt
                   : micBlocked ? t.hint.micOff
                   : t.hint.speak}
                </p>
              )}

              <div className="nx-end-policy">
                <span className="nx-close-cue">{t.closeCue}</span>
              </div>

              {/* Text fallback: for a blocked mic, a noisy shop, or anyone who prefers typing */}
              {typeOpen ? (
                <form className="nx-type-form" onSubmit={submitTyped}>
                  <label htmlFor="nx-type-input" className="sr-only">{t.typeLabel}</label>
                  <input
                    id="nx-type-input"
                    className="nx-type-input"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder={t.typePlaceholder}
                    dir="auto"
                    autoComplete="off"
                    maxLength={1000}
                    disabled={!canType}
                    autoFocus
                  />
                  <button type="submit" className="nx-action-btn nx-action-btn--primary"
                          disabled={!canType || !typedText.trim()}>
                    {t.send}
                  </button>
                </form>
              ) : (
                <button type="button" className="nx-type-toggle" onClick={() => setTypeOpen(true)}>
                  {t.typeInstead}
                </button>
              )}
            </section>
          </div>

        </div>
      )}
    </div>
  )
}

// Accessible modal: focus moves in (to [data-autofocus] or the first control),
// Tab stays inside, Escape dismisses, and focus returns to where it was.
function NxDialog({ title, onDismiss, children }: {
  title:     string
  onDismiss: () => void
  children:  ReactNode
}) {
  const panelRef   = useRef<HTMLDivElement>(null)
  const dismissRef = useRef(onDismiss)
  const titleId    = useId()
  useEffect(() => { dismissRef.current = onDismiss }, [onDismiss])

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const panel  = panelRef.current
    const focusables = () => Array.from(
      panel?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
    )
    const first = panel?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0]
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); dismissRef.current(); return }
      if (e.key !== 'Tab') return
      const items = focusables()
      if (items.length === 0) return
      const firstItem = items[0]
      const lastItem  = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) { e.preventDefault(); lastItem.focus() }
      else if (!e.shiftKey && document.activeElement === lastItem) { e.preventDefault(); firstItem.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  return (
    <div className="nx-dialog-backdrop">
      <div ref={panelRef} className="nx-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <h2 id={titleId} className="nx-dialog-title">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// Static markup; memoised so token streaming does not re-render nine layers.
const NxBg = memo(function NxBg() {
  return (
    <div className="nx-bg" aria-hidden>
      <div className="nx-grid" />
      <div className="nx-scanline" />
      <div className="nx-orbit nx-o1"><span /></div>
      <div className="nx-orbit nx-o2"><span /></div>
      <div className="nx-data-lane nx-dl1" />
      <div className="nx-data-lane nx-dl2" />
      <div className="nx-blob nx-b1" />
      <div className="nx-blob nx-b2" />
      <div className="nx-blob nx-b3" />
    </div>
  )
})
