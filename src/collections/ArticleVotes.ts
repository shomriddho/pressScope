import type { CollectionConfig } from 'payload'

export const ArticleVotes: CollectionConfig = {
  slug: 'articleVotes',
  admin: {
    useAsTitle: 'articleId',
  },
  fields: [
    {
      name: 'articleId',
      type: 'relationship',
      relationTo: 'articles',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'likesCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
    {
      name: 'dislikesCount',
      type: 'number',
      required: true,
      defaultValue: 0,
      min: 0,
    },
  ],
  // No versions needed - votes are not versioned
  timestamps: true,
}
