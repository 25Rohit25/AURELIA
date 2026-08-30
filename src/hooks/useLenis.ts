import { useEffect } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'motion/react'

/**
 * Inertial smooth scrolling.
 *
 * This is the single biggest contributor to how a site of this genre
 * "feels" — native scroll snaps to the wheel, whereas an eased scroll
 * carries weight and makes every scroll-linked animation read as
 * deliberate rather than jittery.
 *
 * Lenis performs real window scrolling (not a transform on the body), so
 * Motion's `useScroll`, IntersectionObserver and anchor links all keep
 * working untouched.
 *
 * Disabled entirely under `prefers-reduced-motion`: hijacking scroll
 * inertia is exactly what that setting exists to prevent.
 */
export function useLenis() {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    const lenis = new Lenis({
      // A slightly longer glide than the default, with a very soft tail.
      // Long enough to feel weighted, short enough that the scroll-linked
      // camera never lags visibly behind the wheel.
      duration: 1.35,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.085,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.5,
      // Native touch scrolling on phones beats emulated inertia — it keeps
      // the platform's own rubber-banding and momentum, which users expect.
      syncTouch: false,
      // Never hijack scrolling inside a nested scroller or a drag surface.
      prevent: (node) => node.hasAttribute?.('data-lenis-prevent') ?? false,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reducedMotion])
}
