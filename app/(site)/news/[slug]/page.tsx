import { client } from '@/sanity/sanity.client'
import { newsDetailQuery, newsListQuery } from '@/sanity/lib/queries'
import type { NewsItem } from '@/sanity/lib/types'
import { PortableText } from '@portabletext/react'
import { formatDate } from '@/lib/utils'
import { urlFor } from '@/sanity/sanity.client'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const news: NewsItem[] = await client.fetch(newsListQuery)
    return news.map(n => ({ slug: n.slug.current }))
  } catch {
    return []
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  let article: NewsItem | null = null
  try {
    article = await client.fetch(newsDetailQuery, { slug })
  } catch {
    // will notFound below
  }
  if (!article) notFound()

  return (
    <div className="min-h-screen bg-ocean-800 pt-24 pb-24">
      {article.coverImage && (
        <div className="relative h-72 md:h-96 w-full mb-12">
          <Image
            src={urlFor(article.coverImage).width(1200).height(500).url()}
            alt={article.title}
            fill
            className="object-cover opacity-60"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ocean-800" />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-6">
        <Link href="/news" className="text-xs tracking-widest text-cyan/60 hover:text-cyan transition-colors">
          ← BACK TO NEWS
        </Link>

        <div className="mt-6">
          <span className="text-[0.6rem] tracking-widest text-cyan uppercase font-bold">{article.tag}</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tighter text-white leading-tight">
            {article.title}
          </h1>
          <p className="mt-3 text-xs tracking-widest text-white/30">{formatDate(article.publishedAt)}</p>
        </div>

        <div className="mt-12 prose prose-invert prose-cyan max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-white/70 prose-p:leading-relaxed prose-a:text-cyan">
          {article.body && <PortableText value={article.body} />}
        </div>
      </article>
    </div>
  )
}
