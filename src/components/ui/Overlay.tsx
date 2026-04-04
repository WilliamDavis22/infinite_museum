import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMuseumStore } from '@/store/useMuseumStore'
import { useMuseumRadio } from '@/hooks/useMuseumRadio'
import { RADIO_TRACKS } from '@/constants/radioTracks'

function toRoman(n: number): string {
  const vals = [1000,900,500,400,100,90,50,40,10,9,5,4,1]
  const syms = ['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I']
  let result = ''
  for (let i = 0; i < vals.length; i++) {
    while (n >= vals[i]) { result += syms[i]; n -= vals[i] }
  }
  return result
}

function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
      <rect x="0" y="0" width="3.5" height="12" rx="1" />
      <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
      <path d="M0 0 L11 6 L0 12 Z" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
    </svg>
  )
}

function RadioIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10c0-4 4-6 8-6s8 2 8 6v4c0 4-4 6-8 6s-8-2-8-6v-4Z" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <path d="M8 4L6 2M16 4l2-2" />
    </svg>
  )
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10v4h3l4 3V7L7 10H4Z" />
      <path d="M16 9c1 1.5 1 4.5 0 6M18.5 7c2 2.5 2 7.5 0 10" />
    </svg>
  )
}

function SpeakerMuteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10v4h3l4 3V7L7 10H4Z" />
      <path d="M15 9l6 6M21 9l-6 6" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 1L1 6l5 5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 1l5 5-5 5" />
    </svg>
  )
}

const LABEL_STYLE: React.CSSProperties = {
  color: 'rgba(255,255,255,0.35)',
  fontSize: '9px',
  letterSpacing: '0.35em',
  fontWeight: 300,
  textTransform: 'uppercase',
}

const SLIDER_STYLE: React.CSSProperties = {
  WebkitAppearance: 'none',
  appearance: 'none',
  width: '100%',
  height: '1px',
  background: 'rgba(255,255,255,0.15)',
  outline: 'none',
  cursor: 'pointer',
  borderRadius: '0',
}

function speedLabel(v: number): string {
  if (v <= 1) return 'Slow'
  if (v <= 3) return 'Medium'
  if (v <= 6) return 'Fast'
  return 'Very fast'
}

