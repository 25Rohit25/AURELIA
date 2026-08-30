import { useRef } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'
import { ArrowLeft, BedDouble, Maximize, Users } from 'lucide-react'

import { getSuite, suites } from '@/data/aurelia'
import { Image } from '@/components/common/Image'
import { Reveal } from '@/components/common/Reveal'
import { SuiteCard } from '@/features/suites/SuiteCard'
import { PanoViewer } from '@/three/canvas/PanoViewer'
import { SceneCanvas } from '@/three/canvas/SceneCanvas'
import { SUITE_MODEL_URL } from '@/three/config'
import { SplitText } from '@/components/common/SplitText'
import { Parallax } from '@/components/common/Parallax'
import { Magnetic } from '@/components/common/Magnetic'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn, formatPrice } from '@/lib/utils'

export function SuiteDetail() {
  const { suiteId } = useParams<{ suiteId: string }>()
  const suite = suiteId ? getSuite(suiteId) : undefined
  const heroRef = useRef<HTMLElement>(null)

  // Hero drifts and dims as it leaves, handing off to the content below.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.14])
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  // Unknown id — send them back to the collection rather than 404-ing.
  if (!suite) return <Navigate to="/" replace />

  const others = suites.filter((s) => s.id !== suite.id).slice(0, 3)

  const stats = [
    { icon: Maximize, label: `${suite.sizeSqm} m²` },
    { icon: Users, label: `${suite.maxGuests} guests` },
    { icon: BedDouble, label: `${suite.bedrooms} bedroom${suite.bedrooms > 1 ? 's' : ''}` },
  ]

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative isolate flex min-h-[88vh] flex-col justify-end overflow-hidden"
      >
        <motion.div style={{ scale: heroScale }} className="absolute inset-0 -z-10">
          <Image
            id={suite.heroId}
            alt={suite.name}
            width={2200}
            priority
            className="size-full"
          />
          <div className="from-ink via-ink/45 absolute inset-0 bg-gradient-to-t to-transparent" />
        </motion.div>

        <motion.div style={{ opacity: heroFade }} className="mx-auto w-full max-w-7xl px-6 pb-20">
          <Link
            to="/"
            className="text-bone-muted hover:text-gold mb-10 inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase transition-colors duration-500"
          >
            <ArrowLeft className="size-3" />
            All suites
          </Link>

          <p className="eyebrow">{suite.property}</p>
          <SplitText
            as="h1"
            trigger="mount"
            delay={0.25}
            stagger={0.07}
            className="font-display text-headline mt-4 max-w-3xl"
          >
            {suite.name}
          </SplitText>
          <p className="text-bone-muted mt-5 max-w-xl text-lg italic">{suite.tagline}</p>
        </motion.div>
      </section>

      {/* ── Detail ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <p className="eyebrow">The room</p>
            <p className="mt-8 text-xl leading-relaxed text-balance md:text-2xl">
              {suite.description}
            </p>

            <div className="border-ink-line mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t pt-8">
              {stats.map(({ icon: Icon, label }) => (
                <span key={label} className="text-bone-muted flex items-center gap-2.5 text-sm">
                  <Icon className="text-gold size-4" />
                  {label}
                </span>
              ))}
            </div>

            <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {suite.features.map((f) => (
                <li key={f} className="text-bone-muted flex items-center gap-3 text-sm">
                  <span className="bg-gold/50 size-1 rounded-full" />
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Reservation card */}
          <Reveal delay={0.1} intensity="soft">
            <div className="border-ink-line bg-ink-soft sticky top-28 border p-8">
              <p className="text-bone-muted text-[10px] tracking-[0.2em] uppercase">From</p>
              <p className="font-display text-gold mt-2 text-4xl">{formatPrice(suite.price)}</p>
              <p className="text-bone-muted mt-1 text-sm">per night, taxes included</p>

              <Magnetic strength={8} className="mt-8 block">
                <Link
                  to="/booking"
                  className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'w-full')}
                >
                  Reserve this suite
                </Link>
              </Magnetic>

              <p className="text-bone-muted/70 mt-5 text-center text-[10px] tracking-[0.14em] uppercase">
                Free cancellation until 72 hours prior
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 3D tour ───────────────────────────────────────────── */}
      {suite.hasTour && (
        <section className="border-ink-line border-t">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <Reveal>
              <p className="eyebrow">Interactive tour</p>
              <SplitText as="h2" className="font-display text-headline mt-4" stagger={0.05}>
                Step inside
              </SplitText>
              <p className="text-bone-muted mt-5 max-w-lg text-sm leading-relaxed">
                A 360° capture of the room, shot on location. Drag to turn and look around —
                the ceiling, the floor, and everything behind you.
              </p>
            </Reveal>

            <Reveal delay={0.12} intensity="soft">
              <div className="border-ink-line mt-12 border">
                {/* A real GLB, once one is configured, otherwise the 360°
                    capture. Setting SUITE_MODEL_URL in three/config.ts is
                    the only change needed to switch a client onto their
                    own model. */}
                {SUITE_MODEL_URL ? (
                  <SceneCanvas
                    className="aspect-16/10 w-full"
                    fallbackImageId={suite.heroId}
                    fallbackAlt={`${suite.name} interior`}
                  />
                ) : (
                  <PanoViewer
                    panorama={suite.panorama}
                    className="aspect-16/10 w-full"
                    fallbackImageId={suite.heroId}
                    fallbackAlt={`${suite.name} interior`}
                  />
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── Gallery ───────────────────────────────────────────── */}
      <section className="border-ink-line border-t">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-4 md:grid-cols-2">
            {suite.galleryIds.map((id, i) => (
              <Reveal key={`${id}-${i}`} delay={i * 0.08} intensity="soft">
                <Parallax className="aspect-4/3 w-full" distance={i % 2 === 0 ? 50 : -50}>
                  <Image id={id} alt={`${suite.name} — view ${i + 1}`} width={1200} className="size-full" />
                </Parallax>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other suites ──────────────────────────────────────── */}
      <section className="border-ink-line border-t">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <Reveal>
            <p className="eyebrow">Also available</p>
            <SplitText as="h2" className="font-display text-headline mt-4" stagger={0.05}>
              Other rooms
            </SplitText>
          </Reveal>

          <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08} intensity="soft">
                <SuiteCard suite={s} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
