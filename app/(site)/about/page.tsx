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
          We&apos;ve been running underwater hockey across Tasmania and Australia for over 25 years.
          Welcoming players of all levels — if you can swim, you can play.
          <em className="text-cyan not-italic"> Swim now, breathe later.</em>
        </p>

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

        <h2 className="text-lg font-black tracking-tight text-white mb-6">Committee</h2>
        <div className="flex flex-col gap-3 mb-14">
          {committee.map(m => (
            <div key={m.role} className="glass rounded-lg px-5 py-3 flex justify-between items-center">
              <span className="text-xs tracking-widest text-cyan/60 uppercase">{m.role}</span>
              <span className="text-sm text-white/60">{m.name}</span>
            </div>
          ))}
        </div>

        <h2 className="text-lg font-black tracking-tight text-white mb-6">Resources &amp; Documents</h2>
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
