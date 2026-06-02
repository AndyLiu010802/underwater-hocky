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
      <div
        data-glow
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.3) 0%, transparent 70%)' }}
      />
      <div className="relative z-10 max-w-2xl mx-auto">
        <p data-cta className="text-xs tracking-[0.5em] text-cyan/50 uppercase mb-6">Ready to Dive?</p>
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
