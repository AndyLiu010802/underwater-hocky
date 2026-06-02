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
