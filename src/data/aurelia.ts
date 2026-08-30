import type { Amenity, GalleryItem, Suite } from '@/types/aurelia'

/**
 * AURELIA — fictional luxury hotel & resort collection.
 *
 * ─────────────────────────────────────────────────────────────
 * SWAP POINT FOR REAL CLIENTS
 * Every photograph on the site is referenced by an Unsplash photo
 * id below. To rebrand for a real client, replace `imageUrl()` with
 * their CDN and swap the ids for their asset keys — no component
 * changes are required anywhere else in the codebase.
 *
 * All imagery is served under the Unsplash License (free for
 * commercial use, no attribution required). Every id below was
 * fetched and visually verified: no real hotel branding, signage,
 * or identifiable marks appear in any frame.
 * ─────────────────────────────────────────────────────────────
 */

const UNSPLASH_BASE = 'https://images.unsplash.com/photo-'

/** Build a responsive, cropped Unsplash URL. */
export function imageUrl(id: string, width = 1600, quality = 72): string {
  return `${UNSPLASH_BASE}${id}?auto=format&fit=crop&w=${width}&q=${quality}`
}

/** Tiny blurred frame of the same photo, for blur-up loading. */
export function placeholderUrl(id: string): string {
  return `${UNSPLASH_BASE}${id}?auto=format&fit=crop&w=24&q=20&blur=8`
}

export const brand = {
  name: 'AURELIA',
  tagline: 'Where light lingers',
  description:
    'A collection of six retreats, each built around a single idea: that the finest luxury is time made slower.',
  established: 2009,
  email: 'reservations@aurelia.example',
  phone: '+1 (555) 0142',
} as const

export const suites: Suite[] = [
  {
    id: 'the-eyrie',
    name: 'The Eyrie',
    property: 'AURELIA Kestrel Ridge',
    location: 'Bernese Oberland, Switzerland',
    tagline: 'A room with no walls, and nothing above but weather.',
    description:
      'Our most requested and least conventional room. A platform bed set on an alpine shoulder at 1,900 metres, dressed each evening and struck each dawn. There is no ceiling. There is no door. There is a valley eleven kilometres long, and it is yours until morning.',
    price: 2400,
    sizeSqm: 40,
    maxGuests: 2,
    bedrooms: 1,
    heroId: '1596394516093-501ba68a0ba6',
    galleryIds: ['1445019980597-93fa8acb246c', '1552858725-2758b5fb1286'],
    panorama: 'sundowner_deck',
    features: [
      'Open-air platform',
      'Butler service at dawn',
      'Private funicular',
      'Weather guarantee',
    ],
    hasTour: true,
  },
  {
    id: 'cliffside-villa',
    name: 'Cliffside Villa',
    property: 'AURELIA Sirocco',
    location: 'Wadi Rum Escarpment, Jordan',
    tagline: 'Desert modernism, cut into the rock face.',
    description:
      'Board-formed concrete, tanned leather and a glass bathing pavilion cantilevered over open desert. The villa turns its back on the road and opens entirely to the west, so the whole interior fills with copper light for the last forty minutes of each day.',
    price: 1850,
    sizeSqm: 165,
    maxGuests: 4,
    bedrooms: 2,
    heroId: '1578683010236-d716f9a3f461',
    galleryIds: ['1551882547-ff40c63fe5fa', '1522771739844-6a9f6d5f14af'],
    panorama: 'relax_inn_seaview_suite',
    features: [
      'Glass bathing pavilion',
      'Private plunge pool',
      'Outdoor fire terrace',
      'Stargazing deck',
    ],
    hasTour: true,
  },
  {
    id: 'aurelia-suite',
    name: 'The Aurelia Suite',
    property: 'AURELIA Belvedere',
    location: 'Cap Ferrat, France',
    tagline: 'The signature room of the house.',
    description:
      'Walnut, bronze and unbleached linen. A corner suite with a fifteen-metre terrace above the water, and the quietest bedroom in the building — every wall isolated, every window triple-glazed. The room the founders kept for themselves.',
    price: 1450,
    sizeSqm: 95,
    maxGuests: 3,
    bedrooms: 1,
    heroId: '1618773928121-c32242e63f39',
    galleryIds: ['1566073771259-6a8506099945', '1571003123894-1f0594d2b5d9'],
    panorama: 'hotel_room',
    features: [
      'Sea-facing terrace',
      'Acoustic isolation',
      'Bronze soaking tub',
      'Nightly turndown',
    ],
    hasTour: true,
  },
  {
    id: 'heritage-grand',
    name: 'Heritage Grand',
    property: 'AURELIA Montrose',
    location: 'Edinburgh, Scotland',
    tagline: 'Nineteenth-century bones, twenty-first-century silence.',
    description:
      'Four metres of ceiling, restored plaster cornice, and a bay window over the gardens. We kept the fireplaces and the parquet, replaced everything behind the walls, and added a bed that has convinced several guests to cancel onward travel.',
    price: 980,
    sizeSqm: 78,
    maxGuests: 2,
    bedrooms: 1,
    heroId: '1590490360182-c33d57733427',
    galleryIds: ['1552858725-2758b5fb1286', '1414235077428-338989a2e8c0'],
    panorama: 'wooden_lounge',
    features: ['Working fireplace', 'Garden aspect', 'Restored cornice', 'Library access'],
    hasTour: true,
  },
  {
    id: 'garden-pavilion',
    name: 'Garden Pavilion',
    property: 'AURELIA Cala Verde',
    location: 'Ubud Valley, Bali',
    tagline: 'Teak, water and a wall that opens entirely.',
    description:
      'A single-storey pavilion set among frangipani, with a sliding teak wall that folds back to leave the bedroom open to its own courtyard. Rain on the roof is part of the design, not a defect in it.',
    price: 760,
    sizeSqm: 88,
    maxGuests: 3,
    bedrooms: 1,
    heroId: '1611892440504-42a792e24d32',
    galleryIds: ['1520250497591-112f2f40a3f4', '1584132967334-10e028bd69f7'],
    panorama: 'indoor_pool',
    features: [
      'Folding teak wall',
      'Private courtyard',
      'Outdoor rain shower',
      'Daily offerings',
    ],
    hasTour: true,
  },
  {
    id: 'solstice-loft',
    name: 'Solstice Loft',
    property: 'AURELIA Cala Verde',
    location: 'Ubud Valley, Bali',
    tagline: 'Built for sleeping, and very little else.',
    description:
      'A deliberately dark room. Blackened timber, heavy drapery, a single warm lamp and no screen of any kind. We removed the television, the clock and the minibar. Guests stay an average of two nights longer than they booked.',
    price: 620,
    sizeSqm: 52,
    maxGuests: 2,
    bedrooms: 1,
    heroId: '1552858725-2758b5fb1286',
    galleryIds: ['1522771739844-6a9f6d5f14af', '1611892440504-42a792e24d32'],
    panorama: 'hotel_room',
    features: ['Full blackout', 'No screens', 'Hand-turned bedding', 'Silent floor'],
    hasTour: true,
  },
]

