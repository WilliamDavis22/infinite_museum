import { useCallback, useEffect, useRef, useState } from 'react'
import { RADIO_TRACKS, RADIO_TRACK_COUNT } from '@/constants/radioTracks'

const LS_VOL = 'infinite-museum-radio-vol'
const LS_MUTED = 'infinite-museum-radio-muted'

function readStoredVolume(): number {
  try {
    const v = localStorage.getItem(LS_VOL)
    if (v == null) return 0.55
    const n = parseFloat(v)
    if (Number.isNaN(n)) return 0.55
    return Math.min(1, Math.max(0, n))
  } catch {
    return 0.55
  }
}

function readStoredMuted(): boolean {
  try {
    return localStorage.getItem(LS_MUTED) === '1'
  } catch {
    return false
  }
}

export function useMuseumRadio(isLoaded: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const introFadeRef = useRef(false)
  const fadeRafRef = useRef<number | null>(null)
  const pendingResumeFadeRef = useRef(false)

  const [trackIndex, setTrackIndex] = useState(0)
  const [volume, setVolumeState] = useState(readStoredVolume)
  const [muted, setMutedState] = useState(readStoredMuted)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)

  const trackIndexRef = useRef(0)
  const volumeRef = useRef(volume)
  const mutedRef = useRef(muted)

  useEffect(() => {
    trackIndexRef.current = trackIndex
  }, [trackIndex])
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])
  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  const cancelIntroFade = useCallback(() => {
    if (fadeRafRef.current != null) {
      cancelAnimationFrame(fadeRafRef.current)
      fadeRafRef.current = null
    }
    introFadeRef.current = false
  }, [])

  const syncVolumeToElement = useCallback(() => {
    const a = audioRef.current
    if (!a || introFadeRef.current) return
    a.muted = muted
    a.volume = muted ? 0 : volume
  }, [muted, volume])

  useEffect(() => {
    const a = new Audio()
    a.preload = 'auto'
    const onEnded = () => {
      const el = audioRef.current
      if (!el) return
      const next = (trackIndexRef.current + 1) % RADIO_TRACK_COUNT
      trackIndexRef.current = next
      setTrackIndex(next)
      el.src = RADIO_TRACKS[next].src
      el.load()
      el.muted = mutedRef.current
      el.volume = mutedRef.current ? 0 : volumeRef.current
      void el.play().catch(() => setAutoplayBlocked(true))
    }
    a.addEventListener('ended', onEnded)
    audioRef.current = a
    return () => {
      cancelIntroFade()
      a.removeEventListener('ended', onEnded)
      a.pause()
      audioRef.current = null
    }
  }, [cancelIntroFade])

  useEffect(() => {
    syncVolumeToElement()
  }, [syncVolumeToElement])

  const setVolume = useCallback(
    (v: number) => {
      cancelIntroFade()
      const t = Math.min(1, Math.max(0, v))
      setVolumeState(t)
      try {
        localStorage.setItem(LS_VOL, String(t))
      } catch {
        /* ignore */
      }
      const a = audioRef.current
      if (a) {
        a.muted = muted
        a.volume = muted ? 0 : t
      }
    },
    [muted, cancelIntroFade]
  )

  const setMuted = useCallback(
    (m: boolean) => {
      cancelIntroFade()
      setMutedState(m)
      try {
        localStorage.setItem(LS_MUTED, m ? '1' : '0')
      } catch {
        /* ignore */
      }
      const a = audioRef.current
      if (a) {
        a.muted = m
        a.volume = m ? 0 : volume
      }
    },
    [volume, cancelIntroFade]
  )

  const runIntroFade = useCallback(
    (targetVol: number) => {
      const a = audioRef.current
      if (!a) return
      introFadeRef.current = true
      a.volume = 0
      const duration = 2600
      const start = performance.now()
      const step = (now: number) => {
        const el = audioRef.current
        if (!el) {
          introFadeRef.current = false
          fadeRafRef.current = null
          return
        }
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - (1 - p) ** 2
        el.volume = targetVol * ease
        if (p < 1) {
          fadeRafRef.current = requestAnimationFrame(step)
        } else {
          introFadeRef.current = false
          fadeRafRef.current = null
          el.volume = targetVol
        }
      }
      fadeRafRef.current = requestAnimationFrame(step)
    },
    []
  )

  const tryPlay = useCallback(async () => {
    const a = audioRef.current
    if (!a) return
    try {
      await a.play()
      setAutoplayBlocked(false)
    } catch {
      setAutoplayBlocked(true)
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    const a = audioRef.current
    if (!a) return

    let cancelled = false

    const ri = Math.floor(Math.random() * RADIO_TRACK_COUNT)
    setTrackIndex(ri)
    a.src = RADIO_TRACKS[ri].src
    a.load()

    const m = readStoredMuted()
    const vol = readStoredVolume()
    a.muted = m
    a.volume = m ? 0 : 0

    void (async () => {
      try {
        await a.play()
        if (cancelled) return
        setAutoplayBlocked(false)
        if (!m) runIntroFade(vol)
        else {
          a.volume = 0
          introFadeRef.current = false
        }
      } catch {
        if (cancelled) return
        setAutoplayBlocked(true)
        pendingResumeFadeRef.current = true
        introFadeRef.current = false
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isLoaded, runIntroFade])

  useEffect(() => {
    if (!isLoaded) return
    const onGesture = () => {
      const a = audioRef.current
      if (!a?.paused) return
      void a.play().then(() => {
        setAutoplayBlocked(false)
        if (pendingResumeFadeRef.current && !muted) {
          pendingResumeFadeRef.current = false
          cancelIntroFade()
          runIntroFade(volume)
        } else {
          pendingResumeFadeRef.current = false
          if (!muted) a.volume = volume
        }
      }).catch(() => { /* still blocked */ })
    }
    document.addEventListener('pointerdown', onGesture, { capture: true })
    return () => document.removeEventListener('pointerdown', onGesture, { capture: true })
  }, [isLoaded, muted, volume, runIntroFade, cancelIntroFade])

  const selectTrack = useCallback(
    (i: number) => {
      cancelIntroFade()
      const a = audioRef.current
      if (!a) return
      const next = ((i % RADIO_TRACK_COUNT) + RADIO_TRACK_COUNT) % RADIO_TRACK_COUNT
      setTrackIndex(next)
      a.src = RADIO_TRACKS[next].src
      a.load()
      a.muted = muted
      a.volume = muted ? 0 : volume
      void tryPlay()
    },
    [muted, volume, tryPlay, cancelIntroFade]
  )

  const nextTrack = useCallback(() => selectTrack(trackIndex + 1), [trackIndex, selectTrack])
  const prevTrack = useCallback(() => selectTrack(trackIndex - 1), [trackIndex, selectTrack])

  return {
    trackIndex,
    selectTrack,
    nextTrack,
    prevTrack,
    volume,
    setVolume,
    muted,
    setMuted,
    autoplayBlocked,
    currentLabel: RADIO_TRACKS[trackIndex].label,
  }
}
