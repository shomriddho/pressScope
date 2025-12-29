import type { CollectionConfig } from 'payload'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { ContactFormBlock } from '../blocks/ContactFormBlock'
import { TwoColumnLayoutBlock } from '../blocks/TwoColumnLayoutBlock'

export const SimplePages: CollectionConfig = {
  slug: 'simple-pages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'createdAt'],
    livePreview: {
      url: ({ data }) => `${process.env.NEXT_PUBLIC_BASE_URL}/${data._locale || 'en'}/${data.url}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1200, height: 800 },
      ],
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } }
      return true
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL path for this page (e.g., info/people, event/new)',
        position: 'sidebar',
      },
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,

      blocks: [TextBlock, ImageBlock, VideoBlock, ContactFormBlock, TwoColumnLayoutBlock],
    },
  ],
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 100,
  },
  timestamps: true,
}
