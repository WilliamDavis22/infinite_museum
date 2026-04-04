import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMuseumStore } from '@/store/useMuseumStore'

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
          {/* Room counter — top left */}
          <div style={{
            position: 'absolute',
            top: '28px',
            left: '32px',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '10px',
            letterSpacing: '0.4em',
            fontWeight: 300,
            textTransform: 'uppercase',
          }}>
            Room {toRoman(roomIndex + 1)}
          </div>

          {/* Bottom-left controls: play/pause + settings */}
          <div style={{
            position: 'absolute',
            bottom: '26px',
            left: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
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
              <span>{autoTour ? 'Auto' : 'Paused'}</span>
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
              onClick={() => setSettingsOpen((v) => !v)}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = settingsOpen ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)')}
            >
              <SettingsIcon />
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
                  bottom: '72px',
                  left: '32px',
                  width: '220px',
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

          {/* Seed share — bottom right */}
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              right: '32px',
              pointerEvents: 'all',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.25)',
              fontSize: '9px',
              letterSpacing: '0.3em',
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
                  bottom: '30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  fontSize: '9px',
                  letterSpacing: '0.5em',
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                Scroll to explore · Auto-touring
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
