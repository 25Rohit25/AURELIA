import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'

import { cn } from '@/lib/utils'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Pixels of travel across the element's full scroll pass. Negative = faster than scroll. */
  distance?: number
}

/**
 * Scroll-linked vertical parallax.
 *
 * The raw scroll offset is passed through a spring so the layer settles
 * rather than tracking the wheel one-to-one — that lag is what separates
 * depth from a jitter effect.
 */
export function Parallax({ children, className, distance = 90 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const raw = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const y = useSpring(raw, { stiffness: 80, damping: 24, mass: 0.4 })

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      {/* Oversized so the translated layer never exposes an edge. */}
      <motion.div style={{ y }} className="absolute inset-x-0 -inset-y-[18%]">
        {children}
      </motion.div>
    </div>
  )
}
