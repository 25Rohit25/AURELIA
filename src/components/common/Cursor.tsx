import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

/**
 * Custom cursor: a small gold dot with a trailing ring.
 *
 * The dot tracks the pointer exactly; the ring follows on a spring and
 * swells over interactive elements. Hover detection is delegated from
 * `window` rather than bound per element, so it keeps working as routes
 * change and new nodes mount.
 *
 * Every per-move value is a MotionValue, so moving the mouse animates
 * the DOM directly and triggers **zero** React renders. An earlier
 * version held hover state in `useState`, which re-rendered the tree on
 * every pointermove event.
 *
 * Rendered only where a fine pointer exists — on touch there is no
 * cursor to replace, and drawing one is a bug.
 */
export function Cursor() {
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches,
  )

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const size = useMotionValue(26)
  const opacity = useMotionValue(0.4)

  const spring = { stiffness: 180, damping: 20, mass: 0.5 }
  const ringX = useSpring(x, spring)
  const ringY = useSpring(y, spring)
  const ringSize = useSpring(size, { stiffness: 260, damping: 24 })
  const ringOpacity = useSpring(opacity, { stiffness: 260, damping: 24 })

  useEffect(() => {
    if (!enabled) return

    const onMove = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      const hot = Boolean(el?.closest('a, button, select, input, [data-cursor="hover"]'))
      // MotionValues, not React state: these write straight to the DOM
      // and deliberately bypass rendering.
      x.set(e.clientX)
      y.set(e.clientY)
      size.set(hot ? 46 : 26)
      opacity.set(hot ? 0.9 : 0.4)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled, x, y, size, opacity])

  if (!enabled) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] hidden md:block" aria-hidden="true">
      <motion.div
        className="bg-gold absolute size-1.5 rounded-full"
        style={{ x, y, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="border-gold/50 absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          width: ringSize,
          height: ringSize,
          opacity: ringOpacity,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </div>
  )
}
