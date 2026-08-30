import { useScroll, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react'

/**
 * Smoothed scroll velocity, normalised to roughly [-1, 1].
 *
 * Feeding this into a small skew or scale is the trick that makes a page
 * feel like it has physical weight: content leans a little into the
 * direction of travel and settles when you stop. The spring is what
 * makes it settle rather than snap.
 */
export function useScrollVelocityFactor(max = 1400): MotionValue<number> {
  const { scrollY } = useScroll()
  const raw = useVelocity(scrollY)
  const smooth = useSpring(raw, { stiffness: 260, damping: 44, mass: 0.4 })
  return useTransform(smooth, [-max, 0, max], [-1, 0, 1], { clamp: true })
}
