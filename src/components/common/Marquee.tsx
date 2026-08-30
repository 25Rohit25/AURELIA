import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
} from 'motion/react'

import { cn } from '@/lib/utils'

interface MarqueeProps {
  items: string[]
  className?: string
  /** Baseline travel in pixels per second. */
  speed?: number
}

/**
 * Continuously scrolling band of property names that reacts to reading
 * velocity: scrolling fast speeds the band up, and scrolling *upward*
 * reverses it. That coupling is what makes a marquee feel like part of
 * the page rather than a looping GIF.
 *
 * Position is advanced in `useAnimationFrame` on a MotionValue, so the
 * loop never triggers a React render. The row is duplicated and wrapped
 * with modulo arithmetic for a seamless cycle.
 */
export function Marquee({ items, className, speed = 42 }: MarqueeProps) {
  const reducedMotion = useReducedMotion()
  const baseX = useMotionValue(0)

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const velocityFactor = useTransform(smoothVelocity, [-1200, 0, 1200], [-4, 1, 4], {
    clamp: false,
  })

  const directionRef = useRef(1)

  useAnimationFrame((_, delta) => {
    if (reducedMotion) return

    const factor = velocityFactor.get()
    // Scrolling up flips the band's direction.
    if (factor < 0) directionRef.current = -1
    else if (factor > 0) directionRef.current = 1

    const move = directionRef.current * speed * (delta / 1000) * Math.abs(factor || 1)

    // One copy of the row is 50% of the doubled track; wrap within that.
    baseX.set((baseX.get() - move) % 50)
  })

  const x = useTransform(baseX, (v) => `${v}%`)
  const row = [...items, ...items]

  return (
    <div className={cn('overflow-hidden py-8 select-none', className)} aria-hidden="true">
      <motion.div style={{ x }} className="flex w-max gap-12 whitespace-nowrap will-change-transform">
        {row.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-12">
            <span className="font-display text-bone/25 text-4xl md:text-6xl">{item}</span>
            <span className="bg-gold/40 size-1.5 rounded-full" />
          </span>
        ))}
      </motion.div>
    </div>
  )
}
