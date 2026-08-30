import type React from 'react'
import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useSpring, useTransform } from 'motion/react'
import { ArrowUpRight, Box } from 'lucide-react'

import { suites } from '@/data/aurelia'
import { useScrollVelocityFactor } from '@/motion/useScrollVelocity'
import { Image } from '@/components/common/Image'
import { SplitText } from '@/components/common/SplitText'
import type { Suite } from '@/types/aurelia'
import { cn, formatPrice } from '@/lib/utils'

/**
 * Vertical scroll drives horizontal travel through the collection.
 *
 * The section is tall; the viewport-height track inside is sticky, and
 * scroll progress maps to an x-translation of the panel row. Each panel
 * also counter-parallaxes its own image, so cards feel layered rather
 * than sliding as one flat sheet.
 *
 * Section height is derived from the panel count, so adding a suite to
 * `data/aurelia.ts` automatically lengthens the scroll rather than
 * cramming the travel.
 */
export function HorizontalSuites() {
  const ref = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [travel, setTravel] = useState(0)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.5,
    restDelta: 0.0005,
  })

  /**
   * Travel is measured, not guessed.
   *
   * Panel width is a viewport unit that changes at every breakpoint, so
   * any hard-coded percentage lands the last card in the wrong place on
   * most screens. Measuring the track gives the exact distance needed to
   * bring its right edge to the viewport edge, at any size.
   *
   * It must also be a pixel value: Motion interpolates between two
   * numbers of the same unit, and mixing `vw` with `%` does not resolve.
   */
  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    // +24 keeps the trailing gutter matching the leading one.
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth + 24))

    // The observer catches track growth; the resize listener catches a
    // viewport change that leaves the track's own width untouched.
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const x = useTransform(smooth, [0, 1], [0, -travel])

  return (
    <section
      ref={ref}
      className="relative h-[calc(var(--panels)*62svh)] md:h-[calc(var(--panels)*78svh)]"
      style={{ '--panels': suites.length } as React.CSSProperties}
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <div className="mx-auto mb-8 w-full max-w-7xl px-5 sm:mb-10 sm:px-6">
          <p className="eyebrow">Rooms &amp; suites</p>
          <SplitText as="h2" className="font-display text-headline mt-4" stagger={0.05}>
            Where you will stay
          </SplitText>
        </div>

        <motion.div ref={trackRef} style={{ x }} className="flex gap-4 pl-5 will-change-transform sm:gap-6 sm:pl-6">
          {suites.map((suite, i) => (
            <Panel key={suite.id} suite={suite} index={i} progress={smooth} />
          ))}
        </motion.div>

        <Counter progress={smooth} />
      </div>
    </section>
  )
}

interface PanelProps {
  suite: Suite
  index: number
  progress: ReturnType<typeof useSpring>
}

function Panel({ suite, index, progress }: PanelProps) {
  // Counter-move each image against the row for a layered feel.
  const imageX = useTransform(progress, [0, 1], ['-8%', '8%'])
  const span = 1 / suites.length
  const mid = index * span + span / 2

  // The card is largest as it passes centre and recedes either side, so
  // the row reads as depth rather than a flat strip.
  const scale = useTransform(progress, [mid - span, mid, mid + span], [0.9, 1, 0.9])
  const opacity = useTransform(progress, [mid - span, mid, mid + span], [0.45, 1, 0.45])

  // Cards lean into the direction of travel and settle when you stop.
  const velocity = useScrollVelocityFactor()
  const rotate = useTransform(velocity, (v) => v * -2.4)
  const skewX = useTransform(velocity, (v) => v * 1.6)

  return (
    <motion.article
      style={{ scale, opacity, rotate, skewX }}
      className="relative w-[74vw] shrink-0 sm:w-[52vw] lg:w-[34vw]"
    >
      <Link to={`/suites/${suite.id}`} className="group block">
        <div className="relative aspect-4/5 overflow-hidden">
          <motion.div style={{ x: imageX }} className="absolute inset-0 -inset-x-[8%]">
            <Image
              id={suite.heroId}
              alt={suite.name}
              width={1100}
              className="size-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          </motion.div>

          <div className="from-ink/85 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

          {suite.hasTour && (
            <span className="bg-ink/70 text-gold absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] tracking-[0.18em] uppercase backdrop-blur">
              <Box className="size-3" />
              3D tour
            </span>
          )}

          <span className="text-bone/30 font-display absolute top-3 right-5 text-5xl">
            {String(index + 1).padStart(2, '0')}
          </span>

          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-bone-muted text-[10px] tracking-[0.2em] uppercase">
              {suite.property}
            </p>
            <h3 className="font-display mt-1.5 text-2xl">{suite.name}</h3>
          </div>
        </div>

        <div className="border-ink-line mt-5 flex items-baseline justify-between border-t pt-4">
          <p className="text-bone-muted text-sm">{suite.location}</p>
          <p className="text-sm">
            <span className="text-gold">{formatPrice(suite.price)}</span>
            <span className="text-bone-muted"> / night</span>
          </p>
        </div>

        <p className="text-bone-muted group-hover:text-gold mt-3 flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase transition-colors duration-500">
          View suite
          <ArrowUpRight className="size-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </p>
      </Link>
    </motion.article>
  )
}

function Counter({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%'])
  return (
    <div className="mx-auto mt-10 w-full max-w-7xl px-6">
      <div className={cn('bg-ink-line h-px w-full max-w-xs')}>
        <motion.div style={{ width }} className="bg-gold h-px" />
      </div>
    </div>
  )
}
