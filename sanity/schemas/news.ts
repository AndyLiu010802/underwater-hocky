import { defineField, defineType } from 'sanity'

export const news = defineType({
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: r => r.required() }),
    defineField({
      name: 'slug', type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: r => r.required(),
    }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'tag', type: 'string',
      options: { list: ['Nationals', 'Training', 'Pennant', 'Juniors', 'General'] },
      validation: r => r.required(),
    }),
    defineField({ name: 'publishedAt', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 3 }),
    defineField({ name: 'body', type: 'array', of: [{ type: 'block' }, { type: 'image' }] }),
  ],
  orderings: [{
    title: 'Published Date, New',
    name: 'publishedAtDesc',
    by: [{ field: 'publishedAt', direction: 'desc' }],
  }],
  preview: { select: { title: 'title', subtitle: 'tag', media: 'coverImage' } },
})
