export const newsListQuery = `
  *[_type == "news"] | order(publishedAt desc) {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset }
  }
`

export const newsDetailQuery = `
  *[_type == "news" && slug.current == $slug][0] {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset },
    body[] { ..., _type == "image" => { ..., asset-> } }
  }
`

export const latestNewsQuery = `
  *[_type == "news"] | order(publishedAt desc) [0...3] {
    _id, title, slug, tag, publishedAt, excerpt,
    coverImage { asset }
  }
`

export const eventsQuery = `
  *[_type == "event"] | order(date asc) {
    _id, name, slug, date, location, description, registrationUrl,
    coverImage { asset }
  }
`

export const upcomingEventsQuery = `
  *[_type == "event" && date > now()] | order(date asc) [0...2] {
    _id, name, slug, date, location, registrationUrl
  }
`

export const galleryQuery = `
  *[_type == "galleryImage"] | order(_createdAt desc) [0...9] {
    _id, image { asset }, caption, tags
  }
`
