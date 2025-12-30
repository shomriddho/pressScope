'use client'

import { useLivePreview } from '@payloadcms/live-preview-react'
import { useUser } from '@clerk/nextjs'
import PageContent from './PageContent'
import { ArticleVoteButtons } from './ArticleVoteButtons'

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
  const { user } = useUser()

  const isArticle = data.likes !== undefined
  const userVote: 'like' | 'dislike' | null =
    user && isArticle
      ? data.likes?.some((l: any) => l.userId === user.id)
        ? 'like'
        : data.dislikes?.some((d: any) => d.userId === user.id)
          ? 'dislike'
          : null
      : null

  return (
    <div className="container mx-auto px-4 py-8">
      {data.thumbnail && typeof data.thumbnail === 'object' && data.thumbnail.url && (
        <img src={data.thumbnail.url} alt={data.title} className="mb-4" />
      )}
      {data.title && <h1 className="text-3xl font-bold mb-4">{data.title}</h1>}
      {isArticle && (
        <div className="mb-4">
          <ArticleVoteButtons
            articleId={data.id}
            likesCount={data.likesCount || 0}
            dislikesCount={data.dislikesCount || 0}
            userVote={userVote}
          />
        </div>
      )}
      {data.content && <PageContent content={data.content} locale={locale} />}
    </div>
  )
}
