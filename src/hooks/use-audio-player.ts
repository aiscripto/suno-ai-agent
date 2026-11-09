'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseAudioPlayerOptions {
  requestHeaders?: Record<string, string>
  onPlaybackStart?: () => void
  onPlaybackEnd?:   () => void
  onPlaybackError?: (message: string) => void
}

interface UseAudioPlayerReturn {
  isPlaying:  boolean
  enqueue:    (text: string) => void
  stopAll:    () => void
}

/**
 * Sentence-pipeline audio player.
 *
 * Maintains an ordered queue of text sentences.
 * For each sentence it:
 *   1. Fetches audio from /api/speak
 *   2. Plays it immediately via HTML Audio
 *   3. Advances to the next sentence when done
 *
 * This creates a low-latency pipeline: the first sentence plays while
 * subsequent sentences are still being fetched.
 */
export function useAudioPlayer({
  requestHeaders,
  onPlaybackStart,
  onPlaybackEnd,
  onPlaybackError,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false)

  const queueRef      = useRef<string[]>([])
  const playingRef    = useRef(false)
  const currentAudio  = useRef<HTMLAudioElement | null>(null)
  const currentFinish = useRef<(() => void) | null>(null)
  const abortRef      = useRef(false)
  // Each playback loop gets a generation; a stopped loop that wakes up later
  // must not touch state that now belongs to a newer loop.
  const genRef        = useRef(0)
  const fetchCtrlRef  = useRef(new AbortController())
  const requestHeadersRef = useRef<Record<string, string>>(requestHeaders ?? {})
  const onPlaybackErrorRef = useRef(onPlaybackError)
  requestHeadersRef.current = requestHeaders ?? {}
  onPlaybackErrorRef.current = onPlaybackError

  const fetchBlob = useCallback(async (text: string): Promise<Blob | null> => {
    const ctrl = new AbortController()
    fetchCtrlRef.current = ctrl
    try {
      const res = await fetch('/api/speak', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...requestHeadersRef.current },
        body:    JSON.stringify({ text }),
        signal:  ctrl.signal,
      })
      if (!res.ok || ctrl.signal.aborted) {
        let message = `Speech playback failed (${res.status})`
        try {
          const data = await res.json()
          if (typeof data?.error === 'string') message = data.error
        } catch {}
        onPlaybackErrorRef.current?.(message)
        return null
      }
      return await res.blob()
    } catch {
      return null
    }
  }, [])

  const processQueue = useCallback(async () => {
    if (playingRef.current) return
    if (queueRef.current.length === 0) return

    const gen = ++genRef.current
    playingRef.current = true
    abortRef.current   = false
    setIsPlaying(true)
    onPlaybackStart?.()

    // Prefetch the first sentence immediately
    let prefetched: Promise<Blob | null> = fetchBlob(queueRef.current[0])

    while (queueRef.current.length > 0 && !abortRef.current) {
      queueRef.current.shift()  // advance queue; blob already prefetched above

      // Wait for the already-in-flight fetch (started either above or at end of last iteration)
      const blob = await prefetched
      if (abortRef.current) break
      if (!blob) continue

      // Kick off the NEXT sentence fetch while we play the current one
      if (queueRef.current.length > 0) {
        prefetched = fetchBlob(queueRef.current[0])
      }

      const url = URL.createObjectURL(blob)
      await new Promise<void>((resolve) => {
        const audio = new Audio(url)
        currentAudio.current = audio

        // One way out for ended, error and stopAll(): always revoke the blob
        // URL and settle the promise, so an interrupt leaves nothing behind.
        const finish = () => {
          URL.revokeObjectURL(url)
          currentAudio.current = null
          currentFinish.current = null
          resolve()
        }
        currentFinish.current = finish
        audio.onended = finish
        audio.onerror = finish
        audio.play().catch(finish)
      })
    }

    if (gen !== genRef.current) return   // superseded by stopAll() or a newer loop
    const stopped = abortRef.current
    playingRef.current = false
    setIsPlaying(false)
    // A deliberate stopAll() (interrupt, end) is not "playback finished":
    // reporting it would flip the phase back to idle under the caller.
    if (!stopped) onPlaybackEnd?.()
  }, [fetchBlob, onPlaybackStart, onPlaybackEnd])

  const enqueue = useCallback(
    (text: string) => {
      if (!text.trim()) return
      queueRef.current.push(text)
      processQueue()
    },
    [processQueue]
  )

  const stopAll = useCallback(() => {
    fetchCtrlRef.current.abort()
    abortRef.current = true
    genRef.current++
    queueRef.current = []

    if (currentAudio.current) {
      currentAudio.current.pause()
      currentAudio.current = null
    }
    currentFinish.current?.()

    playingRef.current = false
    setIsPlaying(false)
  }, [])

  useEffect(() => stopAll, [stopAll])

  return { isPlaying, enqueue, stopAll }
}
