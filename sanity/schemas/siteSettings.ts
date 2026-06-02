import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'siteTitle', type: 'string' }),
    defineField({ name: 'facebookUrl', type: 'url' }),
    defineField({ name: 'instagramUrl', type: 'url' }),
    defineField({ name: 'youtubeUrl', type: 'url' }),
    defineField({ name: 'footerText', type: 'text', rows: 2 }),
  ],
  preview: { prepare: () => ({ title: 'Site Settings' }) },
})
