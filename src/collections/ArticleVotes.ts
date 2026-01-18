import type { CollectionConfig } from 'payload'

export const ArticleVotes: CollectionConfig = {
  slug: 'articleVotes',

  admin: {
    hidden: true,
  },

  fields: [
    {
      name: 'articleId',
      type: 'number', // 🔥 plain ID
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

  timestamps: false, // 🔥 avoid write amplification
}
