import { useSearchParams } from 'react-router-dom'

import { BookingForm } from '@/features/booking/BookingForm'
import { Reveal } from '@/components/common/Reveal'
import { SplitText } from '@/components/common/SplitText'

export function Booking() {
  const [params] = useSearchParams()
  const suiteId = params.get('suite') ?? undefined

  return (
    <section className="mx-auto max-w-7xl px-6 pt-40 pb-28">
      <Reveal>
        <p className="eyebrow">Reservations</p>
        <SplitText
          as="h1"
          trigger="mount"
          delay={0.15}
          className="font-display text-headline mt-4"
        >
          Arrange your stay
        </SplitText>
        <p className="text-bone-muted mt-5 max-w-lg text-sm leading-relaxed">
          Tell us when, and we will do the rest. Every reservation is confirmed by a person, not
          a system.
        </p>
      </Reveal>

      <Reveal delay={0.1} intensity="soft" className="mt-16">
        <BookingForm initialSuiteId={suiteId} />
      </Reveal>
    </section>
  )
}
