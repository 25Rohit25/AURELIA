import { motion, useScroll, useSpring } from 'motion/react'

/**
 * A hairline gold rule across the top of the viewport tracking read
 * position. Spring-smoothed so it glides rather than snapping with the
 * wheel.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <motion.div
      style={{ scaleX }}
      className="bg-gold fixed inset-x-0 top-0 z-[60] h-px origin-left"
      aria-hidden="true"
    />
  )
}
