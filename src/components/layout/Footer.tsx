import { Link } from 'react-router-dom'

import { brand, suites } from '@/data/aurelia'

export function Footer() {
  const properties = [...new Set(suites.map((s) => s.property))]

  return (
    <footer className="border-ink-line border-t">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl tracking-[0.34em]">{brand.name}</p>
            <p className="text-bone-muted mt-5 max-w-xs text-sm leading-relaxed">
              {brand.description}
            </p>
          </div>

          <div>
            <p className="eyebrow">Properties</p>
            <ul className="mt-5 space-y-2.5">
              {properties.map((p) => (
                <li key={p} className="text-bone-muted text-sm">
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Reservations</p>
            <ul className="mt-5 space-y-2.5 text-sm">
              <li className="text-bone-muted">{brand.email}</li>
              <li className="text-bone-muted">{brand.phone}</li>
              <li>
                <Link to="/booking" className="hover:text-gold transition-colors duration-500">
                  Check availability
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-ink-line text-bone-muted/60 mt-16 flex flex-col gap-3 border-t pt-8 text-[10px] tracking-[0.16em] uppercase sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name} — established {brand.established}
          </p>
          <p>A fictional brand, built as a portfolio demonstration.</p>
        </div>
      </div>
    </footer>
  )
}
