import { defineField, defineType } from 'sanity'

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  fields: [
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, validation: r => r.required() }),
    defineField({ name: 'caption', type: 'string' }),
    defineField({ name: 'shootDate', type: 'date' }),
    defineField({ name: 'tags', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: { select: { title: 'caption', media: 'image' } },
})
