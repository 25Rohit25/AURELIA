import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

import { brand } from '@/data/aurelia'
import { EASE_LUXE } from '@/motion/variants'

/**
 * Opening curtain.
 *
 * A held beat on the wordmark, then the panel lifts away. It buys the
 * first panorama a moment to decode — but mostly it sets the register:
 * arriving somewhere expensive involves a short wait at the door.
 *
 * Skipped entirely under reduced motion, where a blocking full-screen
 * animation is exactly the wrong thing to serve.
 */
export function IntroCurtain() {
  const reduced = useReducedMotion()
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (reduced) return
    const t = setTimeout(() => setDone(true), 1900)
    return () => clearTimeout(t)
  }, [reduced])

  // Under reduced motion the curtain is never mounted at all, rather than
  // mounted and immediately dismissed — a blocking full-screen animation
  // is precisely what that setting asks us not to serve.
  if (reduced) return null

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="bg-ink fixed inset-0 z-[90] flex items-center justify-center"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1.1, ease: EASE_LUXE }}
        >
          <div className="overflow-hidden">
            <motion.p
              className="font-display text-3xl tracking-[0.44em] md:text-5xl"
              initial={{ y: '110%' }}
              animate={{ y: '0%' }}
              transition={{ duration: 1.1, ease: EASE_LUXE }}
            >
              {brand.name}
            </motion.p>
          </div>

          {/* A rule that draws itself under the wordmark. */}
          <motion.span
            className="bg-gold absolute bottom-[38%] h-px"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5, ease: EASE_LUXE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
