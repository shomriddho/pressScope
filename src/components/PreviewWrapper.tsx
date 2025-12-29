'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import PageContent from './PageContent'

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

  return (
    <div className="container mx-auto px-4 py-8">
      {data.thumbnail && typeof data.thumbnail === 'object' && data.thumbnail.url && (
        <img src={data.thumbnail.url} alt={data.title} className="mb-4" />
      )}
      {data.content && <PageContent content={data.content} locale={locale} />}
    </div>
  )
}
