import { useMemo, useState } from 'react'

import { imageUrl, placeholderUrl } from '@/data/aurelia'
import { fallbackGradients } from '@/lib/palette'
import { cn, hashString } from '@/lib/utils'

interface ImageProps {
  /** Unsplash photo id (without the `photo-` prefix). */
  id: string
  alt: string
  /** Requested width from the CDN. */
  width?: number
  className?: string
  /** Skip lazy-loading for above-the-fold art. */
  priority?: boolean
}

/**
 * Remote image with a three-stage graceful degradation path:
 *
 *   1. A blurred 24px frame of the same photo paints immediately.
 *   2. The full image fades in over it once decoded.
 *   3. If the network or CDN fails, a locally generated gradient in the
 *      AURELIA palette takes its place — deterministic per id, so the
 *      same tile always fails to the same colour. No broken-image icon,
 *      and no dependency on any remote asset.
 */
export function Image({ id, alt, width = 1600, className, priority = false }: ImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  // Deterministic two-stop gradient derived from the id.
  const fallback = useMemo(() => {
    const h = hashString(id)
    const angle = h % 360
    const pair = fallbackGradients[h % fallbackGradients.length]
    return { angle, from: pair[0], to: pair[1] }
  }, [id])

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('bg-ink-raised relative overflow-hidden', className)}
        style={{
          backgroundImage: `linear-gradient(${fallback.angle}deg, ${fallback.from}, ${fallback.to})`,
        }}
      >
        {/* A faint gold rule keeps the empty state feeling intentional. */}
        <div className="absolute inset-x-6 bottom-6 flex items-center gap-3">
          <span className="bg-gold/40 h-px flex-1" />
          <span className="text-gold/50 text-[10px] tracking-[0.2em] uppercase">Aurelia</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-ink-raised relative overflow-hidden', className)}>
      {/* Stage 1 — blurred placeholder, scaled up to hide compression. */}
      <img
        src={placeholderUrl(id)}
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute inset-0 size-full scale-110 object-cover blur-xl transition-opacity duration-700',
          loaded ? 'opacity-0' : 'opacity-100',
        )}
      />

      {/* Stage 2 — the real photograph. */}
      <img
        src={imageUrl(id, width)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          'graded relative size-full object-cover transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
          loaded ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
