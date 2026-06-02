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
        <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase mb-16 text-center">How to Play</p>
        <div className="relative">
          <div
            ref={lineRef}
            className="absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-cyan via-cyan/40 to-transparent hidden md:block"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {steps.map((step, i) => (
              <div key={i} data-step className="flex flex-col items-center text-center relative">
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
