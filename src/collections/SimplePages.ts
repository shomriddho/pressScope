import type { CollectionConfig } from 'payload'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'

export const SimplePages: CollectionConfig = {
  slug: 'simple-pages',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'createdAt'],
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

      blocks: [TextBlock, ImageBlock],
    },
  ],
  timestamps: true,
}
