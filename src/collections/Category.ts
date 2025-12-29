import type { CollectionConfig } from 'payload'
import { createParentField } from '@payloadcms/plugin-nested-docs'

export const Category: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Category name',
      },
    },
    {
      name: 'feed',
      type: 'relationship',
      relationTo: 'feeds',
      required: false,
      hasMany: false,
      admin: {
        description: 'Associated feed for this category',
      },
    },
    createParentField('categories', {
      admin: {
        position: 'sidebar',
      },
    }),
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation, context }) => {
        if (operation === 'create' && !context.skipFeedCreation) {
          // Create a corresponding Feed with the same localized name
          const feed = await req.payload.create({
            collection: 'feeds',
            data: {
              name: doc.name, // Localized name
              category: doc.id, // Reference to this category
            },
            req, // Pass req for transaction safety
          })

          // Update the category with the feed reference
          await req.payload.update({
            collection: 'categories',
            id: doc.id,
            data: {
              feed: feed.id,
            },
            context: { skipFeedCreation: true }, // Prevent infinite loop
            req, // Pass req for transaction safety
          })
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
