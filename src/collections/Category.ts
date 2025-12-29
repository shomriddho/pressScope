import type { CollectionConfig } from 'payload'
import { createParentField } from '@payloadcms/plugin-nested-docs'

// Simple slugify function
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const Category: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'parent', 'createdAt'],
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
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug for this category',
        position: 'sidebar',
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
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        // Auto-generate slug from name if not provided
        let nameStr = ''
        if (typeof data.name === 'string') {
          nameStr = data.name
        } else if (data.name && typeof data.name === 'object') {
          nameStr = data.name.en || data.name.bn || ''
        }

        if (nameStr && !data.slug) {
          data.slug = slugify(nameStr)
        }
        return data
      },
    ],
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
