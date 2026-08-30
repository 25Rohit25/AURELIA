import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

interface MagneticProps {
  children: ReactNode
  className?: string
  /** How far the element is allowed to chase the cursor, in pixels. */
  strength?: number
}

/**
 * Cursor magnetism.
 *
 * The element leans toward the pointer while it is nearby and springs
 * back on exit. Applied sparingly — on primary calls to action only —
 * it reads as craft; applied everywhere it reads as noise.
 *
 * Pointer-type aware: touch devices report `pointerType === 'touch'` and
 * are skipped, since there is no hover state to reward.
 */
export function Magnetic({ children, className, strength = 14 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness: 220, damping: 18, mass: 0.35 }
  const sx = useSpring(x, spring)
  const sy = useSpring(y, spring)

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch') return
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        // Offset from centre, normalised to [-1, 1], then scaled.
        x.set(((e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)) * strength)
        y.set(((e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
