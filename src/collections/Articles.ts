import type { CollectionConfig } from 'payload'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { ContactFormBlock } from '../blocks/ContactFormBlock'
import { TwoColumnLayoutBlock } from '../blocks/TwoColumnLayoutBlock'

// Simple slugify function
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'slug', 'thumbnail', 'excerpt', 'createdAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_BASE_URL}/${data._locale || 'en'}/${data.fullUrl}`,
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1200, height: 800 },
      ],
    },
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return { _status: { equals: 'published' } }
      return true
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL slug for this article',
        position: 'sidebar',
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Thumbnail image for the article',
      },
    },
    {
      name: 'excerpt',
      type: 'text',
      localized: true,
      admin: {
        description: 'Short excerpt or summary',
      },
    },
    {
      name: 'fullUrl',
      type: 'text',
      virtual: true,
      admin: {
        description: 'Full URL path (computed)',
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        afterRead: [
          async ({ siblingData, req }) => {
            if (!siblingData.category || !siblingData.slug) return ''

            // Fetch the category with breadcrumbs
            const category = await req.payload.findByID({
              collection: 'categories',
              id: siblingData.category,
              depth: 0, // Breadcrumbs should be included by the plugin
            })

            if (!category.breadcrumbs || category.breadcrumbs.length === 0) return siblingData.slug

            // Use the full path from the last breadcrumb
            const lastBreadcrumb = category.breadcrumbs[category.breadcrumbs.length - 1]
            if (!lastBreadcrumb || !lastBreadcrumb.url) return siblingData.slug
            const categoryPath = lastBreadcrumb.url.replace(/^\//, '')
            return `${categoryPath}/${siblingData.slug}`
          },
        ],
      },
    },
    {
      name: 'content',
      type: 'blocks',
      blocks: [TextBlock, ImageBlock, VideoBlock, ContactFormBlock, TwoColumnLayoutBlock],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, originalDoc }) => {
        // Auto-generate slug from title if not provided
        let titleStr = ''
        if (typeof data.title === 'string') {
          titleStr = data.title
        } else if (data.title && typeof data.title === 'object') {
          titleStr = data.title.en || data.title.bn || ''
        }

        if (titleStr && !data.slug) {
          data.slug = slugify(titleStr)
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: true,
    },
    maxPerDoc: 10,
  },
  timestamps: true,
}
