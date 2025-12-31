import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ user: string }> }) {
  const { user: userId } = await params

  const payload = await getPayload({ config })

  // Fetch user votes where voteType is 'like'
  const userVotes = await payload.find({
    collection: 'articleUserVotes',
    where: {
      userId: { equals: userId },
      voteType: { equals: 'like' },
    },
    depth: 0,
    limit: 50,
  })

  // Get article IDs
  const articleIds = userVotes.docs.map((vote) => vote.articleId).filter(Boolean)

  if (articleIds.length === 0) {
    return Response.json({ articles: [] })
  }

  // Fetch articles
  const articles = await payload.find({
    collection: 'articles',
    where: {
      id: { in: articleIds },
      _status: { equals: 'published' },
    },
    select: {
      title: true,
      slug: true,
      thumbnail: true,
      excerpt: true,
      category: true,
      fullUrl: true,
    },
    depth: 1,
    limit: 50,
  })

  return Response.json({ articles: articles.docs })
}
