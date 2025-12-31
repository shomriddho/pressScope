import type { CollectionConfig } from 'payload'

export const ArticleUserVotes: CollectionConfig = {
  slug: 'articleUserVotes',
  admin: {
    useAsTitle: 'articleId',
  },
  fields: [
    {
      name: 'articleId',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      index: true,
    },
    {
      name: 'userId',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'voteType',
      type: 'select',
      options: ['like', 'dislike'],
      required: true,
    },
  ],
  // Compound unique index on articleId + userId
  indexes: [
    {
      fields: ['articleId', 'userId'],
      unique: true,
    },
  ],
  // No versions needed
  timestamps: true,
}
