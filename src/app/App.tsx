import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Cursor } from '@/components/common/Cursor'
import { ScrollProgress } from '@/components/common/ScrollProgress'
import { IntroCurtain } from '@/components/common/IntroCurtain'
import { Grain } from '@/components/common/Grain'
import { Landing } from '@/pages/Landing'
import { SuiteDetail } from '@/pages/SuiteDetail'
import { Booking } from '@/pages/Booking'
import { useLenis } from '@/hooks/useLenis'
import { EASE_LUXE } from '@/motion/variants'

/** Route changes should start at the top, not wherever the last page was. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/**
 * Routed content with a cross-fade between pages.
 *
 * `mode="wait"` lets the outgoing page finish before the next mounts, so
 * two full pages are never composited at once — which matters here
 * because a route can own a WebGL canvas.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE_LUXE }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/suites/:suiteId" element={<SuiteDetail />} />
          <Route path="/booking" element={<Booking />} />
          {/* Anything else falls back to the collection. */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

function Shell() {
  useLenis()
  return (
    <>
      <IntroCurtain />
      <Grain />
      <ScrollProgress />
      <Cursor />
      <ScrollToTop />
      <Header />
      <AnimatedRoutes />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  )
}
