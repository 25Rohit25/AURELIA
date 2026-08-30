import { useEffect, useState } from 'react'

/**
 * Matches a media query, without setting state during mount.
 *
 * The first value is read lazily in the initialiser, and only genuine
 * media-query *changes* write state afterwards — so rotating a tablet
 * updates the layout, but arriving on the page costs no extra render.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * True on phones and small tablets.
 *
 * Drives panorama resolution: a 5120×2560 texture costs ~50 MB of GPU
 * memory, and the walkthrough holds two at once. On a phone that is
 * enough to have the tab killed, so small screens get the 2560×1280
 * variant at ~12 MB instead.
 */
export function useIsCompact(): boolean {
  return useMediaQuery('(max-width: 900px)')
}
