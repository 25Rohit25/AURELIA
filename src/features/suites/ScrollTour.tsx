import type React from 'react'
import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react'

import { tour, type TourStation } from '@/data/tour'
import { TourCanvas } from '@/three/canvas/TourCanvas'
import type { Suite } from '@/types/aurelia'
import { EASE_LUXE } from '@/motion/variants'

/**
 * The signature moment: a pinned photographic walkthrough.
 *
 * The section runs a little over a viewport per room, so each gets an
 * equal share of scroll. The canvas inside is sticky, meaning scrolling
 * moves the camera through real rooms rather than moving the frame down
 * the page.
 *
 * Scroll is spring-smoothed once here and the single resulting
 * MotionValue drives the camera, every sphere, every caption and the
 * chapter rail — so all of them stay locked to one eased timeline.
 */
export function ScrollTour({ suite }: { suite: Suite }) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const progress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    mass: 0.5,
    restDelta: 0.0004,
  })

  return (
    /**
     * Height is expressed in `svh` (small viewport height), not `vh` or
     * `dvh`. On mobile the URL bar hides and shows as you scroll: with
     * `dvh` the pinned section resizes mid-scroll and the walkthrough
     * visibly jumps; `svh` is the stable measurement.
     *
     * The per-room allowance is shorter on phones — 145svh each is over
     * seven screens of scrolling on a small device, which reads as a
     * page that will not end.
     */
    <section
      ref={ref}
      className="relative h-[calc(var(--stations)*105svh)] md:h-[calc(var(--stations)*145svh)]"
      style={{ '--stations': tour.length } as React.CSSProperties}
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <TourCanvas
          stations={tour}
          progress={progress}
          className="absolute inset-0 size-full"
          fallbackImageId={suite.heroId}
          fallbackAlt={suite.name}
        />

        {/* Legibility scrim — heavier top and bottom than through the middle. */}
        <div className="from-ink/90 via-ink/5 to-ink/90 pointer-events-none absolute inset-0 bg-gradient-to-b" />
        {/* A soft left wash so captions always have ground to sit on. */}
        <div className="from-ink/70 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent md:to-40%" />

        <TourChrome progress={progress} property={suite.property} />

        {/* Captions, one per station */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-24">
          <div className="relative h-56 sm:h-44">
            {tour.map((station, i) => (
              <Caption
                key={station.id}
                progress={progress}
                index={i}
                total={tour.length}
                station={station}
              />
            ))}
          </div>
        </div>

        <ChapterRail progress={progress} />
        <ScrollHint progress={progress} />
      </div>
    </section>
  )
}

/** Fixed top chrome, with a live shot counter. */
function TourChrome({ progress, property }: { progress: MotionValue<number>; property: string }) {
  const shot = useTransform(progress, (p) =>
    String(Math.min(tour.length, Math.floor(p * tour.length) + 1)).padStart(2, '0'),
  )

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto flex max-w-7xl items-center justify-between px-5 pt-24 sm:px-6 sm:pt-28">
      <p className="eyebrow">Walkthrough</p>
      <div className="flex items-center gap-3">
        <motion.span className="text-gold font-display text-sm">{shot}</motion.span>
        <span className="bg-bone-muted/40 h-px w-8" />
        <span className="text-bone-muted text-[10px] tracking-[0.2em] uppercase">
          {String(tour.length).padStart(2, '0')} · {property}
        </span>
      </div>
    </div>
  )
}

function Caption({
  progress,
  index,
  total,
  station,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  station: TourStation
}) {
  const span = 1 / total
  const start = index * span

  // Legible through the middle of its station, gone across the handover.
  const opacity = useTransform(
    progress,
    [start, start + span * 0.14, start + span * 0.72, start + span * 0.94],
    [0, 1, 1, 0],
  )
  // Rises the whole time it is on screen, so the block never sits still.
  const y = useTransform(progress, [start, start + span], [46, -46])
  // A touch of scale and blur at the edges: the caption arrives into
  // focus and leaves out of it, like a rack focus between shots.
  const scale = useTransform(
    progress,
    [start, start + span * 0.2, start + span * 0.8, start + span],
    [0.96, 1, 1, 1.03],
  )
  const filter = useTransform(
    progress,
    [start, start + span * 0.16, start + span * 0.8, start + span],
    ['blur(9px)', 'blur(0px)', 'blur(0px)', 'blur(7px)'],
  )

  return (
    <motion.div
      style={{ opacity, y, scale, filter }}
      className="absolute inset-x-0 bottom-0 origin-bottom-left"
    >
      <div className="flex items-center gap-3">
        <span className="bg-gold h-px w-10" />
        <p className="eyebrow">{station.eyebrow}</p>
      </div>
      <h3 className="font-display mt-3 max-w-2xl text-[1.75rem] leading-[1.1] text-balance sm:text-4xl md:text-6xl">
        {station.title}
      </h3>
      <p className="text-bone-muted mt-4 max-w-md text-[13px] leading-relaxed sm:text-sm">{station.caption}</p>
    </motion.div>
  )
}

/** Named chapter rail showing which room you are in. */
function ChapterRail({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="pointer-events-none absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col gap-5 md:flex">
      {tour.map((station, i) => (
        <Chapter key={station.id} progress={progress} index={i} total={tour.length} label={station.chapter} />
      ))}
    </div>
  )
}

function Chapter({
  progress,
  index,
  total,
  label,
}: {
  progress: MotionValue<number>
  index: number
  total: number
  label: string
}) {
  const span = 1 / total
  const start = index * span
  const range = [start - span * 0.25, start + span * 0.25, start + span * 0.75, start + span * 1.25]

  const opacity = useTransform(progress, range, [0.3, 1, 1, 0.3])
  const width = useTransform(progress, range, [14, 40, 40, 14])
  const labelOpacity = useTransform(progress, range, [0, 1, 1, 0])
  const labelX = useTransform(progress, range, [10, 0, 0, 10])

  return (
    <div className="flex items-center justify-end gap-3">
      <motion.span
        style={{ opacity: labelOpacity, x: labelX }}
        className="text-bone text-[9px] tracking-[0.2em] whitespace-nowrap uppercase"
      >
        {label}
      </motion.span>
      <motion.span style={{ opacity, width }} className="bg-gold block h-px" />
    </div>
  )
}

function ScrollHint({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.035], [1, 0])
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
    >
      <span className="text-bone-muted/70 text-[10px] tracking-[0.24em] uppercase">
        Scroll to walk through
      </span>
      <motion.span
        className="via-gold/70 h-12 w-px bg-gradient-to-b from-transparent to-transparent"
        animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }}
        transition={{ duration: 2.4, repeat: Infinity, ease: EASE_LUXE }}
      />
    </motion.div>
  )
}
