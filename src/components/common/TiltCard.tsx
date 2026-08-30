import { useRef, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'motion/react'

import { cn } from '@/lib/utils'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Maximum rotation in degrees at the card's corners. */
  max?: number
  /** Adds a light that follows the pointer across the surface. */
  glare?: boolean
}

/**
 * Pointer-tracked 3D tilt with a moving specular highlight.
 *
 * The card rotates about X and Y toward the cursor and carries a soft
 * radial glare positioned where the pointer is, which is what sells the
 * surface as physical rather than as a rotating rectangle.
 *
 * `transformPerspective` is set on the element itself, so the effect
 * needs no perspective wrapper on the parent and cannot be flattened by
 * an intermediate `overflow-hidden`.
 *
 * Skipped for touch pointers — there is no hover to respond to.
 */
export function TiltCard({ children, className, max = 7, glare = true }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const spring = { stiffness: 200, damping: 22, mass: 0.4 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)

  const rotateY = useTransform(sx, [0, 1], [-max, max])
  const rotateX = useTransform(sy, [0, 1], [max, -max])

  const glareX = useTransform(sx, [0, 1], ['0%', '100%'])
  const glareY = useTransform(sy, [0, 1], ['0%', '100%'])
  const glareBg = useMotionTemplate`radial-gradient(400px circle at ${glareX} ${glareY}, rgba(230,200,142,0.14), transparent 60%)`

  return (
    <motion.div
      ref={ref}
      className={cn('relative', className)}
      style={{ rotateX, rotateY, transformPerspective: 1100 }}
      onPointerMove={(e) => {
        if (e.pointerType === 'touch') return
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100 md:opacity-100"
          style={{ backgroundImage: glareBg }}
        />
      )}
    </motion.div>
  )
}
