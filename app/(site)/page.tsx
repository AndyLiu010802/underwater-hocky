import { HeroSection } from '@/components/sections/HeroSection'
import { StatsSection } from '@/components/sections/StatsSection'
import { NewsSection } from '@/components/sections/NewsSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <NewsSection />
    </div>
  )
}
