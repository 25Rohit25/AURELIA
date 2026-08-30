import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

import { useScrollVelocityFactor } from '@/motion/useScrollVelocity'
import { cn } from '@/lib/utils'

interface ScrollFloatProps {
  children: ReactNode
  className?: string
  /** Vertical drift across the element's scroll pass, in pixels. */
  drift?: number
  /** Enter from the left (−1) or right (+1). 0 disables lateral motion. */
  from?: -1 | 0 | 1
  /** Degrees of skew per unit of scroll velocity. */
  skew?: number
  /** Scale at the extremes of the pass. */
  scaleFrom?: number
}

/**
 * Continuous scroll-linked motion for any block of content.
 *
 * Unlike a fire-once reveal, this stays bound to scroll position for the
 * whole time the element is on screen: it drifts vertically, slides in
 * laterally, eases up to full opacity, and skews a degree or two into
 * the direction of travel. The result is that the page keeps responding
 * while you scroll rather than animating once and going inert.
 *
 * Every value is a MotionValue, so none of this re-renders React.
 */
export function ScrollFloat({
  children,
  className,
  drift = 60,
  from = 0,
  skew = 1.6,
  scaleFrom = 1,
}: ScrollFloatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const eased = useSpring(scrollYProgress, { stiffness: 70, damping: 26, mass: 0.4 })
  const velocity = useScrollVelocityFactor()

  // Drift up as the element crosses the viewport.
  const y = useTransform(eased, [0, 1], [drift, -drift])
  // Slide in from the side, arriving by the time it is a third of the way up.
  const x = useTransform(eased, [0, 0.36], [from * 70, 0])
  // Fade and scale in over the first stretch only, then hold.
  const opacity = useTransform(eased, [0, 0.22, 0.9, 1], [0, 1, 1, 0.72])
  const scale = useTransform(eased, [0, 0.3], [scaleFrom, 1])
  // Lean into the direction of travel.
  const skewY = useTransform(velocity, (v) => v * skew)

  if (reduced) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div ref={ref} className={cn(className)} style={{ y, x, opacity, scale, skewY }}>
      {children}
    </motion.div>
  )
}
