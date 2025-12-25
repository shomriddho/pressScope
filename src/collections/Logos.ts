import type { CollectionConfig } from 'payload'
import { adminOnly } from '../access/adminOnly'

export const Logos: CollectionConfig = {
  slug: 'logos',
  access: {
    read: ({ req: { user } }) => {
      // Public can read active logos, admins can read all
      if (user) return true
      return { active: { equals: true } }
    },
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'active', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'smallLogoLight',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'smallLogoDark',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'mediumLogoLight',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'mediumLogoDark',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'largeLogoLight',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'largeLogoDark',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
