import type { Transition, Variants } from 'motion/react'

/**
 * AURELIA motion vocabulary.
 *
 * The house style is slow and decelerating — nothing bounces, nothing
 * springs. Every transition uses the same easing curve so the whole site
 * feels like one object.
 */

export const EASE_LUXE = [0.16, 1, 0.3, 1] as const
export const EASE_VEIL = [0.4, 0, 0.2, 1] as const

export const luxe: Transition = { duration: 0.9, ease: EASE_LUXE }
export const luxeSlow: Transition = { duration: 1.4, ease: EASE_LUXE }

/** Rise and fade — the default entrance for text and cards. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: luxe },
}

/** A gentler rise for large blocks that would otherwise feel heavy. */
export const riseSoft: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: luxe },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: luxeSlow },
}

/** Slow scale-down, used behind hero imagery for a drifting-in feel. */
export const settle: Variants = {
  hidden: { opacity: 0, scale: 1.08 },
  visible: { opacity: 1, scale: 1, transition: { duration: 1.8, ease: EASE_LUXE } },
}

/** Parent that reveals children one after another. */
export function stagger(delayChildren = 0, staggerChildren = 0.09): Variants {
  return {
    hidden: {},
    visible: { transition: { delayChildren, staggerChildren } },
  }
}

/** Headline reveal: each line clipped, then slid up from its own mask. */
export const lineMask: Variants = {
  hidden: { y: '110%' },
  visible: { y: '0%', transition: { duration: 1.1, ease: EASE_LUXE } },
}

/** Shared viewport config so every scroll reveal triggers consistently. */
export const inView = { once: true, amount: 0.25 } as const
