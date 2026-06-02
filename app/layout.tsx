import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AnimationProvider } from '@/components/providers/AnimationProvider'
import { CustomCursor } from '@/components/cursor/CustomCursor'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Underwater Hockey Australia',
    template: '%s | Underwater Hockey AU',
  },
  description: 'Swim now, breathe later. The home of underwater hockey in Australia.',
  openGraph: {
    title: 'Underwater Hockey Australia',
    description: 'Swim now, breathe later.',
    type: 'website',
    locale: 'en_AU',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimationProvider>
          {children}
        </AnimationProvider>
        <CustomCursor />
      </body>
    </html>
  )
}
