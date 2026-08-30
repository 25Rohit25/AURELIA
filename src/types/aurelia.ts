export type SuiteId =
  | 'the-eyrie'
  | 'cliffside-villa'
  | 'aurelia-suite'
  | 'heritage-grand'
  | 'garden-pavilion'
  | 'solstice-loft'

export interface Suite {
  id: SuiteId
  name: string
  property: string
  location: string
  tagline: string
  description: string
  /** Nightly rate in USD. Fictional. */
  price: number
  sizeSqm: number
  maxGuests: number
  bedrooms: number
  /** Primary hero image id (Unsplash photo id, no `photo-` prefix). */
  heroId: string
  /** Additional gallery image ids. */
  galleryIds: string[]
  /** 360° panorama in public/panoramas (filename without extension). */
  panorama: string
  features: string[]
  /** Marks the suite whose 3D scene is the interactive showcase. */
  hasTour: boolean
}

export interface Amenity {
  id: string
  name: string
  description: string
  icon: string
}

export interface GalleryItem {
  id: string
  caption: string
  span: 'wide' | 'tall' | 'square'
}
