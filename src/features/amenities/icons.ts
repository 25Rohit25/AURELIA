import { BellRing, Droplets, Sparkles, Trees, UtensilsCrossed, Waves, Wine } from 'lucide-react'
import type { ComponentType } from 'react'

/**
 * Explicit icon registry.
 *
 * Deliberately NOT `import * as Icons from 'lucide-react'` — the wildcard
 * defeats tree-shaking and drags the entire icon set (~1000 components)
 * into the bundle. Only the icons actually named in `data/aurelia.ts`
 * appear here; add to this map when adding an amenity.
 */
export const amenityIcons: Record<string, ComponentType<{ className?: string }>> = {
  Droplets,
  UtensilsCrossed,
  Waves,
  BellRing,
  Wine,
  Trees,
}

export const fallbackIcon = Sparkles
