import { useMemo, useState } from 'react'
import { Check } from 'lucide-react'

import { suites } from '@/data/aurelia'
import { Button } from '@/components/ui/button'
import { Image } from '@/components/common/Image'
import { cn, formatPrice, nightsBetween } from '@/lib/utils'

/** `yyyy-mm-dd` for a date `offset` days from today — the <input type="date"> format. */
function isoDate(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

const fieldClass =
  'w-full bg-transparent border border-ink-line px-4 py-3 text-sm text-bone outline-none transition-colors duration-500 focus:border-gold [color-scheme:dark]'

const labelClass = 'block text-[10px] uppercase tracking-[0.2em] text-bone-muted mb-2.5'

export function BookingForm({ initialSuiteId }: { initialSuiteId?: string }) {
  const [suiteId, setSuiteId] = useState(initialSuiteId ?? suites[1].id)
  const [arrive, setArrive] = useState(isoDate(14))
  const [depart, setDepart] = useState(isoDate(17))
  const [guests, setGuests] = useState(2)
  const [submitted, setSubmitted] = useState(false)

  const suite = suites.find((s) => s.id === suiteId) ?? suites[0]

  const { nights, subtotal, service, total, datesValid } = useMemo(() => {
    const from = new Date(arrive)
    const to = new Date(depart)
    const n = nightsBetween(from, to)
    const sub = n * suite.price
    const svc = Math.round(sub * 0.09)
    return {
      nights: n,
      subtotal: sub,
      service: svc,
      total: sub + svc,
      datesValid: n > 0,
    }
  }, [arrive, depart, suite.price])

  const guestsValid = guests > 0 && guests <= suite.maxGuests
  const canSubmit = datesValid && guestsValid

  if (submitted) {
    return (
      <div className="border-ink-line bg-ink-soft border p-10 text-center">
        <span className="bg-gold/15 text-gold mx-auto flex size-12 items-center justify-center rounded-full">
          <Check className="size-5" />
        </span>
        <h3 className="font-display mt-6 text-2xl">Request received</h3>
        <p className="text-bone-muted mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          A reservations attendant will confirm {suite.name} for {nights} night
          {nights === 1 ? '' : 's'} within the hour. This is a portfolio demonstration — no
          booking has been made and no payment was taken.
        </p>
        <Button variant="outline" className="mt-8" onClick={() => setSubmitted(false)}>
          Start over
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
      <form
        className="space-y-7"
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) setSubmitted(true)
        }}
      >
        <div>
          <label htmlFor="suite" className={labelClass}>
            Suite
          </label>
          <select
            id="suite"
            value={suiteId}
            onChange={(e) => setSuiteId(e.target.value)}
            className={cn(fieldClass, 'appearance-none')}
          >
            {suites.map((s) => (
              <option key={s.id} value={s.id} className="bg-ink">
                {s.name} — {s.property}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="arrive" className={labelClass}>
              Arrival
            </label>
            <input
              id="arrive"
              type="date"
              value={arrive}
              min={isoDate(0)}
              onChange={(e) => setArrive(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="depart" className={labelClass}>
              Departure
            </label>
            <input
              id="depart"
              type="date"
              value={depart}
              min={arrive}
              onChange={(e) => setDepart(e.target.value)}
              className={cn(fieldClass, !datesValid && 'border-red-500/60')}
            />
          </div>
        </div>

        {!datesValid && (
          <p className="text-sm text-red-400/90">Departure must be after arrival.</p>
        )}

        <div>
          <label htmlFor="guests" className={labelClass}>
            Guests — maximum {suite.maxGuests} in this suite
          </label>
          <input
            id="guests"
            type="number"
            min={1}
            max={suite.maxGuests}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={cn(fieldClass, !guestsValid && 'border-red-500/60')}
          />
          {!guestsValid && (
            <p className="mt-2 text-sm text-red-400/90">
              {suite.name} sleeps up to {suite.maxGuests}.
            </p>
          )}
        </div>

        <Button type="submit" size="lg" disabled={!canSubmit} className="w-full">
          Request reservation
        </Button>

        <p className="text-bone-muted/60 text-center text-[10px] tracking-[0.14em] uppercase">
          Demonstration only — no payment is taken
        </p>
      </form>

      {/* ── Summary ───────────────────────────────────────────── */}
      <aside className="border-ink-line bg-ink-soft h-fit border">
        <Image id={suite.heroId} alt={suite.name} width={800} className="aspect-3/2 w-full" />

        <div className="p-7">
          <p className="text-bone-muted text-[10px] tracking-[0.2em] uppercase">
            {suite.property}
          </p>
          <h3 className="font-display mt-1.5 text-2xl">{suite.name}</h3>
          <p className="text-bone-muted mt-1 text-sm">{suite.location}</p>

          <dl className="border-ink-line mt-7 space-y-3 border-t pt-6 text-sm">
            <Row label={`${formatPrice(suite.price)} × ${nights} night${nights === 1 ? '' : 's'}`}>
              {formatPrice(subtotal)}
            </Row>
            <Row label="Service">{formatPrice(service)}</Row>
            <div className="border-ink-line flex items-baseline justify-between border-t pt-4">
              <dt className="text-[10px] tracking-[0.2em] uppercase">Total</dt>
              <dd className="font-display text-gold text-2xl">{formatPrice(total)}</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-bone-muted">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}
