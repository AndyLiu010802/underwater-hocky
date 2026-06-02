import { client } from '@/sanity/sanity.client'
import { upcomingEventsQuery } from '@/sanity/lib/queries'
import type { EventItem } from '@/sanity/lib/types'
import { EventCountdownCard } from './EventCountdownCard'
import Link from 'next/link'

async function getUpcomingEvents(): Promise<EventItem[]> {
  return client.fetch(upcomingEventsQuery, {}, { next: { revalidate: 60 } })
}

export async function EventsSection() {
  const events = await getUpcomingEvents()

  return (
    <section className="bg-ocean-600 py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase">Upcoming Events</p>
          <Link href="/events" className="text-xs tracking-widest text-white/40 hover:text-cyan transition-colors">
            VIEW ALL →
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {events.length === 0 ? (
            <p className="text-white/30 text-sm">No upcoming events — add some in Sanity Studio.</p>
          ) : (
            events.map(event => <EventCountdownCard key={event._id} event={event} />)
          )}
        </div>
      </div>
    </section>
  )
}
