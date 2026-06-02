import { client } from '@/sanity/sanity.client'
import { eventsQuery } from '@/sanity/lib/queries'
import type { EventItem } from '@/sanity/lib/types'
import { EventCountdownCard } from '@/components/sections/EventCountdownCard'

export const revalidate = 60

async function getAllEvents(): Promise<EventItem[]> {
  try {
    return await client.fetch(eventsQuery)
  } catch {
    return []
  }
}

export default async function EventsPage() {
  const events = await getAllEvents()
  const now = new Date()
  const upcoming = events.filter(e => new Date(e.date) > now)
  const past = events.filter(e => new Date(e.date) <= now)

  return (
    <div className="min-h-screen bg-ocean-800 pt-28 pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs tracking-[0.5em] text-cyan/60 uppercase mb-2">Events</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-14">Competition Calendar</h1>

        {upcoming.length > 0 && (
          <>
            <p className="text-xs tracking-widest text-cyan/50 uppercase mb-6">Upcoming</p>
            <div className="flex flex-col gap-4 mb-14">
              {upcoming.map(e => <EventCountdownCard key={e._id} event={e} />)}
            </div>
          </>
        )}

        {upcoming.length === 0 && past.length === 0 && (
          <p className="text-white/30 text-sm">No events yet — add some in Sanity Studio.</p>
        )}

        {past.length > 0 && (
          <>
            <p className="text-xs tracking-widest text-white/30 uppercase mb-6">Past Events</p>
            <div className="flex flex-col gap-3">
              {past.map(e => (
                <div key={e._id} className="glass rounded-lg p-4 flex items-center gap-4 opacity-50">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white/70">{e.name}</p>
                    {e.location && <p className="text-xs text-white/30 mt-0.5">📍 {e.location}</p>}
                  </div>
                  <span className="text-xs tracking-widest text-white/30 shrink-0">
                    {new Date(e.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
