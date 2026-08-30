/**
 * Fixed film grain.
 *
 * A very low-opacity fractal-noise layer over the whole page. It is
 * almost invisible on its own, but it breaks up the flat gradients in
 * large dark areas — which is what stops an obsidian palette from
 * banding on 8-bit displays, and reads as photographic rather than
 * digital.
 *
 * Inline SVG turbulence rather than an image: no request, no decode.
 */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[65] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'repeat',
      }}
    />
  )
}
