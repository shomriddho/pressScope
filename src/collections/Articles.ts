import type { CollectionConfig } from 'payload'
import { TextBlock } from '../blocks/TextBlock'
import { ImageBlock } from '../blocks/ImageBlock'
import { VideoBlock } from '../blocks/VideoBlock'
import { ContactFormBlock } from '../blocks/ContactFormBlock'
import { TwoColumnLayoutBlock } from '../blocks/TwoColumnLayoutBlock'
import { collectionLogger, WideEvent, generateRequestId } from '../lib/logger'

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
      async ({ data, operation, originalDoc, req }) => {
        const startTime = Date.now()
        const requestId = generateRequestId()

        const wideEvent = new WideEvent('articles-collection', requestId).setRequest(
          operation.toUpperCase(),
          `/admin/collections/articles/${operation}`,
          {},
        )

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

        // Set up wide event data
        const userId = req.user?.id
        wideEvent.setUser(req.user)

        if (operation === 'create') {
          wideEvent
            .setBusinessData({
              operation: 'create',
              title: titleStr,
              category: data.category,
              slug: data.slug,
            })
            .setOutcome('ok', 200, 'Article creation initiated', Date.now() - startTime)
            .emit(collectionLogger)
        } else if (operation === 'update') {
          const statusChange = originalDoc?._status !== data._status
          wideEvent.setBusinessData({
            operation: 'update',
            articleId: originalDoc?.id,
            oldStatus: originalDoc?._status,
            newStatus: data._status,
            statusChanged: statusChange,
            title: titleStr,
          })

          if (statusChange) {
            wideEvent.setOutcome(
              'ok',
              200,
              'Article status change initiated',
              Date.now() - startTime,
            )
          } else {
            wideEvent.setOutcome('ok', 200, 'Article update initiated', Date.now() - startTime)
          }
          wideEvent.emit(collectionLogger)
        }

        return data
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        const startTime = Date.now()
        const requestId = generateRequestId()

        const wideEvent = new WideEvent('articles-collection', requestId).setRequest(
          operation.toUpperCase(),
          `/admin/collections/articles/${operation}`,
          {},
        )

        const userId = req.user?.id
        wideEvent.setUser(req.user)

        if (operation === 'create') {
          wideEvent
            .setBusinessData({
              operation: 'create',
              articleId: doc.id,
              title: doc.title,
              category: doc.category,
              slug: doc.slug,
              status: doc._status,
            })
            .setDatabase('create', {
              collection: 'articles',
              id: doc.id,
            })
            .setOutcome('ok', 200, 'Article created successfully', Date.now() - startTime)
            .emit(collectionLogger)
        } else if (operation === 'update') {
          wideEvent
            .setBusinessData({
              operation: 'update',
              articleId: doc.id,
              title: doc.title,
              status: doc._status,
            })
            .setDatabase('update', {
              collection: 'articles',
              id: doc.id,
            })
            .setOutcome('ok', 200, 'Article updated successfully', Date.now() - startTime)
            .emit(collectionLogger)
        }

        return doc
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
