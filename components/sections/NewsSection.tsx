import { client } from '@/sanity/sanity.client'
import { latestNewsQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  Nationals: 'text-yellow-400',
  Training: 'text-green-400',
  Pennant: 'text-cyan',
  Juniors: 'text-purple-400',
  General: 'text-white/60',
}

async function getLatestNews(): Promise<NewsItem[]> {
  return client.fetch(latestNewsQuery, {}, { next: { revalidate: 60 } })
}

export async function NewsSection() {
  const news = await getLatestNews()

  return (
    <section className="bg-ocean-700 py-24 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase">Latest News</p>
          <Link href="/news" className="text-xs tracking-widest text-white/40 hover:text-cyan transition-colors">
            VIEW ALL →
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
          {news.length === 0 ? (
            <p className="text-white/30 text-sm">No news yet — add some in Sanity Studio.</p>
          ) : (
            news.map(item => (
              <Link
                key={item._id}
                href={`/news/${item.slug.current}`}
                className="flex-shrink-0 w-72 snap-start"
              >
                <GlassCard className="h-full">
                  {item.coverImage ? (
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={urlFor(item.coverImage).width(400).height(200).url()}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="288px"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-ocean-600 flex items-center justify-center text-3xl">🤿</div>
                  )}
                  <div className="p-5">
                    <p className={`text-[0.6rem] tracking-[0.3em] uppercase font-bold mb-2 ${TAG_COLORS[item.tag] ?? 'text-cyan'}`}>
                      {item.tag}
                    </p>
                    <h3 className="font-bold text-sm text-white/90 leading-snug line-clamp-2">{item.title}</h3>
                    {item.excerpt && (
                      <p className="mt-2 text-xs text-white/40 line-clamp-2">{item.excerpt}</p>
                    )}
                    <p className="mt-3 text-[0.6rem] tracking-widest text-white/30">{formatDate(item.publishedAt)}</p>
                  </div>
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