export function Overlay() {
  const roomIndex = useMuseumStore((s) => s.roomIndex)
  const seed = useMuseumStore((s) => s.seed)
  const isLoaded = useMuseumStore((s) => s.isLoaded)
  const autoTour = useMuseumStore((s) => s.autoTour)
  const autoTourSpeed = useMuseumStore((s) => s.autoTourSpeed)
  const setAutoTour = useMuseumStore((s) => s.setAutoTour)
  const setAutoTourSpeed = useMuseumStore((s) => s.setAutoTourSpeed)
  const [showHint, setShowHint] = useState(true)
  const [copied, setCopied] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [radioOpen, setRadioOpen] = useState(false)
  const radioAnchorRef = useRef<HTMLDivElement>(null)
  const [radioPanelX, setRadioPanelX] = useState(0)
  const [narrowUi, setNarrowUi] = useState(false)

  const radio = useMuseumRadio(isLoaded)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const sync = () => setNarrowUi(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useLayoutEffect(() => {
    if (!radioOpen) return
    function clampRadioPanel() {
      const vw = window.innerWidth
      const margin = 12
      const panelW = Math.min(240, vw - margin * 2)
      const half = panelW / 2
      let cx = margin + half
      if (radioAnchorRef.current) {
        const r = radioAnchorRef.current.getBoundingClientRect()
        cx = r.left + r.width / 2
      }
      cx = Math.max(margin + half, Math.min(cx, vw - margin - half))
      setRadioPanelX(cx)
    }
    clampRadioPanel()
    window.addEventListener('resize', clampRadioPanel)
    return () => window.removeEventListener('resize', clampRadioPanel)
  }, [radioOpen])

  useEffect(() => {
    if (!isLoaded) return
    const timer = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(timer)
  }, [isLoaded])

  useEffect(() => {
    if (roomIndex > 0) setShowHint(false)
  }, [roomIndex])

  function copySeed() {
    const url = `${window.location.origin}${window.location.pathname}#seed=${seed.toString(16).toUpperCase()}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}
        >
          <style>{`
            input[type=range].museum-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: rgba(255,255,255,0.7);
              cursor: pointer;
              margin-top: -4.5px;
            }
            input[type=range].museum-slider::-webkit-slider-runnable-track {
              height: 1px;
              background: rgba(255,255,255,0.15);
            }
            input[type=range].museum-slider::-moz-range-thumb {
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: rgba(255,255,255,0.7);
              border: none;
              cursor: pointer;
            }
            input[type=range].museum-slider::-moz-range-track {
              height: 1px;
              background: rgba(255,255,255,0.15);
            }
          `}</style>
          {/* Room counter — top left */}
          <div style={{
            position: 'absolute',
            top: 'max(24px, env(safe-area-inset-top, 0px))',
            left: 'max(16px, env(safe-area-inset-left, 0px))',
            color: 'rgba(255,255,255,0.35)',
            fontSize: narrowUi ? '9px' : '10px',
            letterSpacing: narrowUi ? '0.28em' : '0.4em',
            fontWeight: 300,
            textTransform: 'uppercase',
          }}>
            Room {toRoman(roomIndex + 1)}
          </div>

          {/* Bottom-left controls: play/pause + settings */}
          <div style={{
            position: 'absolute',
            bottom: narrowUi
              ? 'calc(40px + env(safe-area-inset-bottom, 0px))'
              : 'calc(26px + env(safe-area-inset-bottom, 0px))',
            left: narrowUi
              ? 'max(12px, env(safe-area-inset-left, 0px))'
              : 'max(32px, env(safe-area-inset-left, 0px))',
            display: 'flex',
            alignItems: 'center',
            flexWrap: narrowUi ? 'wrap' : 'nowrap',
            gap: narrowUi ? '10px 14px' : '12px',
            maxWidth: narrowUi ? 'calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))' : undefined,
            pointerEvents: 'all',
          }}>
            {/* Play / Pause */}
            <div
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: autoTour ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
                fontSize: '9px',
                letterSpacing: '0.3em',
                fontWeight: 300,
                textTransform: 'uppercase',
                transition: 'color 0.3s',
                userSelect: 'none',
              }}
              onClick={() => setAutoTour(!autoTour)}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = autoTour ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)')}
            >
              <div style={{
                width: '26px',
                height: '26px',
                border: '1px solid currentColor',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {autoTour ? <PauseIcon /> : <PlayIcon />}
              </div>
              {!narrowUi && <span>{autoTour ? 'Auto' : 'Paused'}</span>}
            </div>

            {/* Settings gear */}
            <div
              style={{
                cursor: 'pointer',
                color: settingsOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.3s',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
              }}
              onClick={() => {
                setSettingsOpen((v) => !v)
                setRadioOpen(false)
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = settingsOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)')}
            >
              <SettingsIcon />
            </div>

            {/* Radio */}
            <div
              ref={radioAnchorRef}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: radioOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.3s',
                userSelect: 'none',
                position: 'relative',
              }}
              onClick={() => {
                setRadioOpen((v) => !v)
                setSettingsOpen(false)
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = radioOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)')}
            >
              <RadioIcon />
              <span style={{
                fontSize: '9px',
                letterSpacing: '0.3em',
                fontWeight: 300,
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                Radio
                {radio.autoplayBlocked && (
                  <span
                    title="Click anywhere to start audio"
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'rgba(255,200,120,0.85)',
                      boxShadow: '0 0 8px rgba(255,200,120,0.5)',
                    }}
                  />
                )}
              </span>
            </div>
          </div>

          {/* Settings panel — floats above the bottom-left controls */}
          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: narrowUi
                    ? 'calc(100px + env(safe-area-inset-bottom, 0px))'
                    : 'calc(72px + env(safe-area-inset-bottom, 0px))',
                  left: narrowUi
                    ? 'max(12px, env(safe-area-inset-left, 0px))'
                    : 'max(32px, env(safe-area-inset-left, 0px))',
                  width: narrowUi
                    ? 'min(220px, calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))'
                    : '220px',
                  boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  padding: '20px 20px 18px',
                  pointerEvents: 'all',
                }}
              >
                {/* Speed row */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                    <span style={LABEL_STYLE}>Tour speed</span>
                    <span style={{ ...LABEL_STYLE, opacity: 0.6 }}>{speedLabel(autoTourSpeed)}</span>
                  </div>
                  <input
                    type="range"
                    className="museum-slider"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={autoTourSpeed}
                    onChange={(e) => setAutoTourSpeed(Number(e.target.value))}
                    style={SLIDER_STYLE}
                  />
                  {/* Min/max labels */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ ...LABEL_STYLE, fontSize: '8px', opacity: 0.4 }}>Slow</span>
                    <span style={{ ...LABEL_STYLE, fontSize: '8px', opacity: 0.4 }}>Fast</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Radio panel */}
          <AnimatePresence>
            {radioOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: narrowUi
                    ? 'calc(100px + env(safe-area-inset-bottom, 0px))'
                    : 'calc(72px + env(safe-area-inset-bottom, 0px))',
                  left: radioPanelX > 0 ? `${radioPanelX}px` : '50%',
                  transform: 'translateX(-50%)',
                  width: 'min(240px, calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))',
                  maxWidth: 'calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
                  boxSizing: 'border-box',
                  background: 'rgba(0,0,0,0.75)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  padding: '18px 18px 16px',
                  pointerEvents: 'all',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span style={LABEL_STYLE}>Radio</span>
                  <span style={{ ...LABEL_STYLE, opacity: 0.5, letterSpacing: '0.2em' }}>Loop</span>
                </div>

                {radio.autoplayBlocked && (
                  <div style={{
                    ...LABEL_STYLE,
                    fontSize: '8px',
                    letterSpacing: '0.15em',
                    opacity: 0.55,
                    marginBottom: '12px',
                    lineHeight: 1.5,
                  }}>
                    Tap the scene or any control if you do not hear sound yet.
                  </div>
                )}

                {/* Prev / current / next */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  marginBottom: '14px',
                }}>
                  <button
                    type="button"
                    aria-label="Previous track"
                    onClick={() => radio.prevTrack()}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.45)',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <ChevronLeftIcon />
                  </button>
                  <span style={{
                    color: 'rgba(255,255,255,0.45)',
                    fontSize: '9px',
                    letterSpacing: '0.25em',
                    fontWeight: 300,
                    textTransform: 'uppercase',
                    flex: 1,
                    textAlign: 'center',
                  }}>
                    {radio.currentLabel}
                  </span>
                  <button
                    type="button"
                    aria-label="Next track"
                    onClick={() => radio.nextTrack()}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.45)',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <ChevronRightIcon />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {RADIO_TRACKS.map((t, i) => (
                    <button
                      key={t.src}
                      type="button"
                      onClick={() => radio.selectTrack(i)}
                      style={{
                        background: i === radio.trackIndex ? 'rgba(255,255,255,0.06)' : 'transparent',
                        border: '1px solid rgba(255,255,255,0.06)',
                        color: i === radio.trackIndex ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
                        fontSize: '9px',
                        letterSpacing: '0.28em',
                        fontWeight: 300,
                        textTransform: 'uppercase',
                        padding: '8px 10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'color 0.2s, background 0.2s',
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Volume + mute */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    aria-label={radio.muted ? 'Unmute' : 'Mute'}
                    onClick={() => radio.setMuted(!radio.muted)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: radio.muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.45)',
                      cursor: 'pointer',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {radio.muted ? <SpeakerMuteIcon /> : <SpeakerIcon />}
                  </button>
                  <input
                    type="range"
                    className="museum-slider"
                    min={0}
                    max={1}
                    step={0.02}
                    value={radio.volume}
                    onChange={(e) => radio.setVolume(Number(e.target.value))}
                    aria-label="Radio volume"
                    style={{ ...SLIDER_STYLE, flex: 1 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Seed share — bottom right */}
          <div
            style={{
              position: 'absolute',
              bottom: narrowUi
                ? 'calc(10px + env(safe-area-inset-bottom, 0px))'
                : 'calc(28px + env(safe-area-inset-bottom, 0px))',
              ...(narrowUi
                ? {
                    left: '50%',
                    transform: 'translateX(-50%)',
                    right: 'auto',
                    maxWidth: 'calc(100vw - 32px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px))',
                    justifyContent: 'center',
                  }
                : {
                    right: 'max(32px, env(safe-area-inset-right, 0px))',
                  }),
              pointerEvents: 'all',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.25)',
              fontSize: narrowUi ? '8px' : '9px',
              letterSpacing: narrowUi ? '0.22em' : '0.3em',
              fontWeight: 300,
              textTransform: 'uppercase',
              transition: 'color 0.3s',
            }}
            onClick={copySeed}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
          >
            <span>{copied ? 'Copied' : `Seed ${seed.toString(16).toUpperCase().slice(-6)}`}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </div>

          {/* Scroll hint — bottom center */}
          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.0 }}
                style={{
                  position: 'absolute',
                  bottom: narrowUi
                    ? 'calc(112px + env(safe-area-inset-bottom, 0px))'
                    : 'calc(30px + env(safe-area-inset-bottom, 0px))',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: narrowUi ? '8px' : '9px',
                  letterSpacing: narrowUi ? '0.28em' : '0.5em',
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  whiteSpace: narrowUi ? 'normal' : 'nowrap',
                  textAlign: 'center',
                  maxWidth: 'min(320px, calc(100vw - 40px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px)))',
                  lineHeight: narrowUi ? 1.45 : undefined,
                  paddingLeft: narrowUi ? '8px' : undefined,
                  paddingRight: narrowUi ? '8px' : undefined,
                  pointerEvents: 'none',
                }}
              >
                {narrowUi ? (
                  <>Scroll to explore<br />Auto-touring</>
                ) : (
                  'Scroll to explore · Auto-touring'
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
