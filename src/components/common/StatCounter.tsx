import { useEffect, useRef } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform, useReducedMotion } from 'motion/react'

interface StatCounterProps {
  value: number
  label: string
  suffix?: string
  /** Seconds the count takes to settle. */
  duration?: number
}

/**
 * A number that counts up the first time it is seen.
 *
 * The tally lives in a MotionValue and is rendered through
 * `useTransform`, so the animation writes to the DOM directly and never
 * re-renders the component — the naive version of this runs a
 * `setState` sixty times a second.
 *
 * Under reduced motion the final value is simply printed.
 */
export function StatCounter({ value, label, suffix = '', duration = 1.8 }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduced = useReducedMotion()

  const count = useMotionValue(0)
  const display = useTransform(count, (v) => Math.round(v).toLocaleString('en-US'))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, value, duration, count, reduced])

  return (
    <div ref={ref} className="text-center sm:text-left">
      <p className="font-display text-gold text-5xl md:text-6xl">
        <motion.span>{display}</motion.span>
        {suffix}
      </p>
      <p className="text-bone-muted mt-3 text-[10px] tracking-[0.2em] uppercase">{label}</p>
    </div>
  )
}

/** Small helper so the landing page can drop in a row of figures. */
export function StatRow({ stats }: { stats: StatCounterProps[] }) {
  return (
    <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
      {stats.map((s) => (
        <StatCounter key={s.label} {...s} />
      ))}
    </div>
  )
}
