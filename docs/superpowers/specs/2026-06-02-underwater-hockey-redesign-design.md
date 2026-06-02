# Underwater Hockey AU — Website Redesign Design Spec

**Date:** 2026-06-02  
**Project:** underwaterhockey.com.au complete redesign  
**Stack:** Next.js 15 + React Three Fiber + GSAP + Sanity CMS

---

## 1. Goal

Replace the current outdated static website with a modern, visually immersive Next.js site that showcases news, blog posts, events, and photo galleries. The site must be eye-catching with rich animations while remaining manageable by non-technical staff via a CMS admin panel.

---

## 2. Visual Design

**Style:** Deep Ocean Dark  
**Background:** Deep navy `#050a1a` to `#070e20`  
**Accent color:** Cyan `#00D4FF` — used for glows, buttons, highlights, animated borders  
**Typography:** Heavy weight (900) for headings with tight letter-spacing; small-caps with wide letter-spacing for labels  
**Mood:** Epic, immersive, like diving into a bioluminescent ocean — Avatar meets Nike

---

## 3. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 App Router, TypeScript |
| 3D / Particles | React Three Fiber (`@react-three/fiber`) + `@react-three/drei` |
| Scroll Animation | GSAP 3 + ScrollTrigger plugin |
| Styling | Tailwind CSS v4 |
| CMS | Sanity v3 (Studio embedded at `/studio`) |
| Deployment | Vercel |
| Package Manager | pnpm |

---

## 4. Project Structure

```
underwater-hocky/
├── app/
│   ├── (site)/
│   │   ├── layout.tsx          # Root layout with nav + footer
│   │   ├── page.tsx            # Homepage
│   │   ├── news/
│   │   │   ├── page.tsx        # News list
│   │   │   └── [slug]/page.tsx # News article detail
│   │   ├── events/
│   │   │   └── page.tsx        # Events list
│   │   └── about/
│   │       └── page.tsx        # About + governance
│   └── studio/[[...tool]]/
│       └── page.tsx            # Sanity Studio
├── components/
│   ├── three/
│   │   ├── OceanScene.tsx      # Main R3F canvas + scene
│   │   ├── Particles.tsx       # Floating particle system
│   │   ├── Bubbles.tsx         # Rising bubble animation
│   │   └── LightBeam.tsx       # Underwater light shafts
│   ├── sections/
│   │   ├── HeroSection.tsx     # Full-screen 3D hero
│   │   ├── StatsSection.tsx    # Animated counter grid
│   │   ├── NewsSection.tsx     # Horizontal scroll news cards
│   │   ├── EventsSection.tsx   # Countdown event cards
│   │   ├── HowToPlaySection.tsx# Step-by-step with connecting line
│   │   ├── GallerySection.tsx  # Masonry photo grid
│   │   └── CtaSection.tsx      # Full-width join call-to-action
│   ├── ui/
│   │   ├── NavBar.tsx          # Sticky transparent nav
│   │   ├── Footer.tsx          # Footer with socials
│   │   ├── GlassCard.tsx       # Reusable glassmorphism card
│   │   └── CyanButton.tsx      # Reusable accent button
│   └── providers/
│       └── GSAPProvider.tsx    # GSAP context + ScrollSmoother
├── sanity/
│   ├── sanity.config.ts
│   ├── sanity.client.ts
│   └── schemas/
│       ├── news.ts
│       ├── event.ts
│       ├── galleryImage.ts
│       └── siteSettings.ts
├── lib/
│   └── sanity/
│       └── queries.ts          # GROQ queries
└── public/
```

---

## 5. Pages

### 5.1 Homepage (`/`)
Seven sections stacked vertically:

1. **Hero** — Full-screen R3F ocean scene, "DIVE IN." headline, JOIN US + WATCH buttons
2. **Stats** — 2×2 grid: 300+ Members / 25 Years / 6 Cities / 52 Weeks a Year
3. **News** — Horizontal scroll row of 3 glass news cards (latest from Sanity)
4. **Events** — Countdown cards for upcoming events (latest 2 from Sanity)
5. **How to Play** — 4-step horizontal flow with animated connecting line
6. **Gallery** — Masonry grid of 5 photos (latest from Sanity)
7. **CTA** — Full-width "Start Your Underwater Journey" with JOIN button

