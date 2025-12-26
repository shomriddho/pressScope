import type { GlobalConfig } from 'payload'

export const SEO: GlobalConfig = {
  slug: 'seo',
  label: 'SEO Settings',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Default Title',
      localized: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Default Description',
      localized: true,
    },
    {
      name: 'keywords',
      type: 'text',
      label: 'Default Keywords',
      localized: true,
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Default Open Graph Image',
    },
    {
      name: 'twitterCard',
      type: 'select',
      label: 'Twitter Card Type',
      options: [
        { label: 'Summary', value: 'summary' },
        { label: 'Summary Large Image', value: 'summary_large_image' },
        { label: 'App', value: 'app' },
        { label: 'Player', value: 'player' },
      ],
      defaultValue: 'summary_large_image',
    },
  ],
}
