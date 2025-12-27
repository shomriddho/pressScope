import type { Block } from 'payload'

export const VideoBlock: Block = {
  slug: 'videoBlock',
  labels: {
    singular: 'Video Block',
    plural: 'Video Blocks',
  },
  fields: [
    {
      name: 'youtubeUrl',
      type: 'text',
      required: true,
      label: 'YouTube URL',
      admin: {
        description:
          'Enter the full YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)',
      },
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      label: 'Video Title',
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
      label: 'Video Description',
    },
  ],
}
