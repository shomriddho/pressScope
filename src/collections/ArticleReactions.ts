import type { CollectionConfig } from 'payload'

export const ArticleReactions: CollectionConfig = {
  slug: 'article-reactions',
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'app-users',
      required: true,
    },
    {
      name: 'article',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: ['like', 'dislike'],
      required: true,
    },
  ],
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      return {
        user: { equals: user.id },
      }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      return {
        user: { equals: user.id },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return {
        user: { equals: user.id },
      }
    },
  },
}
