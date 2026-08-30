/**
 * The AURELIA palette as plain hex.
 *
 * Tailwind's `@theme` block in `index.css` is the source of truth for
 * anything rendered as DOM. But three.js materials, `<color>`, `<fog>`
 * and canvas clear colours cannot read a CSS custom property — they need
 * literal values. Those literals live here rather than being sprinkled
 * through the 3D layer, so a palette change is one edit in two files
 * instead of a hunt through every scene.
 *
 * Keep these in sync with the `--color-*` tokens in `src/index.css`.
 */
export const palette = {
  ink: '#0a0907',
  inkSoft: '#12100c',
  inkRaised: '#1b1712',
  inkLine: '#2b2519',

  bone: '#f1ebe0',
  boneDim: '#d8cfc0',
  boneMuted: '#9a8f7d',

  gold: '#c29b5a',
  goldBright: '#e6c88e',
  goldDim: '#7d6234',

  clay: '#a65e43',
  sage: '#6f7a66',
} as const

/**
 * Warm/cool pairs used by the image fallback gradient. Each failed image
 * picks one deterministically from its id, so the same tile always fails
 * to the same colour instead of flickering between loads.
 */
export const fallbackGradients: ReadonlyArray<readonly [string, string]> = [
  ['#1b1712', '#2b2519'],
  ['#1a1611', '#3a3227'],
  ['#141613', '#2a3128'],
  ['#1d1a13', '#4a3d2a'],
]
