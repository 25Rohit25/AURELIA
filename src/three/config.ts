/**
 * 3D configuration — the seam between the demo scene and real assets.
 *
 * ─────────────────────────────────────────────────────────────
 * PLUGGING IN A REAL GLB
 * Set `SUITE_MODEL_URL` to a .glb/.gltf path and the scene swaps from
 * the procedural room to that model automatically. Nothing else needs
 * to change: loading, Draco/Meshopt decoding, centring, shadows and
 * the camera rig are already wired for it.
 *
 *   export const SUITE_MODEL_URL = '/models/suite.glb'
 *
 * Put the file in `public/models/`. Keep it under ~15 MB and Draco- or
 * Meshopt-compressed, or first paint will suffer badly on mobile.
 * ─────────────────────────────────────────────────────────────
 */
export const SUITE_MODEL_URL: string | null = null

/** CC0 environment map, vendored into `public/` — see public/hdri/LICENSE.txt. */
export const HDRI_URL = '/hdri/venice_sunset_1k.hdr'

/**
 * Draco decoder location. Google's CDN is the default drei uses.
 * For an air-gapped or offline-guaranteed deploy, copy the decoder from
 * `node_modules/three/examples/jsm/libs/draco/` into `public/draco/`
 * and point this at '/draco/'.
 */
export const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/'

/** Room dimensions in metres. The camera rig and hotspots derive from these. */
export const ROOM = {
  width: 8,
  height: 3.2,
  depth: 7,
  wallThickness: 0.15,
  window: { width: 5, sill: 0.4, head: 2.6 },
} as const
