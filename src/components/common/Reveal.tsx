import type { ReactNode } from 'react'
import { motion } from 'motion/react'

import { inView, rise, riseSoft } from '@/motion/variants'
import { cn } from '@/lib/utils'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** `soft` travels a shorter distance — for large or heavy blocks. */
  intensity?: 'default' | 'soft'
  as?: 'div' | 'section' | 'li' | 'article'
}

/**
 * Scroll-triggered entrance used site-wide.
 *
 * Motion's `whileInView` already respects `prefers-reduced-motion` at the
 * animation level, so a reduced-motion visitor sees content appear without
 * travel rather than not at all.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  intensity = 'default',
  as = 'div',
}: RevealProps) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={cn(className)}
      variants={intensity === 'soft' ? riseSoft : rise}
      initial="hidden"
      whileInView="visible"
      viewport={inView}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}
