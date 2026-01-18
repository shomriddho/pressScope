import type { CollectionConfig } from 'payload'

export const ArticleUserVotes: CollectionConfig = {
  slug: 'articleUserVotes',

  admin: {
    hidden: true, // votes should not be edited in admin
  },

  fields: [
    {
      name: 'articleId',
      type: 'number', // 🔥 plain ID
      required: true,
      index: true,
    },
    {
      name: 'userId',
      type: 'text',
      required: true,
    },
    {
      name: 'voteType',
      type: 'select',
      options: [
        { label: 'Like', value: 'like' },
        { label: 'Dislike', value: 'dislike' },
      ],
      required: true,
    },
  ],

  indexes: [
    {
      fields: ['articleId', 'userId'],
      unique: true,
    },
    {
      fields: ['articleId', 'voteType'], // 🔥 supports aggregation queries
    },
  ],

  timestamps: false, // 🔥 remove unnecessary writes
}
