import type { CollectionConfig } from 'payload'

export const Feed: CollectionConfig = {
  slug: 'feeds',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'createdAt'],
  },
  versions: {
    drafts: {
      autosave: true,
      schedulePublish: true,
    },
    maxPerDoc: 100,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Feed name',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: false,
      unique: true,
      admin: {
        description: 'Category for this feed',
      },
    },
  ],
  timestamps: true,
}
