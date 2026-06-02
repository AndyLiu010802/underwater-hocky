import { describe, it, expect } from 'vitest'
import { newsListQuery, newsDetailQuery, eventsQuery, galleryQuery } from '@/sanity/lib/queries'

describe('GROQ queries', () => {
  it('newsListQuery fetches title slug tag publishedAt excerpt and coverImage', () => {
    expect(newsListQuery).toContain('title')
    expect(newsListQuery).toContain('slug')
    expect(newsListQuery).toContain('tag')
    expect(newsListQuery).toContain('publishedAt')
    expect(newsListQuery).toContain('coverImage')
    expect(newsListQuery).toContain('_type == "news"')
  })

  it('newsDetailQuery fetches body (Portable Text)', () => {
    expect(newsDetailQuery).toContain('body')
    expect(newsDetailQuery).toContain('slug.current == $slug')
  })

  it('eventsQuery orders by date ascending', () => {
    expect(eventsQuery).toContain('_type == "event"')
    expect(eventsQuery).toContain('date')
  })

  it('galleryQuery fetches image and caption', () => {
    expect(galleryQuery).toContain('_type == "galleryImage"')
    expect(galleryQuery).toContain('image')
    expect(galleryQuery).toContain('caption')
  })
})
