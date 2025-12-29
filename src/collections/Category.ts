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
    createParentField('categories', {
      admin: {
        position: 'sidebar',
      },
    }),
  ],
  timestamps: true,
}
