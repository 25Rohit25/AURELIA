import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'

import { brand } from '@/data/aurelia'
import { buttonVariants } from '@/components/ui/button-variants'
import { Magnetic } from '@/components/common/Magnetic'
import { MobileNav } from '@/components/layout/MobileNav'
import { EASE_LUXE } from '@/motion/variants'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/', label: 'The Collection' },
  { to: '/suites/cliffside-villa', label: 'Suites' },
  { to: '/booking', label: 'Reserve' },
]

/**
 * Header that gets out of the way.
 *
 * It condenses once you leave the top, then hides entirely while you
 * scroll down and returns the moment you scroll up — so the walkthrough
 * gets the full viewport, but navigation is never more than a flick
 * away. Direction is read from the scroll MotionValue rather than a
 * scroll listener, so it costs one state change per direction change
 * instead of one per frame.
 */
export function Header() {
  const { scrollY } = useScroll()
  const [condensed, setCondensed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const goingDown = y > lastY.current
    const past = y > 120

    if (past !== condensed) setCondensed(past)
    // A small threshold stops a jittery trackpad from flapping it.
    if (Math.abs(y - lastY.current) > 6) {
      const shouldHide = goingDown && y > 320
      if (shouldHide !== hidden) setHidden(shouldHide)
    }
    lastY.current = y
  })

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: hidden ? -110 : 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: EASE_LUXE }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[padding,background-color,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        condensed
          ? 'bg-ink/70 border-ink-line border-b py-4 backdrop-blur-xl'
          : 'border-b border-transparent py-7',
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="font-display hover:text-gold text-xl tracking-[0.34em] transition-colors duration-500"
        >
          {brand.name}
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative text-[10px] tracking-[0.2em] uppercase transition-colors duration-500',
                  isActive ? 'text-gold' : 'text-bone-muted hover:text-bone',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {/* Underline grows from the left on hover and stays for the active route. */}
                  <span
                    className={cn(
                      'bg-gold absolute -bottom-1.5 left-0 h-px origin-left transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                      'w-full',
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Magnetic strength={7} className="hidden md:block">
            <Link to="/booking" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Reserve
            </Link>
          </Magnetic>
          <MobileNav />
        </div>
      </div>
    </motion.header>
  )
}
