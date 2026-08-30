import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'motion/react'

import { amenities, brand, getSuite, showcaseSuiteId, suites } from '@/data/aurelia'
import { amenityIcons, fallbackIcon } from '@/features/amenities/icons'
import { Image } from '@/components/common/Image'
import { ScrollFloat } from '@/components/common/ScrollFloat'
import { SplitText } from '@/components/common/SplitText'
import { Magnetic } from '@/components/common/Magnetic'
import { Marquee } from '@/components/common/Marquee'
import { ScrollReveal } from '@/components/common/ScrollReveal'
import { StatRow } from '@/components/common/StatCounter'
import { GalleryGrid } from '@/features/gallery/GalleryGrid'
import { ScrollTour } from '@/features/suites/ScrollTour'
import { HorizontalSuites } from '@/features/suites/HorizontalSuites'
import { buttonVariants } from '@/components/ui/button-variants'
import { EASE_LUXE } from '@/motion/variants'

export function Landing() {
  const showcase = getSuite(showcaseSuiteId)!
  const heroRef = useRef<HTMLElement>(null)

  // The hero recedes as it leaves — scaling down and dimming rather than
  // simply scrolling away, so the room beneath feels like it is arriving.
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])

  const properties = [...new Set(suites.map((s) => s.property))]

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative isolate h-svh overflow-hidden">
        <motion.div style={{ scale: heroScale, y: heroY }} className="absolute inset-0 -z-10">
          <Image
            id={showcase.galleryIds[0]}
            alt={`${brand.name} — ${showcase.property}`}
            width={2400}
            priority
            className="size-full"
          />
          <div className="from-ink via-ink/45 absolute inset-0 bg-gradient-to-t to-transparent" />
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity }}
          className="mx-auto flex h-full w-full max-w-7xl flex-col justify-end px-5 pb-20 sm:px-6 sm:pb-24 md:pb-32"
        >
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE_LUXE }}
          >
            {brand.tagline}
          </motion.p>

          <SplitText
            as="h1"
            trigger="mount"
            delay={0.45}
            stagger={0.09}
            className="font-display text-display mt-5 max-w-4xl"
          >
            Six retreats. One idea.
          </SplitText>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2, ease: EASE_LUXE }}
          >
            <Magnetic>
              <Link to="/booking" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Check availability
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                to={`/suites/${showcase.id}`}
                className={buttonVariants({ variant: 'outline', size: 'lg' })}
              >
                Step inside
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Statement ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-28 md:py-40">
        <ScrollFloat drift={40} from={-1}>
          <p className="eyebrow">The collection</p>
        </ScrollFloat>
        <ScrollReveal
          as="p"
          className="font-display mt-8 max-w-4xl text-2xl leading-[1.3] sm:text-3xl md:text-5xl"
        >
          {brand.description}
        </ScrollReveal>
        <ScrollFloat drift={110} from={1}>
          <p className="text-bone-muted mt-10 max-w-xl text-sm leading-relaxed">
            Each property is small by design — never more than thirty keys. We would rather be
            the second-largest hotel in a place than the largest anywhere.
          </p>
        </ScrollFloat>

        <ScrollFloat drift={60} className="mt-20">
          <StatRow
            stats={[
              { value: 6, label: 'Retreats' },
              { value: 30, label: 'Keys, at most', suffix: '' },
              { value: 2009, label: 'Established' },
              { value: 2, label: 'Guests per attendant' },
            ]}
          />
        </ScrollFloat>
      </section>

      {/* ── Velocity-reactive band ────────────────────────────── */}
      <Marquee items={properties} className="border-ink-line border-y" />

      {/* ── The signature scroll moment: photographic walkthrough ── */}
      <ScrollTour suite={showcase} />

      {/* ── Horizontal collection ─────────────────────────────── */}
      <HorizontalSuites />

      {/* ── Amenities ─────────────────────────────────────────── */}
      <section className="border-ink-line border-t">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <ScrollFloat drift={36} from={-1}>
            <p className="eyebrow">The house</p>
          </ScrollFloat>
          <SplitText as="h2" className="font-display text-headline mt-4" stagger={0.05}>
            What is kept for you
          </SplitText>

          <div className="mt-16 grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity, i) => {
              const Icon = amenityIcons[amenity.icon] ?? fallbackIcon
              return (
                <ScrollFloat
                  key={amenity.id}
                  drift={40 + (i % 3) * 26}
                  from={i % 2 === 0 ? -1 : 1}
                  scaleFrom={0.96}
                >
                  <Icon className="text-gold size-5" />
                  <h3 className="font-display mt-5 text-xl">{amenity.name}</h3>
                  <p className="text-bone-muted mt-3 text-sm leading-relaxed">
                    {amenity.description}
                  </p>
                </ScrollFloat>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Parallax gallery ──────────────────────────────────── */}
      <section className="border-ink-line border-t">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <ScrollFloat drift={36} from={-1}>
            <p className="eyebrow">Between the rooms</p>
          </ScrollFloat>
          <SplitText as="h2" className="font-display text-headline mt-4" stagger={0.05}>
            The grounds
          </SplitText>

          <GalleryGrid />
        </div>
      </section>

      {/* ── Closing ───────────────────────────────────────────── */}
      <section className="border-ink-line border-t">
        <div className="mx-auto max-w-3xl px-6 py-28 text-center md:py-40">
          <ScrollFloat drift={36}>
            <p className="eyebrow">Reservations</p>
          </ScrollFloat>
          <SplitText
            as="h2"
            className="font-display text-headline mt-6"
            stagger={0.05}
          >
            The rooms are quiet. The rest is arranged.
          </SplitText>
          <ScrollFloat drift={50} skew={2.4}>
            <Magnetic className="mt-12 inline-block">
              <Link to="/booking" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                Check availability
              </Link>
            </Magnetic>
          </ScrollFloat>
        </div>
      </section>
    </>
  )
}
