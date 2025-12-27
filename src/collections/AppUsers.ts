import type { CollectionConfig } from 'payload'

export const AppUsers: CollectionConfig = {
  slug: 'app-users',
  admin: {
    useAsTitle: 'username',
    defaultColumns: ['username', 'email', 'id'],
  },
  fields: [
    {
      name: 'id',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      label: 'Clerk User ID',
    },
    {
      name: 'username',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Profile Image URL',
    },
  ],
}
