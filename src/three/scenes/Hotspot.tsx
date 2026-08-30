import type React from 'react'
import { useState } from 'react'
import { Html } from '@react-three/drei'

import { palette } from '@/lib/palette'

interface HotspotProps {
  position: [number, number, number]
  label: string
}

/**
 * A point of interest anchored in 3D space, rendered as DOM via drei's
 * <Html>. `occlude` hides the marker when geometry moves in front of it,
 * so labels never float through walls as the camera orbits.
 */
export function Hotspot({ position, label }: HotspotProps) {
  const [open, setOpen] = useState(false)

  return (
    <Html position={position} center occlude distanceFactor={9} zIndexRange={[20, 0]}>
      <button
        type="button"
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        aria-label={label}
        // drei's <Html> portals this out of the canvas into the DOM, so
        // Tailwind works — but three.js has no access to CSS tokens, so
        // the palette is injected here as custom properties.
        style={
          {
            '--pin': palette.gold,
            '--pin-bright': palette.goldBright,
            '--pin-ink': palette.ink,
            '--pin-bone': palette.bone,
          } as React.CSSProperties
        }
        className="group relative flex size-5 items-center justify-center"
      >
        <span className="absolute inline-flex size-5 animate-ping rounded-full bg-[color:var(--pin)]/30" />
        <span className="relative inline-flex size-2 rounded-full bg-[color:var(--pin-bright)] ring-1 ring-[color:var(--pin)]/60" />

        <span
          className="pointer-events-none absolute left-1/2 bottom-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-[color:var(--pin-ink)]/90 px-3 py-1.5 text-[9px] tracking-[0.18em] text-[color:var(--pin-bone)] uppercase backdrop-blur transition-all duration-300"
          style={{ opacity: open ? 1 : 0, transform: `translate(-50%, ${open ? '0' : '4px'})` }}
        >
          {label}
        </span>
      </button>
    </Html>
  )
}