### 5.2 News List (`/news`)
Grid of news cards, newest first. Filterable by tag (Nationals, Training, Pennant, Juniors). Each card: cover image, tag chip, title, date excerpt.

### 5.3 News Detail (`/news/[slug]`)
Full article with cover image hero, rich text body (Portable Text), related articles at bottom.

### 5.4 Events (`/events`)
Full list of upcoming + past events. Upcoming: countdown timers. Past: dimmed with result badge.

### 5.5 About (`/about`)
Static page: history, committee, rules, safety policy (PDF links). No CMS needed — markdown or hardcoded.

### 5.6 Sanity Studio (`/studio`)
Embedded Sanity Studio. Password-protected via Sanity's built-in auth. Non-technical staff access this to manage all content.

---

## 6. CMS Schemas (Sanity)

### `news`
```
title: string (required)
slug: slug (auto-generated from title)
coverImage: image
tag: select — Nationals | Training | Pennant | Juniors | General
publishedAt: datetime
body: array (Portable Text — rich text)
```

### `event`
```
name: string (required)
slug: slug
date: datetime (required)
location: string
description: text
registrationUrl: url
coverImage: image
```

### `galleryImage`
```
image: image (required)
caption: string
shootDate: date
tags: array of strings
```

### `siteSettings` (singleton)
```
siteTitle: string
facebookUrl: url
instagramUrl: url
youtubeUrl: url
footerText: text
```

---

## 7. Animation Plan

| Section | Technology | Effect |
|---------|-----------|--------|
| Hero | React Three Fiber | Particles float + drift, bubbles rise from bottom, light shafts sweep, mouse parallax tilts camera |
| Page load | GSAP timeline | Nav slides down, hero text fades + rises in sequence over 1.2s |
| Stats | GSAP ScrollTrigger | Numbers count up from 0 on scroll-enter; section fades in |
| News cards | GSAP ScrollTrigger | Cards stagger-slide up from below; hover: lift + cyan glow border |
| Events | GSAP ScrollTrigger | Cards stagger from right; countdown digits update every second via `setInterval` |
| How to Play | GSAP ScrollTrigger | Connecting line draws left-to-right; each step node lights up in sequence |
| Gallery | CSS + GSAP | Masonry grid items fade in staggered; hover: scale + cyan border glow + caption overlay |
| CTA | GSAP ScrollTrigger | Words fly in one-by-one; background pulse glow radiates from center |

**Scroll smoothing:** GSAP ScrollSmoother wraps the entire page for buttery-smooth inertia scrolling.

---

## 8. Navigation

Sticky transparent navbar that becomes solid (`rgba(5,10,26,0.95)`) on scroll. Links: News · Events · About · Join (CTA button, cyan).

Mobile: hamburger menu slides in from right, full-screen overlay, same deep ocean style.

---

## 9. Responsive Design

- Mobile-first Tailwind breakpoints
- Hero: headline scales from `4xl` (mobile) to `9xl` (desktop)
- Stats: 2×2 grid on mobile, 4×1 row on desktop
- News: horizontal scroll on mobile, 3-column grid on desktop
- Gallery: 2-column on mobile, Masonry on desktop
- R3F canvas: reduced particle count on mobile for performance

---

## 10. Performance Considerations

- R3F canvas lazy-loaded with `next/dynamic` + `ssr: false`
- Particle count: 120 desktop / 40 mobile (detected via `window.innerWidth`)
- Images: `next/image` with Sanity CDN URLs + blur placeholder
- GSAP: ScrollTrigger instances cleaned up on component unmount
- Sanity: ISR (Incremental Static Regeneration) with 60s revalidation for news/events

---

## 11. Out of Scope

- User authentication / member login
- Online shop / payments
- Multilingual support
- PDF document viewer (link to external PDFs instead)
- Search functionality
