import { Link } from 'react-router-dom'
import { ArrowUpRight, Box } from 'lucide-react'

import type { Suite } from '@/types/aurelia'
import { Image } from '@/components/common/Image'
import { formatPrice } from '@/lib/utils'

export function SuiteCard({ suite }: { suite: Suite }) {
  return (
    <Link to={`/suites/${suite.id}`} className="group block">
      <div className="relative aspect-4/5 overflow-hidden">
        <Image
          id={suite.heroId}
          alt={suite.name}
          width={900}
          className="size-full transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />

        <div className="from-ink/85 pointer-events-none absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

        {suite.hasTour && (
          <span className="bg-ink/70 text-gold absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] tracking-[0.18em] uppercase backdrop-blur">
            <Box className="size-3" />
            3D tour
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="text-bone-muted text-[10px] tracking-[0.2em] uppercase">{suite.property}</p>
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

      <p className="text-bone-muted mt-3 flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase transition-colors duration-500 group-hover:text-gold">
        View suite
        <ArrowUpRight className="size-3 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </p>
    </Link>
  )
}
