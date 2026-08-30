/**
 * The scroll-driven walkthrough.
 *
 * Each station is a real 360° photographic capture (CC0, see
 * public/panoramas/LICENSE.txt) mapped to the inside of a sphere. Scroll
 * position drives the camera's yaw, pitch, field of view, roll and a
 * small forward dolly, so the visitor genuinely looks around a real room
 * and then moves through into the next space.
 *
 * ── Reading the angles ──────────────────────────────────────────
 * `yaw`   degrees about the vertical axis. 0° faces the centre of the
 *         equirectangular image; +90° is a quarter turn right.
 * `pitch` degrees up (+) or down (−).
 * `fov`   vertical field of view. 92° reads as standing back in a
 *         doorway; 44° as leaning in close to something.
 * `dolly` camera offset from the sphere centre, in scene units of a
 *         10-unit radius. Produces genuine push-in parallax, not a zoom.
 * `roll`  a degree or two of dutch tilt. Almost subliminal, but it is
 *         what stops a move reading as a machine panning.
 *
 * Each station is choreographed as a shot list: a wide establishing
 * frame, a pan across the room, a look up at whatever the architecture
 * actually does overhead, then a push in on the thing worth seeing.
 */

export interface TourKeyframe {
  yaw: number
  pitch: number
  fov: number
  dolly: number
  roll?: number
}

export interface TourStation {
  id: string
  /** File in public/panoramas, without extension. */
  panorama: string
  eyebrow: string
  title: string
  caption: string
  /** Short label for the chapter rail. */
  chapter: string
  frames: TourKeyframe[]
}

export const tour: TourStation[] = [
  {
    id: 'arrival',
    panorama: 'relax_inn_seaview_suite',
    eyebrow: 'Arrival',
    chapter: 'The Suite',
    title: 'The door closes behind you',
    caption: 'Ninety square metres, and the first thing you notice is how quiet it is.',
    frames: [
      { yaw: -150, pitch: -6, fov: 94, dolly: -0.8, roll: -1.2 }, // in the doorway, wide
      { yaw: -72, pitch: -2, fov: 80, dolly: -0.2, roll: 0 }, //     across the chaise
      { yaw: -20, pitch: 9, fov: 72, dolly: 0.2, roll: 0.9 }, //     up to the lantern
      { yaw: 40, pitch: -2, fov: 62, dolly: 0.7, roll: 0 }, //       toward the balcony
      { yaw: 84, pitch: -8, fov: 46, dolly: 1.4, roll: -0.6 }, //    in on the bed
    ],
  },
  {
    id: 'bedroom',
    panorama: 'hotel_room',
    eyebrow: 'The room',
    chapter: 'The Bedroom',
    title: 'Nothing in here glows',
    caption:
      'No clock, no standby light. The only warm thing after dark is the lamp you choose to switch on.',
    frames: [
      { yaw: -140, pitch: -4, fov: 92, dolly: -0.7, roll: 1 },
      { yaw: -72, pitch: 0, fov: 78, dolly: -0.1, roll: 0 }, //      the desk
      { yaw: -18, pitch: 13, fov: 70, dolly: 0.3, roll: -0.8 }, //   up at the pendants
      { yaw: 20, pitch: -2, fov: 60, dolly: 0.8, roll: 0 }, //       the curtains
      { yaw: 76, pitch: -10, fov: 44, dolly: 1.5, roll: 0.6 }, //    down onto the bed
    ],
  },
  {
    id: 'lounge',
    panorama: 'wooden_lounge',
    eyebrow: 'The house',
    chapter: 'The Lounge',
    title: 'A room built from one tree',
    caption: 'Curved timber, low seating, and a ceiling that carries sound the way a cello does.',
    frames: [
      { yaw: -140, pitch: 2, fov: 95, dolly: -0.8, roll: -1 },
      { yaw: -70, pitch: -2, fov: 80, dolly: -0.2, roll: 0 },
      { yaw: -10, pitch: 17, fov: 74, dolly: 0.2, roll: 1.1 }, //    the vault overhead
      { yaw: 40, pitch: 0, fov: 62, dolly: 0.8, roll: 0 },
      { yaw: 64, pitch: -6, fov: 48, dolly: 1.4, roll: -0.5 },
    ],
  },
  {
    id: 'bathhouse',
    panorama: 'indoor_pool',
    eyebrow: 'The bathhouse',
    chapter: 'The Bathhouse',
    title: 'Open from five in the morning',
    caption:
      'Heated year round. Swimming at three in the morning is permitted, and quietly encouraged.',
    frames: [
      { yaw: -150, pitch: -6, fov: 92, dolly: -0.8, roll: 0.8 },
      { yaw: -90, pitch: -4, fov: 80, dolly: -0.2, roll: 0 }, //     the loungers
      { yaw: -20, pitch: 11, fov: 72, dolly: 0.3, roll: -1 }, //     the vaulted ceiling
      { yaw: 6, pitch: -13, fov: 60, dolly: 0.9, roll: 0 }, //       down into the water
      { yaw: 44, pitch: -6, fov: 46, dolly: 1.4, roll: 0.6 },
    ],
  },
  {
    id: 'deck',
    panorama: 'sundowner_deck',
    eyebrow: 'Last light',
    chapter: 'The Deck',
    title: 'And then you stop moving',
    caption: 'The deck faces west. Dinner is at eight, but nobody is counting.',
    frames: [
      { yaw: 120, pitch: -4, fov: 92, dolly: -0.8, roll: -1 }, //    in from the right
      { yaw: 60, pitch: 2, fov: 80, dolly: -0.2, roll: 0 },
      { yaw: 10, pitch: 15, fov: 74, dolly: 0.2, roll: 0.8 }, //     the timber roof
      { yaw: 0, pitch: -4, fov: 58, dolly: 0.9, roll: 0 }, //        out to the water
      { yaw: -6, pitch: 0, fov: 44, dolly: 1.6, roll: 0 }, //        the horizon
    ],
  },
]

/**
 * Resolve a panorama file.
 *
 * `compact` selects the 2560x1280 variant. A 5120x2560 texture occupies
 * roughly 50 MB of GPU memory once decoded and the walkthrough holds two
 * at a time; on a phone that is enough to get the tab killed. The small
 * variant costs about 12 MB and is indistinguishable at phone FOV.
 */
export function panoramaUrl(name: string, compact = false): string {
  return `/panoramas/${name}${compact ? '-sm' : ''}.jpg`
}
