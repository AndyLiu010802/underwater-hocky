import { client } from '@/sanity/sanity.client'
import { newsListQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { GlassCard } from '@/components/ui/GlassCard'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'

const TAG_COLORS: Record<string, string> = {
  Nationals: 'text-yellow-400 border-yellow-400/30',
  Training: 'text-green-400 border-green-400/30',
  Pennant: 'text-cyan border-cyan/30',
  Juniors: 'text-purple-400 border-purple-400/30',
  General: 'text-white/60 border-white/20',
}

export const revalidate = 60

async function getNews(): Promise<NewsItem[]> {
  try {
    return await client.fetch(newsListQuery)
  } catch {
    return []
  }
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="min-h-screen bg-ocean-800 pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-[0.5em] text-cyan/60 uppercase mb-2">News</p>
        <h1 className="text-5xl font-black tracking-tighter text-white mb-14">Latest Updates</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.length === 0 ? (
            <p className="text-white/30 text-sm col-span-3">No news yet — add some in Sanity Studio.</p>
          ) : (
            news.map(item => (
              <Link key={item._id} href={`/news/${item.slug.current}`}>
                <GlassCard>
                  {item.coverImage ? (
                    <div className="relative h-48 w-full overflow-hidden">
                      <Image
                        src={urlFor(item.coverImage).width(500).height(250).url()}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-ocean-600 flex items-center justify-center text-4xl">🤿</div>
                  )}
                  <div className="p-6">
                    <span className={`text-[0.6rem] tracking-widest uppercase font-bold border px-2 py-0.5 rounded-sm ${TAG_COLORS[item.tag] ?? 'text-cyan border-cyan/30'}`}>
                      {item.tag}
                    </span>
                    <h2 className="mt-3 font-bold text-white/90 leading-snug">{item.title}</h2>
                    {item.excerpt && (
                      <p className="mt-2 text-xs text-white/40 line-clamp-3">{item.excerpt}</p>
                    )}
                    <p className="mt-4 text-[0.6rem] tracking-widest text-white/30">{formatDate(item.publishedAt)}</p>
                  </div>
                </GlassCard>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
