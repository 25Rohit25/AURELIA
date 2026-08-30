import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'

import { gallery } from '@/data/aurelia'
import { Image } from '@/components/common/Image'
import { Parallax } from '@/components/common/Parallax'
import { EASE_LUXE } from '@/motion/variants'
import { cn } from '@/lib/utils'

/**
 * Gallery with a shared-element lightbox.
 *
 * The expanding tile and the full-size view share a `layoutId`, so
 * Motion interpolates between the two positions rather than
 * cross-fading — the thumbnail physically becomes the large image and
 * flies back to its place in the grid on close.
 *
 * Grid spans are breakpoint-aware: a tile that spans two columns on
 * desktop must not do so in a two-column phone layout, or it becomes a
 * full-bleed band and the rhythm collapses.
 */
export function GalleryGrid() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = gallery.find((g) => `${g.id}` === openId)

  // Escape closes, and the page must not scroll behind the overlay.
  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null)
    }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.documentElement.style.overflow = ''
    }
  }, [openId])

  return (
    <>
      <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:auto-rows-[260px] md:grid-cols-4 md:gap-4">
        {gallery.map((item, i) => (
          <motion.button
            key={`${item.id}-${i}`}
            layoutId={`tile-${item.id}-${i}`}
            onClick={() => setOpenId(item.id)}
            aria-label={`View ${item.caption}`}
            className={cn(
              'group relative overflow-hidden',
              // Wide tiles only span on md+; on phones everything is 1×1
              // so the two-column grid keeps its rhythm.
              item.span === 'wide' && 'md:col-span-2',
              item.span === 'tall' && 'row-span-2',
            )}
          >
            <Parallax className="size-full" distance={i % 2 === 0 ? 50 : -50}>
              <Image
                id={item.id}
                alt={item.caption}
                width={1100}
                className="size-full transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
            </Parallax>
            <div className="from-ink/90 pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              <p className="p-4 text-left text-[10px] tracking-[0.18em] uppercase md:p-5">
                {item.caption}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bg-ink/92 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-xl md:p-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_LUXE }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              layoutId={`tile-${open.id}-${gallery.findIndex((g) => g.id === open.id)}`}
              className="relative max-h-full w-full max-w-5xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image id={open.id} alt={open.caption} width={2000} className="w-full" priority />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: EASE_LUXE }}
                className="from-ink/90 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-6 text-[10px] tracking-[0.18em] uppercase"
              >
                {open.caption}
              </motion.p>
            </motion.div>

            <button
              type="button"
              onClick={() => setOpenId(null)}
              aria-label="Close"
              className="text-bone-muted hover:text-gold absolute top-6 right-6 transition-colors duration-500"
            >
              <X className="size-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
