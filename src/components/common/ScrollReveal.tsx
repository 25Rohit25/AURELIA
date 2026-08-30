import { useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'motion/react'

import { cn } from '@/lib/utils'

interface ScrollRevealProps {
  children: string
  className?: string
  as?: 'p' | 'h2' | 'h3'
  /** Opacity of a word before it is reached. */
  dim?: number
}

/**
 * Scroll-scrubbed word illumination.
 *
 * Each word owns a slice of the paragraph's scroll pass and lifts from
 * dim to full as the reader reaches it, so the text is *read* by
 * scrolling rather than revealed all at once. Unlike a fire-once
 * reveal, scrolling back up dims the words again — the effect is bound
 * to position, not to a trigger.
 *
 * The whole string stays in the accessibility tree via `aria-label`,
 * with the animated spans hidden, so a screen reader gets one clean
 * sentence instead of a stream of fragments.
 */
export function ScrollReveal({
  children,
  className,
  as: Tag = 'p',
  dim = 0.14,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const words = children.split(' ')

  // Starts as the block enters the lower third, completes before it
  // leaves the upper third — so the whole sentence is lit while it is
  // comfortably in view, not at the very edges of the screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.82', 'end 0.45'],
  })

  return (
    <div ref={ref} className={cn(className)}>
      <Tag aria-label={children} className="flex flex-wrap">
        {words.map((word, i) => (
          <Word
            key={`${word}-${i}`}
            progress={scrollYProgress}
            range={[i / words.length, (i + 1.4) / words.length]}
            dim={dim}
          >
            {word}
          </Word>
        ))}
      </Tag>
    </div>
  )
}

function Word({
  progress,
  range,
  dim,
  children,
}: {
  progress: MotionValue<number>
  range: [number, number]
  dim: number
  children: string
}) {
  const opacity = useTransform(progress, range, [dim, 1])
  const y = useTransform(progress, range, [8, 0])

  return (
    <span aria-hidden="true" className="mr-[0.26em] inline-block">
      <motion.span style={{ opacity, y }} className="inline-block">
        {children}
      </motion.span>
    </span>
  )
}
