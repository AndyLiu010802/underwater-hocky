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
      <div className="absolute inset-0">
        <OceanScene />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ocean-800/80 pointer-events-none" />

      <div
        ref={contentRef}
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
      >
        <p data-hero className="text-xs tracking-[0.5em] text-cyan/60 mb-6 uppercase">
          Tasmania · Australia
        </p>

        <h1 data-hero className="text-[clamp(4rem,14vw,10rem)] font-black leading-none tracking-tighter text-white">
          DIVE
          <span className="block text-cyan cyan-text-glow">IN.</span>
        </h1>

        <p data-hero className="mt-6 text-xs tracking-[0.3em] text-white/40 uppercase">
          Underwater Hockey · Swim Now Breathe Later
        </p>

        <div data-hero className="flex gap-4 mt-10">
          <CyanButton href="/about#join">Join Us</CyanButton>
          <CyanButton variant="outline" href="https://www.youtube.com/@underwaterhockey">
            Watch ▶
          </CyanButton>
        </div>

        <div data-hero className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-[0.6rem] tracking-[0.4em]">SCROLL</span>
          <div className="w-px h-8 bg-gradient-to-b from-cyan/40 to-transparent" />
        </div>
      </div>
    </section>
  )
}
