import { motion } from 'motion/react'

import { cn } from '@/lib/utils'
import { EASE_LUXE } from '@/motion/variants'

interface SplitTextProps {
  children: string
  className?: string
  /** Seconds before the first word moves. */
  delay?: number
  /** Seconds between consecutive words. */
  stagger?: number
  /** `viewport` reveals on scroll-in; `mount` reveals immediately. */
  trigger?: 'viewport' | 'mount'
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}

/**
 * Word-by-word masked reveal.
 *
 * Each word sits in its own `overflow-hidden` box and slides up from
 * beneath it, so the text appears to rise out of the page rather than
 * fading in flatly. Splitting by word rather than character is
 * deliberate: per-character staggers shred screen-reader output and look
 * gimmicky at display sizes.
 *
 * The full string stays available to assistive tech via `aria-label`,
 * with the animated spans hidden from the accessibility tree.
 */
export function SplitText({
  children,
  className,
  delay = 0,
  stagger = 0.055,
  trigger = 'viewport',
  as: Tag = 'span',
}: SplitTextProps) {
  const words = children.split(' ')
  const MotionTag = motion[Tag]

  return (
    <MotionTag
      className={cn(className)}
      aria-label={children}
      initial="hidden"
      {...(trigger === 'viewport'
        ? { whileInView: 'visible', viewport: { once: true, amount: 0.4 } }
        : { animate: 'visible' })}
      variants={{
        hidden: {},
        visible: { transition: { delayChildren: delay, staggerChildren: stagger } },
      }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          aria-hidden="true"
          className="inline-block overflow-hidden align-bottom"
          style={{
            // Padding keeps descenders (g, y, p) from being clipped by the mask.
            paddingBottom: '0.12em',
            marginBottom: '-0.12em',
            // Explicit gap: a trailing space inside an inline-block collapses.
            marginRight: i < words.length - 1 ? '0.26em' : undefined,
          }}
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: '110%' },
              visible: { y: '0%', transition: { duration: 1.05, ease: EASE_LUXE } },
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
