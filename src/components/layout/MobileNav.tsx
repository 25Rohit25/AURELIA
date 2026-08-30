import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'

import { brand, suites } from '@/data/aurelia'
import { EASE_LUXE } from '@/motion/variants'

const links = [
  { to: '/', label: 'The Collection' },
  { to: '/booking', label: 'Reserve' },
]

/**
 * Full-screen navigation for phones and tablets.
 *
 * The desktop header hides its nav below `md`, which previously left
 * small screens with no way to reach the suites or the booking flow at
 * all. This restores it as a staggered overlay: each row rises from its
 * own mask, which is cheap and reads as considered.
 *
 * Each link closes the panel on click rather than reacting to a route
 * change in an effect, and the body is locked while it is open so the
 * page behind cannot scroll under a full-screen sheet.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [open])

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="text-bone hover:text-gold transition-colors duration-500"
      >
        <Menu className="size-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="bg-ink fixed inset-0 z-[85] flex flex-col"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: EASE_LUXE }}
          >
            <div className="flex items-center justify-between px-6 py-7">
              <span className="font-display text-xl tracking-[0.34em]">{brand.name}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="text-bone hover:text-gold transition-colors duration-500"
              >
                <X className="size-5" />
              </button>
            </div>

            <motion.nav
              className="flex flex-1 flex-col justify-center gap-1 px-6 pb-24"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
            >
              {links.map((l) => (
                <Row key={l.to} to={l.to} label={l.label} onNavigate={() => setOpen(false)} />
              ))}

              <p className="eyebrow mt-10 mb-3">Suites</p>
              {suites.map((s) => (
                <Row
                  key={s.id}
                  to={`/suites/${s.id}`}
                  label={s.name}
                  small
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Row({
  to,
  label,
  small = false,
  onNavigate,
}: {
  to: string
  label: string
  small?: boolean
  onNavigate: () => void
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        variants={{
          hidden: { y: '110%' },
          visible: { y: '0%', transition: { duration: 0.8, ease: EASE_LUXE } },
        }}
      >
        <Link
          to={to}
          onClick={onNavigate}
          className={
            small
              ? 'text-bone-muted hover:text-gold block py-1.5 text-lg transition-colors duration-500'
              : 'font-display hover:text-gold block py-1 text-4xl transition-colors duration-500'
          }
        >
          {label}
        </Link>
      </motion.span>
    </span>
  )
}
