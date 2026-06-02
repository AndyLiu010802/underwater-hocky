# Underwater Hockey AU — Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a visually immersive underwater hockey website with a Three.js 3D hero, GSAP scroll animations, hockey-stick cursor with puck physics, and a Sanity CMS backend for non-technical staff.

**Architecture:** Next.js 15 App Router, React Three Fiber for the 3D ocean scene (SSR-disabled via `next/dynamic`), GSAP ScrollSmoother for inertia scroll, full-screen canvas overlay for the interactive cursor, and Sanity Studio embedded at `/studio`. Sanity data fetched server-side with ISR (60s revalidation).

**Tech Stack:** Next.js 15, TypeScript, `@react-three/fiber`, `@react-three/drei`, `three`, GSAP (ScrollTrigger + ScrollSmoother), Tailwind CSS v4, Sanity v3, `next-sanity`, pnpm, Vitest, Vercel

---

## File Map

```
app/
  (site)/
    layout.tsx                    # Root layout: AnimationProvider + CustomCursor + NavBar + Footer
    page.tsx                      # Homepage: composes all 7 sections
    news/page.tsx                 # News list with tag filter
    news/[slug]/page.tsx          # News article detail (Portable Text)
    events/page.tsx               # Events list with live countdown
    about/page.tsx                # Static about page (hardcoded TSX)
  studio/[[...tool]]/page.tsx     # Sanity Studio embedded

components/
  three/
    OceanScene.tsx                # R3F Canvas root (lazy-loaded, ssr:false)
    Particles.tsx                 # 120 floating cyan particles (bufferGeometry)
    Bubbles.tsx                   # Rising bubble spheres
    LightBeam.tsx                 # Directional light shaft mesh
  cursor/
    CustomCursor.tsx              # Canvas overlay: stick + drag + puck physics (rAF loop)
  sections/
    HeroSection.tsx               # Full-screen OceanScene + headline + CTA buttons
    StatsSection.tsx              # 2×2 GSAP counter grid
    NewsSection.tsx               # Horizontal-scroll glassmorphism news cards
    EventsSection.tsx             # Countdown cards (setInterval)
    HowToPlaySection.tsx          # 4-step GSAP line-draw animation
    GallerySection.tsx            # Masonry photo grid with hover glow
    CtaSection.tsx                # Full-width join call-to-action
  ui/
    NavBar.tsx                    # Sticky transparent nav, mobile hamburger
    Footer.tsx                    # Footer with social links
    GlassCard.tsx                 # Reusable glassmorphism card base
    CyanButton.tsx                # Accent button (filled + outline variants)
  providers/
    AnimationProvider.tsx         # GSAP ScrollSmoother context (client)

lib/
  puckPhysics.ts                  # Pure friction/bounce/alive functions (unit-tested)
  utils.ts                        # cn(), formatDate(), urlFor()

sanity/
  sanity.config.ts                # Studio config
  sanity.client.ts                # Read client
  schemas/
    news.ts                       # News document schema
    event.ts                      # Event document schema
    galleryImage.ts               # Gallery image schema
    siteSettings.ts               # Singleton site settings
    index.ts                      # Schema registry
  lib/
    queries.ts                    # GROQ query strings
    types.ts                      # TypeScript types matching schemas

__tests__/
  puckPhysics.test.ts             # Unit tests for physics functions
  queries.test.ts                 # GROQ query string smoke tests

next.config.ts                    # images.domains for Sanity CDN
vitest.config.ts                  # Vitest + jsdom
.env.local                        # Sanity credentials (gitignored)
```

---

## Task 1: Initialize Next.js Project and Install Dependencies

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`

- [ ] **Step 1: Scaffold Next.js 15 with App Router**

The project directory already exists with `.git` and `docs/`. Run inside it:

```bash
cd d:/MyProject/underwater-hocky
pnpm dlx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --no-git
```

When prompted "would you like to use Turbopack?": **Yes**

- [ ] **Step 2: Install runtime dependencies**

```bash
pnpm add @react-three/fiber @react-three/drei three gsap next-sanity @sanity/client @sanity/image-url @portabletext/react clsx tailwind-merge
```

- [ ] **Step 3: Install dev dependencies**

```bash
pnpm add -D @types/three vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 4: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
})
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to `package.json`**

Open `package.json` and add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Verify dev server starts**

```bash
pnpm dev
```

Open http://localhost:3000. Expected: default Next.js boilerplate page.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 + install deps (R3F, GSAP, Sanity, Vitest)"
```

---

## Task 2: Configure Global Styles — Deep Ocean Dark Theme

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/globals.css` with ocean theme**

```css
@import "tailwindcss";

@theme {
  --color-ocean-900: #030712;
  --color-ocean-800: #050a1a;
  --color-ocean-700: #070e20;
  --color-ocean-600: #0a1628;
  --color-cyan: #00d4ff;
  --color-cyan-dim: rgba(0, 212, 255, 0.15);
  --font-sans: 'Inter', system-ui, sans-serif;
}

@layer base {
  html {
    background: #050a1a;
    color: white;
    cursor: none;
  }

  * {
    box-sizing: border-box;
  }

  ::selection {
    background: rgba(0, 212, 255, 0.3);
  }

  /* hide scrollbar visually (ScrollSmoother manages scroll position) */
  body {
    overflow: hidden;
  }
}

@layer utilities {
  .cyan-glow {
    box-shadow: 0 0 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1);
  }
  .cyan-text-glow {
    text-shadow: 0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.2);
  }
  .glass {
    background: rgba(0, 212, 255, 0.05);
    border: 1px solid rgba(0, 212, 255, 0.15);
    backdrop-filter: blur(12px);
  }
}
```

- [ ] **Step 2: Update `app/layout.tsx` root metadata**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Underwater Hockey Australia',
  description: 'Swim now, breathe later. The home of underwater hockey in Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: deep ocean dark theme — Tailwind v4 CSS theme config"
```

---

## Task 3: Set Up Sanity Project and Environment Variables

**Files:**
- Create: `.env.local`, `sanity/sanity.config.ts`, `sanity/sanity.client.ts`

- [ ] **Step 1: Create a Sanity project**

Go to https://sanity.io/manage and create a new project named "Underwater Hockey AU". Note down your **Project ID**.

- [ ] **Step 2: Create `.env.local`**

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token_here
```

To get the read token: Sanity dashboard → API → Tokens → Add API token → Viewer role.

- [ ] **Step 3: Ensure `.env.local` is gitignored**

Check `.gitignore` contains `.env.local`. If not, add it:
```
.env.local
```

- [ ] **Step 4: Create `sanity/sanity.client.ts`**

```typescript
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true,
  token: process.env.SANITY_API_READ_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source: { asset?: { _ref: string } }) {
  return builder.image(source)
}
```

- [ ] **Step 5: Commit (without .env.local)**

```bash
git add sanity/sanity.client.ts .gitignore
git commit -m "feat: Sanity client setup with image URL builder"
```

---

## Task 4: Sanity Schemas

**Files:**
- Create: `sanity/schemas/news.ts`, `sanity/schemas/event.ts`, `sanity/schemas/galleryImage.ts`, `sanity/schemas/siteSettings.ts`, `sanity/schemas/index.ts`
- Create: `sanity/sanity.config.ts`

- [ ] **Step 1: Create `sanity/schemas/news.ts`**

