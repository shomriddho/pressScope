import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { s3Storage } from '@payloadcms/storage-s3'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { AppUsers } from './collections/AppUsers'
import { Logos } from './collections/Logos'
import { SimplePages } from './collections/SimplePages'
import { Category } from './collections/Category'
import { Feed } from './collections/Feed'
import { ContactMessages } from './collections/ContactMessages'
import { SEO } from './globals/SEO'
import { clerkWebhook } from './endpoints/clerkWebhook'
import { submitContact } from './endpoints/submitContact'
import { getActiveLogo } from './endpoints/getActiveLogo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, AppUsers, Logos, SimplePages, Category, Feed, ContactMessages],
  globals: [SEO],
  endpoints: [clerkWebhook, submitContact, getActiveLogo],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),

  plugins: [
    payloadCloudPlugin(),
    nestedDocsPlugin({
      collections: ['categories' as const],
      parentFieldSlug: 'parent',
      generateLabel: (_, doc) => doc.name as string,
      generateURL: (docs) =>
        docs.reduce((url, doc) => `${url}/${(doc.slug || doc.name) as string}`, ''),
    }),
    seoPlugin({
      collections: ['simple-pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `PressScope — ${doc.name}`,
      generateDescription: ({ doc }) => `PressScope — ${doc.description ?? doc.name}`,
    }),
    // storage-adapter-placeholder
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        },
      },
      bucket: process.env.S3_BUCKET ?? 'default-bucket',
      config: {
        forcePathStyle: true,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
        },
        region: process.env.S3_REGION ?? 'us-east-1',
        endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
      },
    }),
  ],
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Bangla', code: 'bn' },
    ],
    defaultLocale: 'bn',
    fallback: true,
  },
})
