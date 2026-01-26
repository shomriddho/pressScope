import React from 'react'
import { ArticleVoteButtons } from '../articles/ArticleVoteButtons'
import PageContent from './PageContent'
import Image from 'next/image'
export default function ArticleLayout({ data, locale }: { data: any; locale: string }) {
  return (
    <div>
      {data.thumbnail && typeof data.thumbnail === 'object' && data.thumbnail.url && (
        <Image
          src={data.thumbnail.url}
          alt={data.title}
          width={data.thumbnail.width}
          height={data.thumbnail.height}
          quality={60}
          className="mb-4 w-full"
        />
      )}
      {data.title && <h1 className="text-3xl font-bold mb-4">{data.title}</h1>}
      <div className="mb-4">
        <ArticleVoteButtons articleId={data.id} />
      </div>
      <PageContent content={data.content} locale={locale} />
    </div>
  )
}
