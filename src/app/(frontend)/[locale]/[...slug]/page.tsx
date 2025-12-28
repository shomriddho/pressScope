import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PageContent from '../../../../components/PageContent'

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })

  // Get all simple pages
  const pages = await payload.find({
    collection: 'simple-pages',
    limit: 0, // Get all
  })

  const params: { locale: string; slug: string[] }[] = []

  // For each page, generate params for both locales
  for (const page of pages.docs) {
    const slug = page.url.split('/').filter(Boolean) // Split URL and remove empty parts
    params.push({ locale: 'en', slug }, { locale: 'bn', slug })
  }

  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const url = slug.join('/')

  const payload = await getPayload({ config })

  // Get the page
  const page = await payload.find({
    collection: 'simple-pages',
    where: {
      url: { equals: url },
    },
    limit: 1,
    locale: locale as 'en' | 'bn',
    depth: 2,
  })

  if (!page.docs.length) {
    return {}
  }

  const doc = page.docs[0]

  // Get global SEO settings
  const globalSEO = await payload.findGlobal({
    slug: 'seo',
    locale: locale as 'en' | 'bn',
    depth: 1, // Populate relationships
  })

  // Extract image URL safely
  const ogImageUrl =
    globalSEO.ogImage &&
    typeof globalSEO.ogImage === 'object' &&
    'url' in globalSEO.ogImage &&
    globalSEO.ogImage.url
      ? (globalSEO.ogImage.url as string)
      : undefined

  return {
    title: doc.meta?.title || doc.name,
    description: doc.meta?.description || '',
    openGraph: {
      title: doc.meta?.title || doc.name,
      description: doc.meta?.description || '',
      images: ogImageUrl ? [{ url: ogImageUrl }] : [],
      type: 'article',
    },
    twitter: {
      card: globalSEO.twitterCard || 'summary_large_image',
      title: doc.meta?.title || doc.name,
      description: doc.meta?.description || '',
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params
  const url = slug.join('/')

  const payload = await getPayload({ config })
  const page = await payload.find({
    collection: 'simple-pages',
    where: {
      url: { equals: url },
    },
    limit: 1,
    locale: locale as 'en' | 'bn',
  })

  if (!page.docs.length) {
    notFound()
  }

  const doc = page.docs[0]

  return (
    <div className="container mx-auto px-4 py-8">
      {doc.content && <PageContent content={doc.content} locale={locale} />}
    </div>
  )
}

export const revalidate = 60 // ISR: revalidate every 60 seconds
