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
