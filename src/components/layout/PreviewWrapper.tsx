'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import PageContent from './PageContent'

import ArticleLayout from './ArticleLayout'

interface PreviewWrapperProps {
  initialData: any
  locale: string
}

export default function PreviewWrapper({ initialData, locale }: PreviewWrapperProps) {
  const { data } = useLivePreview({
    initialData,
    serverURL: process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000',
    depth: 2,
  })
  const isArticle = data.url !== undefined // Articles have _status field

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* {data.thumbnail && typeof data.thumbnail === 'object' && data.thumbnail.url && (
        <img src={data.thumbnail.url} alt={data.title} className="mb-4" />
      )}
      {data.title && <h1 className="text-3xl font-bold mb-4">{data.title}</h1>}
      {isArticle && (
        <div className="mb-4">
          <ArticleVoteButtons articleId={data.id} />
        </div>
      )}
      {data.content && <PageContent content={data.content} locale={locale} />} */}
      {/* if isArticle show article page */}
      {!isArticle && <ArticleLayout data={data} locale={locale} />}
      {/* if is not article show page content */}
      {isArticle && data.content && <PageContent content={data.content} locale={locale} />}
    </div>
  )
}
