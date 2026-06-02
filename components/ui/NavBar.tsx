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
        <Link href="/" className="font-black text-sm tracking-[0.2em] text-cyan cyan-text-glow">
          UH·AU
        </Link>

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