export const amenities: Amenity[] = [
  {
    id: 'spa',
    name: 'The Bathhouse',
    description:
      'Hot and cold circuits, a salt room and a hammam. Open from five in the morning, because some guests keep other hours.',
    icon: 'Droplets',
  },
  {
    id: 'dining',
    name: 'Table dAurelia',
    description:
      'Fourteen seats, one menu, no choice. The kitchen decides in the morning based on what arrived.',
    icon: 'UtensilsCrossed',
  },
  {
    id: 'pools',
    name: 'The Long Pools',
    description:
      'Heated year-round to 29°C and lit from beneath after dark. Swimming at three in the morning is permitted and quietly encouraged.',
    icon: 'Waves',
  },
  {
    id: 'concierge',
    name: 'Anticipatory Service',
    description:
      'One attendant per two suites. They will not introduce themselves unless you would like them to.',
    icon: 'BellRing',
  },
  {
    id: 'cellar',
    name: 'The Cellar',
    description:
      'Eleven thousand bottles beneath the east wing, with a tasting table for six and no corkage.',
    icon: 'Wine',
  },
  {
    id: 'terraces',
    name: 'Private Terraces',
    description:
      'Every suite has outdoor space of its own. Not a balcony — a room without a roof.',
    icon: 'Trees',
  },
]

export const gallery: GalleryItem[] = [
  { id: '1571003123894-1f0594d2b5d9', caption: 'Cabana pools at dusk — Cala Verde', span: 'tall' },
  { id: '1610641818989-c2051b5e2cfd', caption: 'The Long Pools — Belvedere', span: 'wide' },
  { id: '1551882547-ff40c63fe5fa', caption: 'Escarpment terraces — Sirocco', span: 'wide' },
  { id: '1582719508461-905c673771fd', caption: 'Morning deck — Cala Verde', span: 'square' },
  { id: '1520250497591-112f2f40a3f4', caption: 'The valley pool — Cala Verde', span: 'square' },
  { id: '1414235077428-338989a2e8c0', caption: 'Nightly service — Montrose', span: 'square' },
  { id: '1571896349842-33c89424de2d', caption: 'Blue hour, east terrace — Belvedere', span: 'wide' },
  { id: '1445019980597-93fa8acb246c', caption: 'Ridge terrace — Kestrel Ridge', span: 'tall' },
  { id: '1584132967334-10e028bd69f7', caption: 'Infinity edge — Cala Verde', span: 'wide' },
  { id: '1600210492486-724fe5c67fb0', caption: 'The reading lounge — Montrose', span: 'square' },
]

/** The suite whose procedural 3D room is the interactive showcase. */
export const showcaseSuiteId: Suite['id'] = 'cliffside-villa'

export function getSuite(id: string): Suite | undefined {
  return suites.find((s) => s.id === id)
}
