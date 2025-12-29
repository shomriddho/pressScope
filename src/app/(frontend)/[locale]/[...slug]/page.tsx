import { getPayload } from 'payload'
import config from '../../../../payload.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PreviewWrapper from '../../../../components/PreviewWrapper'

interface PageProps {
  params: Promise<{ locale: string; slug: string[] }>
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })

  // Get all published simple pages
  const pages = await payload.find({
    collection: 'simple-pages',
    where: { _status: { equals: 'published' } },
    limit: 0, // Get all
  })

  // Get all published articles
  const articles = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 0, // Get all
    depth: 2, // Populate category breadcrumbs
  })

  const params: { locale: string; slug: string[] }[] = []

  // For each page, generate params for both locales
  for (const page of pages.docs) {
    if (!page.url) continue // Skip pages without URL
    const slug = page.url.split('/').filter(Boolean) // Split URL and remove empty parts
    params.push({ locale: 'en', slug }, { locale: 'bn', slug })
  }

  // For each article, generate params for both locales
  for (const article of articles.docs) {
    if (!article.fullUrl) continue // Skip articles without fullUrl
    const slug = article.fullUrl.split('/').filter(Boolean) // Split URL and remove empty parts
    params.push({ locale: 'en', slug }, { locale: 'bn', slug })
  }

  return params
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const url = slug.join('/')

  const payload = await getPayload({ config })

  // Try to get the simple page first
  const page = await payload.find({
    collection: 'simple-pages',
    where: {
      url: { equals: url },
    },
    limit: 1,
    locale: locale as 'en' | 'bn',
    depth: 2,
  })

  let doc: any = null

  if (page.docs.length) {
    doc = page.docs[0]
  } else {
    // Try to find an article
    const articles = await payload.find({
      collection: 'articles',
      where: { _status: { equals: 'published' } },
      limit: 0,
      locale: locale as 'en' | 'bn',
      depth: 2,
    })

    doc = articles.docs.find((article) => article.fullUrl === url)
  }

  if (!doc) {
    return {}
  }

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
    title: doc.meta?.title || doc.title || doc.name,
    description: doc.meta?.description || doc.excerpt || '',
    openGraph: {
      title: doc.meta?.title || doc.title || doc.name,
      description: doc.meta?.description || doc.excerpt || '',
      images: doc.thumbnail?.url
        ? [{ url: doc.thumbnail.url }]
        : ogImageUrl
          ? [{ url: ogImageUrl }]
          : [],
      type: 'article',
    },
    twitter: {
      card: globalSEO.twitterCard || 'summary_large_image',
      title: doc.meta?.title || doc.title || doc.name,
      description: doc.meta?.description || doc.excerpt || '',
      images: doc.thumbnail?.url ? [doc.thumbnail.url] : ogImageUrl ? [ogImageUrl] : [],
    },
  }
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params
  const url = slug.join('/')

  const payload = await getPayload({ config })

  // Try to find a simple page first
  const page = await payload.find({
    collection: 'simple-pages',
    where: {
      url: { equals: url },
    },
    limit: 1,
    locale: locale as 'en' | 'bn',
  })

  if (page.docs.length) {
    const doc = page.docs[0]
    return <PreviewWrapper initialData={doc} locale={locale} />
  }

  // If no simple page, try to find an article
  const articles = await payload.find({
    collection: 'articles',
    where: { _status: { equals: 'published' } },
    limit: 0, // Get all published articles
    locale: locale as 'en' | 'bn',
    depth: 2, // Populate category breadcrumbs
  })

  const article = articles.docs.find((doc) => doc.fullUrl === url)

  if (article) {
    return <PreviewWrapper initialData={article} locale={locale} />
  }

  notFound()
}

export const revalidate = 60 // ISR: revalidate every 60 seconds
