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
      <div className="w-px h-10 bg-cyan/20 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white/90 truncate group-hover:text-cyan transition-colors">
          {event.name}
        </p>
        {event.location && (
          <p className="text-xs text-white/40 mt-1">📍 {event.location}</p>
        )}
      </div>
      <span className="text-cyan/40 group-hover:text-cyan group-hover:translate-x-1 transition-all">›</span>
    </Link>
  )
}
