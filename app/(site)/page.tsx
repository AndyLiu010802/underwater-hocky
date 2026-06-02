import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'
import { EventsSection } from '@/components/sections/EventsSection'
import { HowToPlaySection } from '@/components/sections/HowToPlaySection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
      <EventsSection />
      <HowToPlaySection />
    </div>
  )
}
