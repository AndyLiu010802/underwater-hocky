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