```typescript
import { defineField, defineType } from 'sanity'

export const news = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'slug', type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'tag', type: 'string',
      options: { list: ['Nationals', 'Training', 'Pennant', 'Juniors', 'General'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
  ],
  orderings: [{
    title: 'Published Date, New',
    name: 'publishedAtDesc',
    by: [{ field: 'publishedAt', direction: 'desc' }],
  }],
  preview: { select: { title: 'title', subtitle: 'tag', media: 'coverImage' } },
})
```

- [ ] **Step 2: Create `sanity/schemas/event.ts`**

```typescript
import { defineField, defineType } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 4 }),
    defineField({ name: 'registrationUrl', type: 'url' }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [{ title: 'Date, Soonest', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'date', media: 'coverImage' } },
})
```

- [ ] **Step 3: Create `sanity/schemas/galleryImage.ts`**

```typescript
import { defineField, defineType } from 'sanity'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, validation: r => r.required() }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'shootDate', type: 'date' }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: { select: { title: 'caption', media: 'image' } },
})
```

- [ ] **Step 4: Create `sanity/schemas/siteSettings.ts`**

```typescript
import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', type: 'string' }),
    defineField({ name: 'facebookUrl', type: 'url' }),
    defineField({ name: 'instagramUrl', type: 'url' }),
    defineField({ name: 'youtubeUrl', type: 'url' }),
    defineField({ name: 'footerText', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
})
```

- [ ] **Step 5: Create `sanity/schemas/index.ts`**

```typescript
import { news } from './news'
import { event } from './event'
import { galleryImage } from './galleryImage'
import { siteSettings } from './siteSettings'

export const schemaTypes = [news, event, galleryImage, siteSettings]
```

- [ ] **Step 6: Create `sanity/sanity.config.ts`**

```typescript
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'underwater-hockey',
  title: 'Underwater Hockey AU',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
})
```

- [ ] **Step 7: Commit**

```bash
git add sanity/
git commit -m "feat: Sanity schemas — news, event, galleryImage, siteSettings"
```

---

## Task 5: GROQ Queries + TypeScript Types (TDD)

**Files:**
- Create: `sanity/lib/types.ts`, `sanity/lib/queries.ts`, `__tests__/queries.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/queries.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { newsListQuery, newsDetailQuery, eventsQuery, galleryQuery } from '@/sanity/lib/queries'

describe('GROQ queries', () => {
  it('newsListQuery fetches title slug tag publishedAt excerpt and coverImage', () => {
    expect(newsListQuery).toContain('title')
    expect(newsListQuery).toContain('slug')
    expect(newsListQuery).toContain('tag')
    expect(newsListQuery).toContain('publishedAt')
    expect(newsListQuery).toContain('coverImage')
    expect(newsListQuery).toContain('_type == "news"')
  })

  it('newsDetailQuery fetches body (Portable Text)', () => {
    expect(newsDetailQuery).toContain('body')
    expect(newsDetailQuery).toContain('slug.current == $slug')
  })

  it('eventsQuery orders by date ascending', () => {
    expect(eventsQuery).toContain('_type == "event"')
    expect(eventsQuery).toContain('date')
  })

  it('galleryQuery fetches image and caption', () => {
    expect(galleryQuery).toContain('_type == "galleryImage"')
    expect(galleryQuery).toContain('image')
    expect(galleryQuery).toContain('caption')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test
```

Expected: 4 failing tests — "Cannot find module '@/sanity/lib/queries'"

- [ ] **Step 3: Create `sanity/lib/types.ts`**

```typescript
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
```

- [ ] **Step 4: Create `sanity/lib/queries.ts`**

```typescript
export const newsListQuery = `
  *[_type == "news"] | order(publishedAt desc) {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset }
  }
`

export const newsDetailQuery = `
  *[_type == "news" && slug.current == $slug][0] {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset },
    body[] { ..., _type == "image" => { ..., asset-> } }
  }
`

export const latestNewsQuery = `
  *[_type == "news"] | order(publishedAt desc) [0...3] {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset }
  }
`

export const eventsQuery = `
  *[_type == "event"] | order(date asc) {
    _id, name, slug, date, location, description, registrationUrl,
    coverImage { asset }
  }
`

export const upcomingEventsQuery = `
  *[_type == "event" && date > now()] | order(date asc) [0...2] {
    _id, name, slug, date, location, registrationUrl
  }
`

export const galleryQuery = `
  *[_type == "galleryImage"] | order(_createdAt desc) [0...9] {
    _id, image { asset }, caption, tags
  }
`
```

- [ ] **Step 5: Run tests to confirm they pass**

```bash
pnpm test
```

Expected: 4 passing tests.

- [ ] **Step 6: Commit**

```bash
git add sanity/lib/ __tests__/queries.test.ts
git commit -m "feat: GROQ queries + TypeScript types (TDD, 4 tests passing)"
```

---

## Task 6: Puck Physics Utilities (TDD)

**Files:**
- Create: `lib/puckPhysics.ts`, `__tests__/puckPhysics.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `__tests__/puckPhysics.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { applyFriction, applyBounce, isAlive } from '@/lib/puckPhysics'

describe('applyFriction', () => {
  it('reduces velocity by friction factor each call', () => {
    const [vx, vy] = applyFriction(10, 0)
    expect(vx).toBeCloseTo(9.85)
    expect(vy).toBe(0)
  })

  it('applies symmetrically to both axes', () => {
    const [vx, vy] = applyFriction(0, 10)
    expect(vx).toBe(0)
    expect(vy).toBeCloseTo(9.85)
  })
})

describe('applyBounce', () => {
  const W = 1280, H = 720, R = 8

  it('reverses and dampens vx when hitting right edge', () => {
    const [nx, ny, nvx, nvy] = applyBounce(W - R, 100, 10, 0, W, H, R)
    expect(nx).toBe(W - R)
    expect(nvx).toBeCloseTo(-7) // -10 * 0.7
    expect(nvy).toBe(0)
  })

  it('reverses and dampens vx when hitting left edge', () => {
    const [nx, , nvx] = applyBounce(R, 100, -10, 0, W, H, R)
    expect(nx).toBe(R)
    expect(nvx).toBeCloseTo(7)
  })

  it('reverses and dampens vy when hitting bottom edge', () => {
    const [, ny, , nvy] = applyBounce(100, H - R, 0, 10, W, H, R)
    expect(ny).toBe(H - R)
    expect(nvy).toBeCloseTo(-7)
  })

  it('reverses and dampens vy when hitting top edge', () => {
    const [, ny, , nvy] = applyBounce(100, R, 0, -10, W, H, R)
    expect(ny).toBe(R)
    expect(nvy).toBeCloseTo(7)
  })

  it('does not bounce when puck is in bounds', () => {
    const [nx, ny, nvx, nvy] = applyBounce(400, 300, 5, 3, W, H, R)
    expect(nx).toBeCloseTo(405)
    expect(ny).toBeCloseTo(303)
    expect(nvx).toBe(5)
    expect(nvy).toBe(3)
  })
})

