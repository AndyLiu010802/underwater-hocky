import type { PortableTextBlock } from '@portabletext/react'

export interface SanityImageAsset {
  _type: 'image'
  asset: { _ref: string }
}

export interface NewsItem {
  _id: string
  title: string
  slug: { current: string }
  coverImage?: SanityImageAsset
  tag: 'Nationals' | 'Training' | 'Pennant' | 'Juniors' | 'General'
  publishedAt: string
  excerpt?: string
  body?: PortableTextBlock[]
}

export interface EventItem {
  _id: string
  name: string
  slug: { current: string }
  date: string
  location?: string
  description?: string
  registrationUrl?: string
  coverImage?: SanityImageAsset
}

export interface GalleryImageItem {
  _id: string
  image: SanityImageAsset
  caption?: string
  shootDate?: string
  tags?: string[]
}
