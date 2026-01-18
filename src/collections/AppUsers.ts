import type { CollectionConfig } from 'payload'

export const AppUsers: CollectionConfig = {
  slug: 'app-users',
  admin: {
    useAsTitle: 'username',
    defaultColumns: ['username', 'email', 'id'],
  },
  access: {
    read: ({ req: { user }, id }) => {
      if (user?.id === id) return true // Users can read their own data
      return user?.roles?.includes('admin') || false
    },
    update: ({ req: { user }, id }) => {
      if (user?.id === id) return true // Users can update their own data
      return user?.roles?.includes('admin') || false
    },
    create: ({ req: { user } }) => user?.roles?.includes('admin') || false,
    delete: ({ req: { user } }) => user?.roles?.includes('admin') || false,
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
