# AURELIA

A premium interactive 3D hotel & resort website, built as a portfolio demonstration
for selling hospitality sites to real clients.

**AURELIA is a fictional brand.** No real hotel names, logos, or marks appear
anywhere in this project.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # typecheck + production bundle
npm run lint
```

## Stack

| | |
|---|---|
| React 19.2 · TypeScript 6 · Vite 8 (Rolldown) | App shell |
| Tailwind CSS v4 (`@theme` tokens) | Styling |
| three 0.185 · R3F 9 · drei 10 · postprocessing | 3D |
| Motion 13 | Animation |
| React Router 7 | Routing |

React is pinned to `~19.2.8`: `@react-three/fiber@9` declares a peer range of
`>=19 <19.3`, so a caret range would silently break on the next React minor.

## Architecture

```
src/
├── app/          App shell + router
├── pages/        Landing · SuiteDetail · Booking
├── features/     suites · booking · amenities  (vertical slices)
├── three/        ALL React Three Fiber lives here
│   ├── canvas/     TourCanvas (scroll walkthrough) · PanoViewer
│   │               (drag to look) · SceneCanvas (GLB / procedural)
│   ├── scenes/     PanoSphere · SuiteRoom (procedural) · Hotspot
│   ├── controls/   TourCamera · ScrollCamera
│   ├── models/     SuiteModel — GLB/GLTF slot
│   ├── effects/    PanoPostFX · PostFX — adaptive, tier-gated
│   └── config.ts   ← model + HDRI configuration
├── components/   ui (shadcn-style) · layout · common
├── motion/       Shared variants and easings
├── data/         aurelia.ts  ← content and image URLs
│                 tour.ts     ← walkthrough stations + camera angles
└── types/

public/
├── panoramas/    Five CC0 360° room captures
└── hdri/         CC0 environment map
```

`three/` is a hard boundary. Product code renders `<SceneCanvas />` and never
imports R3F directly, so the 3D layer stays swappable.

## Swapping in real client content

**Images** — every photograph is referenced by id in `src/data/aurelia.ts`.
Replace `imageUrl()` with the client's CDN and swap the ids. No component
changes needed.

Current imagery is served from Unsplash under the [Unsplash License][ul] (free
for commercial use, no attribution required). Every id was fetched and visually
checked: no real hotel branding, signage, or identifiable marks appear in any
frame.

**3D model** — set one constant in `src/three/config.ts`:

```ts
export const SUITE_MODEL_URL = '/models/suite.glb'
```

The scene switches from the procedural room to that model automatically. Draco
decoding, shadow flags, colour-space correction, centring and scale
normalisation are already wired. Keep the file under ~15 MB and
Draco/Meshopt-compressed.

## The 3D experience

The rooms you move through are **real 360° photographic captures**, not
modelled geometry. Each is an equirectangular panorama mapped to the
inside of a sphere with the camera at its centre — genuine 3D navigation
of a real space, the same technique Street View uses, rather than a flat
photo being panned.

- **Landing** — a pinned walkthrough. Scroll drives the camera's yaw,
  pitch, field of view and a small forward dolly across five rooms, then
  cross-fades into the next. Suite → bedroom → lounge → bathhouse → deck.
- **Suite pages** — drag to look around that suite's room, with inertia
  after release and a slow idle drift.

Panoramas are CC0 from [Poly Haven][ph], downscaled from 8192×4096 to
5120×2560 (JPEG q80) and vendored into `public/panoramas/` — 0.8–2.6 MB
each, and only the current room plus its neighbours are ever mounted. See
`public/panoramas/LICENSE.txt`.

### The procedural room and the GLB slot

A hand-built procedural suite still ships (`three/scenes/SuiteRoom.tsx`),
lit by a CC0 HDRI, because it is what the GLB slot renders into. Set one
constant in `src/three/config.ts`:

```ts
export const SUITE_MODEL_URL = '/models/suite.glb'
```

…and every suite page switches from the 360° capture to that model, with
Draco decoding, shadow flags, colour-space correction and scale
normalisation already wired.

## Colour

A warm palette, not a neutral one: every surface carries a little red and
yellow so the shell and the photography read as one material. Tokens live
in `src/index.css` (`@theme`); three.js cannot read CSS custom properties,
so the same values are mirrored once in `src/lib/palette.ts` and imported
by the 3D layer.

| | |
|---|---|
| Ground | `#0a0907` warm espresso |
| Raised | `#1b1712` |
| Text | `#f1ebe0` warm ivory |
| Accent | `#c29b5a` antique brass |

Everything photographic is graded to match. The stock images get a CSS
`.graded` filter; the panoramas get the equivalent in postprocessing
(`HueSaturation` + `BrightnessContrast`). Without it, five captures shot
in five buildings under five white balances look like five stock photos.

## Responsive

- Pinned sections are measured in `svh`, not `vh`/`dvh`. On mobile the URL
  bar hides as you scroll; with `dvh` the sticky section resizes mid-scroll
  and the walkthrough visibly jumps.
- Panoramas ship at two resolutions. A 5120x2560 texture costs ~50 MB of
  GPU memory and the walkthrough holds two at once — enough to get a phone
  tab killed. Under 900px the 2560x1280 variant loads instead (~12 MB).
- Scroll length per room shortens on phones (105svh vs 145svh); the
  horizontal section likewise.
- The panorama viewer uses `touch-pan-y`, so a vertical swipe still scrolls
  the page while a horizontal drag turns the room.
- Full-screen `MobileNav` below `md` — the desktop nav hides there, which
  previously left phones with no navigation at all.
- Cursor, magnetic buttons and tilt are all pointer-aware and inert on touch.

## Degradation

Nothing on this site can show a broken image or a blank rectangle.

- **Images** — blurred placeholder → full photo fades in → on error, a locally
  generated gradient in the brand palette, deterministic per id. Works offline.
- **WebGL absent** — every 3D section falls back to photography.
- **Weak GPU** — `useWebGLTier()` probes the renderer; the low tier drops
  postprocessing, halves shadow resolution and caps DPR.
- **Reduced motion** — postprocessing and camera drift are disabled; CSS
  transitions collapse to near-zero globally.

## Known limitations

- The booking flow is a front-end demonstration. No payment is taken and no
  reservation is persisted.
- The Draco decoder loads from Google's CDN by default. For an offline-guaranteed
  deploy, copy `node_modules/three/examples/jsm/libs/draco/` into `public/draco/`
  and repoint `DRACO_DECODER_PATH`.
- Two suites share a panorama (`hotel_room`), since only five distinct
  captures are vendored. Per-suite rooms are a drop-in: add a file to
  `public/panoramas/` and point the suite's `panorama` field at it.

[ul]: https://unsplash.com/license
[ph]: https://polyhaven.com/a/venice_sunset
