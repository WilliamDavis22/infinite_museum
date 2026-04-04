import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMuseumStore } from '@/store/useMuseumStore'

export function LoadingScreen() {
  const setLoaded = useMuseumStore((s) => s.setLoaded)
  const [visible, setVisible] = useState(true)
  const [barProgress, setBarProgress] = useState(0)

  useEffect(() => {
    // Animate the bar from 0 to 100 over 1.2s, then dismiss
    // We have no external assets, so useProgress stays at 0 — drive this ourselves
    const start = performance.now()
    const duration = 1200

    function tick() {
      const elapsed = performance.now() - start
      const t = Math.min(elapsed / duration, 1)
      setBarProgress(t)
      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        setTimeout(() => {
          setVisible(false)
          setLoaded()
        }, 300)
      }
    }

    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [setLoaded])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{
              color: '#ffffff',
              fontSize: '11px',
              letterSpacing: '0.5em',
              fontWeight: 300,
              textTransform: 'uppercase',
              marginBottom: '40px',
              opacity: 0.6,
            }}
          >
            Infinite Museum
          </motion.div>

          <div
            style={{
              width: '160px',
              height: '1px',
              background: 'rgba(255,255,255,0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.4)',
                transformOrigin: 'left center',
                scaleX: barProgress,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
