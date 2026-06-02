import { defineField, defineType } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' }, validation: r => r.required() }),
    defineField({ name: 'date', type: 'datetime', validation: r => r.required() }),
    defineField({ name: 'location', type: 'string' }),
    defineField({ name: 'description', type: 'text', rows: 4 }),
    defineField({ name: 'registrationUrl', type: 'url' }),
    defineField({ name: 'coverImage', type: 'image', options: { hotspot: true } }),
  ],
  orderings: [{ title: 'Date, Soonest', name: 'dateAsc', by: [{ field: 'date', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'date', media: 'coverImage' } },
})