describe('isAlive', () => {
  it('returns true when speed is above threshold', () => {
    expect(isAlive(3, 4)).toBe(true) // speed = 5
  })

  it('returns false when speed is at or below threshold', () => {
    expect(isAlive(0.3, 0.4)).toBe(false) // speed = 0.5 = threshold
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
pnpm test
```

Expected: 7 failing tests — "Cannot find module '@/lib/puckPhysics'"

- [ ] **Step 3: Create `lib/puckPhysics.ts`**

```typescript
const FRICTION = 0.985
const BOUNCE_DAMPEN = 0.7
const MIN_SPEED = 0.5

export function applyFriction(vx: number, vy: number): [number, number] {
  return [vx * FRICTION, vy * FRICTION]
}

export function applyBounce(
  x: number,
  y: number,
  vx: number,
  vy: number,
  w: number,
  h: number,
  r: number,
): [number, number, number, number] {
  let nx = x + vx, ny = y + vy, nvx = vx, nvy = vy

  if (nx < r) {
    nvx = Math.abs(nvx) * BOUNCE_DAMPEN
    nx = r
  } else if (nx > w - r) {
    nvx = -Math.abs(nvx) * BOUNCE_DAMPEN
    nx = w - r
  }

  if (ny < r) {
    nvy = Math.abs(nvy) * BOUNCE_DAMPEN
    ny = r
  } else if (ny > h - r) {
    nvy = -Math.abs(nvy) * BOUNCE_DAMPEN
    ny = h - r
  }

  return [nx, ny, nvx, nvy]
}

export function isAlive(vx: number, vy: number): boolean {
  return Math.sqrt(vx * vx + vy * vy) > MIN_SPEED
}
```

- [ ] **Step 4: Run tests to confirm all pass**

```bash
pnpm test
```

Expected: 11 passing tests (7 physics + 4 queries).

- [ ] **Step 5: Commit**

```bash
git add lib/puckPhysics.ts __tests__/puckPhysics.test.ts
git commit -m "feat: puck physics utilities — friction, bounce, alive check (TDD, 7 tests)"
```

---

## Task 7: Shared Utilities

**Files:**
- Create: `lib/utils.ts`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function getDaysUntil(iso: string): number {
  const now = new Date()
  const target = new Date(iso)
  const diff = target.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
```

- [ ] **Step 2: Update `next.config.ts` to allow Sanity image CDN**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Commit**

```bash
git add lib/utils.ts next.config.ts
git commit -m "feat: shared utils (cn, formatDate, getDaysUntil) + Sanity CDN image domain"
```

---

## Task 8: AnimationProvider (GSAP ScrollSmoother)

**Files:**
- Create: `components/providers/AnimationProvider.tsx`

- [ ] **Step 1: Create `components/providers/AnimationProvider.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother)

export function AnimationProvider({ children }: { children: React.ReactNode }) {
  const smootherRef = useRef<ScrollSmoother | null>(null)

  useEffect(() => {
    smootherRef.current = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.5,
      effects: true,
      normalizeScroll: true,
    })

    return () => {
      smootherRef.current?.kill()
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  return (
    <div
      id="smooth-wrapper"
      style={{ overflow: 'hidden', position: 'fixed', inset: 0 }}
    >
      <div id="smooth-content">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `app/layout.tsx` to use AnimationProvider**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AnimationProvider } from '@/components/providers/AnimationProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Underwater Hockey Australia',
  description: 'Swim now, breathe later. The home of underwater hockey in Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimationProvider>
          {children}
        </AnimationProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Verify dev server still starts without errors**

```bash
pnpm dev
```

Open http://localhost:3000. Expected: page loads without console errors.

- [ ] **Step 4: Commit**

```bash
git add components/providers/AnimationProvider.tsx app/layout.tsx
git commit -m "feat: GSAP ScrollSmoother provider wraps app layout"
```

---

## Task 9: Custom Cursor — Hockey Stick + Puck Physics

**Files:**
- Create: `components/cursor/CustomCursor.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/cursor/CustomCursor.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { applyFriction, applyBounce, isAlive } from '@/lib/puckPhysics'

interface Puck {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  trail: Array<{ x: number; y: number }>
}

const MAX_PUCKS = 5
const TRAIL_LENGTH = 20
const PUCK_RADIUS = 8
const STICK_LENGTH = 38

let _nextId = 0

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('ontouchstart' in window) return

    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const pucks: Puck[] = []
    const mouse = { x: -200, y: -200 }
    let dragStart: { x: number; y: number } | null = null
    let stickAngle = -Math.PI / 4

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onMouseDown = (e: MouseEvent) => {
      dragStart = { x: e.clientX, y: e.clientY }
    }
    const onMouseUp = (e: MouseEvent) => {
      if (!dragStart) return
      const dx = dragStart.x - e.clientX
      const dy = dragStart.y - e.clientY
      const rawSpeed = Math.sqrt(dx * dx + dy * dy)
      if (rawSpeed > 8) {
        const speed = Math.min(rawSpeed, 60) * 0.35
        const angle = Math.atan2(dy, dx)
        stickAngle = angle
        if (pucks.length >= MAX_PUCKS) pucks.shift()
        pucks.push({
          id: _nextId++,
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          trail: [],
        })
      }
      dragStart = null
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    let rafId: number
    const tick = () => {
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Update + draw pucks
      for (let i = pucks.length - 1; i >= 0; i--) {
        const p = pucks[i]
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > TRAIL_LENGTH) p.trail.shift()

        const [nx, ny, nvx, nvy] = applyBounce(p.x, p.y, p.vx, p.vy, w, h, PUCK_RADIUS)
        p.x = nx; p.y = ny
        const [fvx, fvy] = applyFriction(nvx, nvy)
        p.vx = fvx; p.vy = fvy

        if (!isAlive(p.vx, p.vy)) { pucks.splice(i, 1); continue }

        // trail
        p.trail.forEach((pt, ti) => {
          const alpha = (ti / p.trail.length) * 0.45
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,212,255,${alpha})`
          ctx.fill()
        })

        // puck body
        ctx.save()
        ctx.shadowColor = '#00d4ff'
        ctx.shadowBlur = 14
        ctx.beginPath()
        ctx.arc(p.x, p.y, PUCK_RADIUS, 0, Math.PI * 2)
        ctx.fillStyle = '#0a0a1a'
        ctx.fill()
        ctx.strokeStyle = '#00d4ff'
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      }

      // drag power line
      if (dragStart) {
        ctx.save()
        ctx.setLineDash([5, 5])
        ctx.strokeStyle = 'rgba(0,212,255,0.55)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(mouse.x, mouse.y)
        ctx.lineTo(dragStart.x, dragStart.y)
        ctx.stroke()
        ctx.restore()
        // puck charge indicator at drag origin
        const dist = Math.min(
          Math.sqrt((dragStart.x - mouse.x) ** 2 + (dragStart.y - mouse.y) ** 2),
          60
        )
        const chargeRadius = PUCK_RADIUS * (dist / 60)
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, chargeRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,212,255,${0.3 * (dist / 60)})`
        ctx.fill()
      }

      // hockey stick cursor
      ctx.save()
      ctx.translate(mouse.x, mouse.y)
      ctx.rotate(stickAngle)
      // shaft
      ctx.beginPath()
      ctx.moveTo(6, 0)
      ctx.lineTo(6 + STICK_LENGTH, 0)
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'
      ctx.lineWidth = 4
      ctx.lineCap = 'round'
      ctx.stroke()
      // blade
      ctx.shadowColor = '#00d4ff'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.moveTo(6 + STICK_LENGTH, -8)
      ctx.quadraticCurveTo(6 + STICK_LENGTH + 12, 0, 6 + STICK_LENGTH, 8)
      ctx.strokeStyle = '#00d4ff'
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()
      ctx.restore()

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Add CustomCursor to `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AnimationProvider } from '@/components/providers/AnimationProvider'
import { CustomCursor } from '@/components/cursor/CustomCursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Underwater Hockey Australia',
  description: 'Swim now, breathe later. The home of underwater hockey in Australia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimationProvider>
          {children}
        </AnimationProvider>
        <CustomCursor />
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Manual test in browser**

```bash
pnpm dev
```

Open http://localhost:3000. Verify:
- System cursor is hidden (replaced by hockey stick)
- Moving mouse shows hockey stick following cursor
- Click + drag then release launches a cyan-glowing puck
- Puck bounces off viewport edges
- Puck leaves a fading trail
- Multiple launches create multiple pucks (max 5)

- [ ] **Step 4: Commit**

```bash
git add components/cursor/CustomCursor.tsx app/layout.tsx
git commit -m "feat: custom hockey stick cursor + canvas puck physics (bounce, trail, multi-puck)"
```

---

## Task 10: Reusable UI Components (GlassCard + CyanButton)

**Files:**
- Create: `components/ui/GlassCard.tsx`, `components/ui/CyanButton.tsx`

- [ ] **Step 1: Create `components/ui/GlassCard.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass rounded-lg overflow-hidden transition-all duration-300',
        hover && 'hover:-translate-y-1 hover:cyan-glow hover:border-cyan/40',
        className,
      )}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/ui/CyanButton.tsx`**

```tsx
import { cn } from '@/lib/utils'

interface CyanButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outline'
  href?: string
  children: React.ReactNode
}

export function CyanButton({ variant = 'filled', href, children, className, ...props }: CyanButtonProps) {
  const base = 'inline-flex items-center gap-2 px-6 py-2.5 text-xs font-black tracking-[0.25em] uppercase rounded-sm transition-all duration-200 active:scale-95'
  const filled = 'bg-cyan text-ocean-800 hover:bg-white hover:text-ocean-800'
  const outline = 'border border-cyan/50 text-cyan hover:border-cyan hover:cyan-glow'

  const cls = cn(base, variant === 'filled' ? filled : outline, className)

  if (href) {
    return <a href={href} className={cls}>{children}</a>
  }

  return <button className={cls} {...props}>{children}</button>
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/
git commit -m "feat: GlassCard and CyanButton reusable UI components"
```

---

## Task 11: NavBar

**Files:**
- Create: `components/ui/NavBar.tsx`
- Modify: `app/(site)/layout.tsx` (create this file)

- [ ] **Step 1: Create `app/(site)/layout.tsx`**

```tsx
import { NavBar } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

Note: `Footer` will be created in Task 12. Add a placeholder export there temporarily.

- [ ] **Step 2: Create `components/ui/NavBar.tsx`**

```tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { CyanButton } from './CyanButton'
import { cn } from '@/lib/utils'

const links = [
  { label: 'News', href: '/news' },
  { label: 'Events', href: '/events' },
  { label: 'About', href: '/about' },
]

export function NavBar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    // GSAP ScrollSmoother proxies scroll events — listen on the content div
    const content = document.getElementById('smooth-content')
    content?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      content?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-ocean-800/95 border-b border-cyan/10 backdrop-blur-sm'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-black text-sm tracking-[0.2em] text-cyan cyan-text-glow">
          UH·AU
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs tracking-widest text-white/60 hover:text-cyan transition-colors duration-200"
            >
              {l.label.toUpperCase()}
            </Link>
          ))}
          <CyanButton href="/about#join">JOIN</CyanButton>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={cn('block w-6 h-0.5 bg-white transition-all', open && 'rotate-45 translate-y-2')} />
          <span className={cn('block w-6 h-0.5 bg-white transition-all', open && 'opacity-0')} />
          <span className={cn('block w-6 h-0.5 bg-white transition-all', open && '-rotate-45 -translate-y-2')} />
        </button>
      </div>

      {/* Mobile overlay */}
      <div className={cn(
        'md:hidden fixed inset-0 bg-ocean-800/98 backdrop-blur-xl flex flex-col items-center justify-center gap-8 transition-all duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="text-2xl font-black tracking-widest text-white/80 hover:text-cyan transition-colors"
          >
            {l.label.toUpperCase()}
          </Link>
        ))}
        <CyanButton href="/about#join" onClick={() => setOpen(false)}>JOIN US</CyanButton>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/NavBar.tsx app/\(site\)/layout.tsx
git commit -m "feat: sticky NavBar with scroll-aware opacity + mobile hamburger overlay"
```

---

## Task 12: Footer

**Files:**
- Create: `components/ui/Footer.tsx`

- [ ] **Step 1: Create `components/ui/Footer.tsx`**

```tsx
import Link from 'next/link'

const socials = [
  { label: 'Facebook', href: 'https://facebook.com', icon: '𝗙' },
  { label: 'Instagram', href: 'https://instagram.com', icon: '▣' },
  { label: 'YouTube', href: 'https://youtube.com', icon: '▶' },
]

export function Footer() {
  return (
    <footer className="bg-ocean-900 border-t border-cyan/10 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-xs font-black tracking-[0.25em] text-cyan/60">UH·AU © {new Date().getFullYear()}</p>
          <p className="text-xs text-white/30 mt-1">Swim now, breathe later.</p>
        </div>
        <nav className="flex gap-6">
          {['News', 'Events', 'About'].map(l => (
            <Link
              key={l}
              href={`/${l.toLowerCase()}`}
              className="text-xs tracking-widest text-white/40 hover:text-cyan transition-colors"
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </nav>
        <div className="flex gap-5">
          {socials.map(s => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="text-white/30 hover:text-cyan transition-colors text-lg"
            >
              {s.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/Footer.tsx
git commit -m "feat: Footer with nav links and social icons"
```

---

## Task 13: Ocean Scene — R3F Canvas + Particles

**Files:**
- Create: `components/three/Particles.tsx`, `components/three/OceanScene.tsx`

- [ ] **Step 1: Create `components/three/Particles.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DESKTOP_COUNT = 120
const MOBILE_COUNT = 40

export function Particles() {
  const meshRef = useRef<THREE.Points>(null)
  const { size } = useThree()
  const count = size.width < 768 ? MOBILE_COUNT : DESKTOP_COUNT

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 22
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8
      vel[i * 3]     = (Math.random() - 0.5) * 0.004
      vel[i * 3 + 1] = Math.random() * 0.003 + 0.0008
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.003
    }
    return [pos, vel]
  }, [count])

  useFrame(() => {
    if (!meshRef.current) return
    const pos = meshRef.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      pos[i * 3]     += velocities[i * 3]
      pos[i * 3 + 1] += velocities[i * 3 + 1]
      pos[i * 3 + 2] += velocities[i * 3 + 2]
      if (pos[i * 3 + 1] > 6) pos[i * 3 + 1] = -6
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#00d4ff"
        size={0.055}
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
```

- [ ] **Step 2: Create `components/three/OceanScene.tsx`**

```tsx
'use client'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Particles } from './Particles'
import { Bubbles } from './Bubbles'
import { LightBeam } from './LightBeam'
import * as THREE from 'three'

function CameraMouseParallax() {
  const { camera } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useFrame(() => {
    if (typeof window === 'undefined') return
    camera.position.x += (mouse.current.x * 1.5 - camera.position.x) * 0.04
    camera.position.y += (-mouse.current.y * 1 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })

  if (typeof window !== 'undefined') {
    window.onmousemove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
  }

  return null
}

export default function OceanScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#00d4ff" />
      <Particles />
      <Bubbles />
      <LightBeam />
      <CameraMouseParallax />
    </Canvas>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/three/Particles.tsx components/three/OceanScene.tsx
git commit -m "feat: R3F OceanScene with floating particle system + mouse parallax camera"
```

---

## Task 14: Bubbles + LightBeam Components

**Files:**
- Create: `components/three/Bubbles.tsx`, `components/three/LightBeam.tsx`

- [ ] **Step 1: Create `components/three/Bubbles.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BUBBLE_COUNT = 18

interface BubbleState {
  x: number
  y: number
  z: number
  speed: number
  wobble: number
  wobbleSpeed: number
  radius: number
}

export function Bubbles() {
  const groupRef = useRef<THREE.Group>(null)

  const bubbles = useMemo<BubbleState[]>(() =>
    Array.from({ length: BUBBLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 18,
      y: -7 - Math.random() * 5,
      z: (Math.random() - 0.5) * 4,
      speed: 0.01 + Math.random() * 0.015,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.5 + Math.random() * 0.5,
      radius: 0.04 + Math.random() * 0.1,
    })),
  [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children as THREE.Mesh[]
    bubbles.forEach((b, i) => {
      b.y += b.speed
      b.wobble += delta * b.wobbleSpeed
      if (b.y > 7) b.y = -7
      const mesh = children[i]
      if (mesh) {
        mesh.position.set(b.x + Math.sin(b.wobble) * 0.15, b.y, b.z)
      }
    })
  })

  return (
    <group ref={groupRef}>
      {bubbles.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]}>
          <sphereGeometry args={[b.radius, 8, 8]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={0.18}
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Create `components/three/LightBeam.tsx`**

```tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function LightBeam() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    meshRef.current.position.x = Math.sin(t * 0.15) * 3
    ;(meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.06 + Math.sin(t * 0.4) * 0.02
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -2]} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[0.6, 2.5, 14, 8, 1, true]} />
      <meshBasicMaterial
        color="#00d4ff"
        transparent
        opacity={0.07}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/three/Bubbles.tsx components/three/LightBeam.tsx
git commit -m "feat: R3F bubbles (rising wobble) + animated light beam shaft"
```

---

## Task 15: HeroSection

**Files:**
- Create: `components/sections/HeroSection.tsx`

- [ ] **Step 1: Create `components/sections/HeroSection.tsx`**

```tsx
'use client'
import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { CyanButton } from '@/components/ui/CyanButton'

const OceanScene = dynamic(() => import('@/components/three/OceanScene'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-ocean-800" />,
})

export function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-hero]', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      })
    }, contentRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-ocean-800">
      {/* 3D Background */}
      <div className="absolute inset-0">
        <OceanScene />
      </div>

      {/* Gradient overlay — bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ocean-800/80 pointer-events-none" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <p
          data-hero
          className="text-xs tracking-[0.5em] text-cyan/60 mb-6 uppercase"
        >
          Tasmania · Australia
        </p>

        <h1
          data-hero
          className="text-[clamp(4rem,14vw,10rem)] font-black leading-none tracking-tighter text-white"
        >
          DIVE
          <span className="block text-cyan cyan-text-glow">IN.</span>
        </h1>

        <p
          data-hero
          className="mt-6 text-xs tracking-[0.3em] text-white/40 uppercase"
        >
          Underwater Hockey · Swim Now Breathe Later
        </p>

        <div data-hero className="flex gap-4 mt-10">
          <CyanButton href="/about#join">Join Us</CyanButton>
          <CyanButton variant="outline" href="https://www.youtube.com/@underwaterhockey" >
            Watch ▶
          </CyanButton>
        </div>

        <div
          data-hero
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-[0.6rem] tracking-[0.4em]">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create a placeholder `app/(site)/page.tsx` to render the hero**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

```bash
pnpm dev
```

Expected: Full-screen deep ocean background with floating particles, bubbles, light beam, "DIVE IN." headline fades in, JOIN and WATCH buttons appear.

- [ ] **Step 4: Commit**

```bash
git add components/sections/HeroSection.tsx app/\(site\)/page.tsx
git commit -m "feat: HeroSection — R3F ocean backdrop + GSAP headline entrance animation"
```

---

## Task 16: StatsSection

**Files:**
- Create: `components/sections/StatsSection.tsx`

- [ ] **Step 1: Create `components/sections/StatsSection.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 300, suffix: '+', label: 'Active Members' },
  { value: 25, suffix: '', label: 'Years Running' },
  { value: 6, suffix: '', label: 'Cities' },
  { value: 52, suffix: '', label: 'Weeks a Year' },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      const counters = sectionRef.current!.querySelectorAll('[data-count]')

      counters.forEach(el => {
        const target = parseInt(el.getAttribute('data-count')!, 10)
        const obj = { val: 0 }

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
          onUpdate() {
            el.textContent = Math.round(obj.val).toString()
          },
          onComplete() {
            el.textContent = target.toString()
          },
        })
      })

      gsap.from('[data-stat-item]', {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-ocean-800 to-ocean-700 py-24 px-6"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {stats.map(s => (
          <div key={s.label} data-stat-item className="text-center">
            <p className="text-5xl md:text-6xl font-black tracking-tighter text-cyan cyan-text-glow">
              <span data-count={s.value}>0</span>
              {s.suffix}
            </p>
            <p className="mt-2 text-xs tracking-widest text-white/40 uppercase">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/(site)/page.tsx`**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Scroll down past the hero. Expected: numbers animate from 0 to their targets when the section enters the viewport.

- [ ] **Step 4: Commit**

```bash
git add components/sections/StatsSection.tsx app/\(site\)/page.tsx
git commit -m "feat: StatsSection — GSAP ScrollTrigger counter animation (300+, 25yr, 6 cities, 52wk)"
```

---

## Task 17: NewsSection

**Files:**
- Create: `components/sections/NewsSection.tsx`

- [ ] **Step 1: Create `components/sections/NewsSection.tsx`**

```tsx
import { client } from '@/sanity/sanity.client'
import { latestNewsQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  Nationals: 'text-yellow-400',
  Training: 'text-green-400',
  Pennant: 'text-cyan',
  Juniors: 'text-purple-400',
  General: 'text-white/60',
}

async function getLatestNews(): Promise<NewsItem[]> {
  return client.fetch(latestNewsQuery, {}, { next: { revalidate: 60 } })
}

export async function NewsSection() {
  const news = await getLatestNews()

  return (
    <section className="bg-ocean-700 py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase">Latest News</p>
          <Link href="/news" className="text-xs tracking-widest text-white/40 hover:text-cyan transition-colors">
            VIEW ALL →
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {news.length === 0 ? (
            <p className="text-white/30 text-sm">No news yet — add some in Sanity Studio.</p>
          ) : (
            news.map(item => (
              <Link
                key={item._id}
                href={`/news/${item.slug.current}`}
                className="flex-shrink-0 w-72 snap-start"
              >
                <GlassCard className="h-full">
                  {item.coverImage ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={urlFor(item.coverImage).width(400).height(200).url()}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="288px"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-ocean-600 flex items-center justify-center text-3xl">🤿</div>
                  )}
                  <div className="p-5">
                    <p className={`text-[0.6rem] tracking-[0.3em] uppercase font-bold mb-2 ${TAG_COLORS[item.tag] ?? 'text-cyan'}`}>
                      {item.tag}
                    </p>
                    <h3 className="font-bold text-sm text-white/90 leading-snug line-clamp-2">{item.title}</h3>
                    {item.excerpt && (
                      <p className="mt-2 text-xs text-white/40 line-clamp-2">{item.excerpt}</p>
                    )}
                    <p className="mt-3 text-[0.6rem] tracking-widest text-white/30">{formatDate(item.publishedAt)}</p>
                  </div>
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/(site)/page.tsx`**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
    </div>
  )
}
```

- [ ] **Step 3: Add `scrollbar-hide` utility to `globals.css`**

Add to the `@layer utilities` block in `app/globals.css`:

```css
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 4: Add a test news item in Sanity Studio (to verify data flows)**

Run: `pnpm dev` then open http://localhost:3000/studio. Click "News" → create a new article. Publish it. Refresh http://localhost:3000 to see the news card appear.

- [ ] **Step 5: Commit**

```bash
git add components/sections/NewsSection.tsx app/globals.css app/\(site\)/page.tsx
git commit -m "feat: NewsSection — horizontal scroll glass cards from Sanity CMS (ISR 60s)"
```

---

## Task 18: EventsSection

**Files:**
- Create: `components/sections/EventsSection.tsx`

- [ ] **Step 1: Create `components/sections/EventsSection.tsx`**

```tsx
import { client } from '@/sanity/sanity.client'
import { upcomingEventsQuery } from '@/sanity/lib/queries'
import type { EventItem } from '@/sanity/lib/types'
import { EventCountdownCard } from './EventCountdownCard'
import Link from 'next/link'

async function getUpcomingEvents(): Promise<EventItem[]> {
  return client.fetch(upcomingEventsQuery, {}, { next: { revalidate: 60 } })
}

export async function EventsSection() {
  const events = await getUpcomingEvents()

  return (
    <section className="bg-ocean-600 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase">Upcoming Events</p>
          <Link href="/events" className="text-xs tracking-widest text-white/40 hover:text-cyan transition-colors">
            VIEW ALL →
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {events.length === 0 ? (
            <p className="text-white/30 text-sm">No upcoming events — add some in Sanity Studio.</p>
          ) : (
            events.map(event => <EventCountdownCard key={event._id} event={event} />)
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/sections/EventCountdownCard.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import type { EventItem } from '@/sanity/lib/types'
import Link from 'next/link'

function getDaysHoursMinutes(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0 }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes }
}

export function EventCountdownCard({ event }: { event: EventItem }) {
  const [time, setTime] = useState(getDaysHoursMinutes(event.date))

  useEffect(() => {
    const id = setInterval(() => setTime(getDaysHoursMinutes(event.date)), 60_000)
    return () => clearInterval(id)
  }, [event.date])

  return (
    <Link
      href={event.registrationUrl ?? `/events`}
      target={event.registrationUrl ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="glass rounded-lg p-5 flex items-center gap-6 hover:border-cyan/40 hover:cyan-glow transition-all duration-300 group"
    >
      {/* Countdown */}
      <div className="flex gap-4 shrink-0">
        {[
          { value: time.days, label: 'DAYS' },
          { value: time.hours, label: 'HRS' },
          { value: time.minutes, label: 'MIN' },
        ].map(u => (
          <div key={u.label} className="text-center min-w-[3rem]">
            <p className="text-3xl font-black text-cyan cyan-text-glow leading-none tabular-nums">
              {String(u.value).padStart(2, '0')}
            </p>
            <p className="text-[0.45rem] tracking-widest text-cyan/40 mt-1">{u.label}</p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-cyan/20 shrink-0" />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white/90 truncate group-hover:text-cyan transition-colors">
          {event.name}
        </p>
        {event.location && (
          <p className="text-xs text-white/40 mt-1">📍 {event.location}</p>
        )}
      </div>

      {/* Arrow */}
      <span className="text-cyan/40 group-hover:text-cyan group-hover:translate-x-1 transition-all">›</span>
    </Link>
  )
}
```

- [ ] **Step 3: Add to `app/(site)/page.tsx`**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { EventsSection } from '@/components/sections/EventsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/sections/EventsSection.tsx components/sections/EventCountdownCard.tsx app/\(site\)/page.tsx
git commit -m "feat: EventsSection — live countdown cards (days/hrs/min) from Sanity"
```

---

## Task 19: HowToPlaySection

**Files:**
- Create: `components/sections/HowToPlaySection.tsx`

- [ ] **Step 1: Create `components/sections/HowToPlaySection.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  { num: '01', icon: '🤿', title: 'Gear Up & Dive', desc: 'Grab your fins, stick, and mask.' },
  { num: '02', icon: '🏒', title: 'Control the Puck', desc: 'Push the puck along the pool floor.' },
  { num: '03', icon: '🎯', title: 'Score the Goal', desc: 'Flick it into the opposing tray.' },
  { num: '04', icon: '🏆', title: 'Win the Match', desc: 'Most goals in two 15-min halves wins.' },
]

export function HowToPlaySection() {
  const sectionRef = useRef<HTMLElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !lineRef.current) return
    const ctx = gsap.context(() => {
      // Line draws left to right
      gsap.from(lineRef.current, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 1.2,
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      })

      // Steps stagger in
      gsap.from('[data-step]', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-ocean-800 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase mb-16 text-center">
          How to Play
        </p>

        <div className="relative">
          {/* Connecting line */}
          <div
            ref={lineRef}
            className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-cyan via-cyan/40 to-transparent hidden md:block"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <div key={i} data-step className="flex flex-col items-center text-center relative">
                {/* Node */}
                <div className="w-16 h-16 rounded-full border-2 border-cyan bg-ocean-800 flex items-center justify-center mb-4 cyan-glow relative z-10">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <p className="text-[0.5rem] tracking-[0.3em] text-cyan/50 mb-1">{step.num}</p>
                <h3 className="font-bold text-sm text-white/90 mb-2">{step.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/(site)/page.tsx`**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { HowToPlaySection } from '@/components/sections/HowToPlaySection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
      <HowToPlaySection />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/HowToPlaySection.tsx app/\(site\)/page.tsx
git commit -m "feat: HowToPlaySection — GSAP line-draw + stagger step entrance on scroll"
```

---

## Task 20: GallerySection

**Files:**
- Create: `components/sections/GallerySection.tsx`

- [ ] **Step 1: Create `components/sections/GallerySection.tsx`**

```tsx
import { client, urlFor } from '@/sanity/sanity.client'
import { galleryQuery } from '@/sanity/lib/queries'
import type { GalleryImageItem } from '@/sanity/lib/types'
import Image from 'next/image'
import Link from 'next/link'

async function getGalleryImages(): Promise<GalleryImageItem[]> {
  return client.fetch(galleryQuery, {}, { next: { revalidate: 3600 } })
}

export async function GallerySection() {
  const images = await getGalleryImages()

  // Split into two columns for masonry
  const col1 = images.filter((_, i) => i % 2 === 0)
  const col2 = images.filter((_, i) => i % 2 === 1)

  return (
    <section className="bg-ocean-700 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase">Gallery</p>
        </div>

        {images.length === 0 ? (
          <p className="text-white/30 text-sm">No gallery images yet — add some in Sanity Studio.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[col1, col2, images.filter((_, i) => i % 3 === 2)].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3">
                {col.map(img => (
                  <div
                    key={img._id}
                    className="relative overflow-hidden rounded-lg group border border-cyan/10 hover:border-cyan/40 transition-all duration-300"
                  >
                    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                      <Image
                        src={urlFor(img.image).width(600).url()}
                        alt={img.caption ?? 'Gallery image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-ocean-800/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {img.caption && (
                        <p className="text-xs text-white/80">{img.caption}</p>
                      )}
                    </div>
                    {/* Cyan glow border on hover */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none cyan-glow" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Add to `app/(site)/page.tsx`**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { HowToPlaySection } from '@/components/sections/HowToPlaySection'
import { GallerySection } from '@/components/sections/GallerySection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
      <HowToPlaySection />
      <GallerySection />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/sections/GallerySection.tsx app/\(site\)/page.tsx
git commit -m "feat: GallerySection — masonry grid with hover scale + cyan glow from Sanity"
```

---

## Task 21: CtaSection

**Files:**
- Create: `components/sections/CtaSection.tsx`

- [ ] **Step 1: Create `components/sections/CtaSection.tsx`**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CyanButton } from '@/components/ui/CyanButton'

gsap.registerPlugin(ScrollTrigger)

export function CtaSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-cta]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })

      // Pulsing glow
      gsap.to('[data-glow]', {
        opacity: 0.4,
        scale: 1.15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative bg-ocean-800 py-32 px-6 text-center overflow-hidden border-t border-cyan/10"
    >
      {/* Pulsing background glow */}
      <div
        data-glow
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-2xl mx-auto">
        <p data-cta className="text-xs tracking-[0.5em] text-cyan/50 uppercase mb-6">
          Ready to Dive?
        </p>

        <h2 data-cta className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-white">
          START YOUR
          <span className="block text-cyan cyan-text-glow">UNDERWATER</span>
          JOURNEY
        </h2>

        <p data-cta className="mt-6 text-sm text-white/40 tracking-wide">
          Join hundreds of players across Australia. All skill levels welcome.
        </p>

        <div data-cta className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <CyanButton href="/about#join" className="text-base py-4 px-10">
            Get Started →
          </CyanButton>
          <CyanButton variant="outline" href="/events">
            View Events
          </CyanButton>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Complete `app/(site)/page.tsx` with all sections**

```tsx
import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { HowToPlaySection } from '@/components/sections/HowToPlaySection'
import { GallerySection } from '@/components/sections/GallerySection'
import { CtaSection } from '@/components/sections/CtaSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
      <HowToPlaySection />
      <GallerySection />
      <CtaSection />
    </div>
  )
}
```

- [ ] **Step 3: Full homepage manual test**

```bash
pnpm dev
```

Visit http://localhost:3000. Scroll through all 7 sections. Verify:
- Hero: 3D ocean + particles + entrance animation
- Stats: numbers count up on scroll
- News: horizontal-scroll glass cards
- Events: countdown timers
- How to Play: connecting line draws + steps appear
- Gallery: masonry grid with hover effects
- CTA: text fades in + pulsing glow

- [ ] **Step 4: Commit**

```bash
git add components/sections/CtaSection.tsx app/\(site\)/page.tsx
git commit -m "feat: CtaSection — full homepage complete with all 7 sections"
```

---

## Task 22: News Pages (List + Detail)

**Files:**
- Create: `app/(site)/news/page.tsx`, `app/(site)/news/[slug]/page.tsx`

- [ ] **Step 1: Create `app/(site)/news/page.tsx`**

```tsx
import { client } from '@/sanity/sanity.client'
import { newsListQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  Nationals: 'text-yellow-400 border-yellow-400/30',
  Training: 'text-green-400 border-green-400/30',
  Pennant: 'text-cyan border-cyan/30',
  Juniors: 'text-purple-400 border-purple-400/30',
  General: 'text-white/60 border-white/20',
}

export const revalidate = 60

async function getNews(): Promise<NewsItem[]> {
  return client.fetch(newsListQuery)
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="min-h-screen bg-ocean-800 pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-[0.5em] text-cyan/60 uppercase mb-2">News</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-14">Latest Updates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map(item => (
            <Link key={item._id} href={`/news/${item.slug.current}`}>
              <GlassCard>
                {item.coverImage ? (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={urlFor(item.coverImage).width(500).height(250).url()}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-ocean-600 flex items-center justify-center text-4xl">🤿</div>
                )}
                <div className="p-6">
                  <span className={`text-[0.6rem] tracking-widest uppercase font-bold border px-2 py-0.5 rounded-sm ${TAG_COLORS[item.tag] ?? 'text-cyan border-cyan/30'}`}>
                    {item.tag}
                  </span>
                  <h2 className="mt-3 font-bold text-white/90 leading-snug">{item.title}</h2>
                  {item.excerpt && (
                    <p className="mt-2 text-xs text-white/40 line-clamp-3">{item.excerpt}</p>
                  )}
                  <p className="mt-4 text-[0.6rem] tracking-widest text-white/30">{formatDate(item.publishedAt)}</p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(site)/news/[slug]/page.tsx`**

```tsx
import { client } from '@/sanity/sanity.client'
import { newsDetailQuery, newsListQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { PortableText } from '@portabletext/react'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateStaticParams() {
  const news: NewsItem[] = await client.fetch(newsListQuery)
  return news.map(n => ({ slug: n.slug.current }))
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article: NewsItem | null = await client.fetch(newsDetailQuery, { slug })
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-ocean-800 pt-24 pb-24">
      {/* Cover image */}
      {article.coverImage && (
        <div className="relative h-72 md:h-96 w-full mb-12">
          <Image
            src={urlFor(article.coverImage).width(1200).height(500).url()}
            alt={article.title}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ocean-800" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6">
        <Link href="/news" className="text-xs tracking-widest text-cyan/60 hover:text-cyan transition-colors">
          ← BACK TO NEWS
        </Link>

        <div className="mt-6">
          <span className="text-[0.6rem] tracking-widest text-cyan uppercase font-bold">{article.tag}</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-xs tracking-widest text-white/30">{formatDate(article.publishedAt)}</p>
        </div>

        <div className="mt-12 prose prose-invert prose-cyan max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-white/70 prose-p:leading-relaxed prose-a:text-cyan">
          {article.body && <PortableText value={article.body} />}
        </div>
      </article>
    </div>
  )
}
```

- [ ] **Step 3: Install `@tailwindcss/typography` for prose styles**

```bash
pnpm add -D @tailwindcss/typography
```

Add to `globals.css` after `@import "tailwindcss"`:
```css
@plugin "@tailwindcss/typography";
```

- [ ] **Step 4: Commit**

```bash
git add app/\(site\)/news/
git commit -m "feat: news list page + article detail with PortableText renderer"
```

---

## Task 23: Events Page

**Files:**
- Create: `app/(site)/events/page.tsx`

- [ ] **Step 1: Create `app/(site)/events/page.tsx`**

```tsx
import { client } from '@/sanity/sanity.client'
import { eventsQuery } from '@/sanity/lib/queries'
import type { EventItem } from '@/sanity/lib/types'
import { EventCountdownCard } from '@/components/sections/EventCountdownCard'

export const revalidate = 60

async function getAllEvents(): Promise<EventItem[]> {
  return client.fetch(eventsQuery)
}

export default async function EventsPage() {
  const events = await getAllEvents()
  const now = new Date()
  const upcoming = events.filter(e => new Date(e.date) > now)
  const past = events.filter(e => new Date(e.date) <= now)

  return (
    <div className="min-h-screen bg-ocean-800 pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.5em] text-cyan/60 uppercase mb-2">Events</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-14">Competition Calendar</h1>

        {upcoming.length > 0 && (
          <>
            <p className="text-xs tracking-widest text-cyan/50 uppercase mb-6">Upcoming</p>
            <div className="flex flex-col gap-4 mb-14">
              {upcoming.map(e => <EventCountdownCard key={e._id} event={e} />)}
            </div>
          </>
        )}

        {past.length > 0 && (
          <>
            <p className="text-xs tracking-widest text-white/30 uppercase mb-6">Past Events</p>
            <div className="flex flex-col gap-3">
              {past.map(e => (
                <div key={e._id} className="glass rounded-lg p-4 flex items-center gap-4 opacity-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white/70">{e.name}</p>
                    {e.location && <p className="text-xs text-white/30 mt-0.5">📍 {e.location}</p>}
                  </div>
                  <span className="text-xs tracking-widest text-white/30 shrink-0">
                    {new Date(e.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(site\)/events/
git commit -m "feat: events page — upcoming with countdown + past events dimmed list"
```

---

## Task 24: About Page

**Files:**
- Create: `app/(site)/about/page.tsx`

- [ ] **Step 1: Create `app/(site)/about/page.tsx`**

```tsx
import { CyanButton } from '@/components/ui/CyanButton'

const committee = [
  { role: 'President', name: 'Contact via website' },
  { role: 'Secretary', name: 'Contact via website' },
  { role: 'Treasurer', name: 'Contact via website' },
]

const resources = [
  { label: 'Game Rules (PDF)', href: 'https://www.underwaterhockey.com.au/game-rules' },
  { label: 'Constitution (PDF)', href: 'https://www.underwaterhockey.com.au/constitution' },
  { label: 'Safety & Concussion Policy', href: 'https://www.underwaterhockey.com.au/safety' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ocean-800 pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.5em] text-cyan/60 uppercase mb-2">About</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
          Underwater Hockey<br />Australia
        </h1>
        <p className="text-white/50 text-sm leading-relaxed mb-14 max-w-xl">
          We've been running underwater hockey across Tasmania and Australia for over 25 years.
          Welcoming players of all levels — if you can swim, you can play.
          <em className="text-cyan not-italic"> Swim now, breathe later.</em>
        </p>

        {/* Join section */}
        <div id="join" className="glass rounded-xl p-8 mb-14">
          <h2 className="text-2xl font-black tracking-tight text-white mb-3">Join Us</h2>
          <p className="text-sm text-white/50 leading-relaxed mb-6">
            Training sessions run weekly. All equipment provided for beginners.
            Membership fees are kept low to keep the sport accessible.
          </p>
          <CyanButton href="mailto:info@underwaterhockey.com.au">
            Get In Touch →
          </CyanButton>
        </div>

        {/* Committee */}
        <h2 className="text-lg font-black tracking-tight text-white mb-6">Committee</h2>
        <div className="flex flex-col gap-3 mb-14">
          {committee.map(m => (
            <div key={m.role} className="glass rounded-lg px-5 py-3 flex justify-between items-center">
              <span className="text-xs tracking-widest text-cyan/60 uppercase">{m.role}</span>
              <span className="text-sm text-white/60">{m.name}</span>
            </div>
          ))}
        </div>

        {/* Resources */}
        <h2 className="text-lg font-black tracking-tight text-white mb-6">Resources & Documents</h2>
        <div className="flex flex-col gap-3">
          {resources.map(r => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-lg px-5 py-3 flex justify-between items-center hover:border-cyan/40 hover:cyan-glow transition-all duration-200 group"
            >
              <span className="text-sm text-white/70 group-hover:text-cyan transition-colors">{r.label}</span>
              <span className="text-cyan/40 group-hover:text-cyan">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(site\)/about/
git commit -m "feat: About page — static TSX with join CTA, committee, and document links"
```

---

## Task 25: Sanity Studio Route

**Files:**
- Create: `app/studio/[[...tool]]/page.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Create `app/studio/[[...tool]]/page.tsx`**

```tsx
'use client'
import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity/sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```

- [ ] **Step 2: Update `next.config.ts` to allow large Studio bundle**

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
  },
  // Required for Sanity Studio embedded in Next.js
  transpilePackages: ['sanity', 'next-sanity'],
}

export default nextConfig
```

- [ ] **Step 3: Verify Studio loads**

```bash
pnpm dev
```

Open http://localhost:3000/studio. Expected: Sanity Studio UI loads. Log in with your Sanity account. Verify you can see all four document types: News, Event, Gallery Image, Site Settings.

- [ ] **Step 4: Commit**

```bash
git add app/studio/ next.config.ts
git commit -m "feat: Sanity Studio embedded at /studio — all 4 schema types visible"
```

---

## Task 26: Final Polish + Production Readiness

**Files:**
- Modify: `.gitignore`, `app/(site)/layout.tsx` (add metadata)

- [ ] **Step 1: Update `.gitignore`**

Ensure these lines exist:
```
.env.local
.env*.local
.next/
node_modules/
.superpowers/
```

- [ ] **Step 2: Add Open Graph metadata to `app/layout.tsx`**

```tsx
export const metadata: Metadata = {
  title: {
    default: 'Underwater Hockey Australia',
    template: '%s | Underwater Hockey AU',
  },
  description: 'Swim now, breathe later. The home of underwater hockey in Australia.',
  openGraph: {
    title: 'Underwater Hockey Australia',
    description: 'Swim now, breathe later.',
    type: 'website',
    locale: 'en_AU',
  },
}
```

- [ ] **Step 3: Run full test suite**

```bash
pnpm test
```

Expected: 11 tests passing (4 query tests + 7 physics tests).

- [ ] **Step 4: Run production build to catch type errors**

```bash
pnpm build
```

Fix any TypeScript errors before continuing. Expected: "✓ Compiled successfully"

- [ ] **Step 5: Final browser smoke test**

```bash
pnpm dev
```

Test checklist:
- [ ] Homepage loads, hero visible, particles animate
- [ ] Cursor is hidden; hockey stick follows mouse
- [ ] Click + drag + release launches a puck that bounces
- [ ] Scrolling down: stats count, sections animate in
- [ ] News cards horizontal-scroll on mobile, grid on desktop
- [ ] Events countdown shows days/hrs/min
- [ ] /news lists articles, click to read full article
- [ ] /events shows upcoming + past
- [ ] /about has join section, committee, resources
- [ ] /studio loads Sanity Studio
- [ ] Mobile: hamburger menu opens + closes

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete underwater hockey website — all pages, animations, cursor, Sanity CMS"
```

---

## Post-Build: Deploy to Vercel

After all tasks are complete:

1. Push to GitHub: `git push origin main`
2. Go to https://vercel.com/new → import the repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_READ_TOKEN`
4. Deploy. Vercel auto-detects Next.js.
5. In Sanity dashboard → API → CORS Origins → add your Vercel domain for Studio access.
