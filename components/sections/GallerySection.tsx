import { client, urlFor } from '@/sanity/sanity.client'
import { galleryQuery } from '@/sanity/lib/queries'
import type { GalleryImageItem } from '@/sanity/lib/types'
import Image from 'next/image'

async function getGalleryImages(): Promise<GalleryImageItem[]> {
  try {
    return await client.fetch(galleryQuery, {}, { next: { revalidate: 3600 } })
  } catch {
    return []
  }
}

export async function GallerySection() {
  const images = await getGalleryImages()

  const col1 = images.filter((_, i) => i % 3 === 0)
  const col2 = images.filter((_, i) => i % 3 === 1)
  const col3 = images.filter((_, i) => i % 3 === 2)

  return (
    <section className="bg-ocean-700 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs tracking-[0.4em] text-cyan/60 uppercase mb-10">Gallery</p>

        {images.length === 0 ? (
          <p className="text-white/30 text-sm">No gallery images yet — add some in Sanity Studio.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[col1, col2, col3].map((col, ci) => (
              <div key={ci} className="flex flex-col gap-3">
                {col.map(img => (
                  <div
                    key={img._id}
                    className="relative overflow-hidden rounded-lg group border border-cyan/10 hover:border-cyan/40 transition-all duration-300"
                  >
                    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                      <Image
                        src={urlFor(img.image).width(600).url()}
                        alt={img.caption ?? 'Gallery image'}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-ocean-800/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      {img.caption && <p className="text-xs text-white/80">{img.caption}</p>}
                    </div>
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none cyan-glow" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
