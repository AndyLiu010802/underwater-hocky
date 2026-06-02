import { NavBar } from '@/components/ui/NavBar'
import { Footer } from '@/components/ui/Footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavBar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
