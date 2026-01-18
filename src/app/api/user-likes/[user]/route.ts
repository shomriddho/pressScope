import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ user: string }> }) {
  const { user: userId } = await params
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100

  const payload = await getPayload({ config })

  // Fetch user votes where voteType is 'like'
  const userVotes = await payload.find({
    collection: 'articleUserVotes',
    where: {
      userId: { equals: userId },
      voteType: { equals: 'like' },
    },
    depth: 0,
    limit,
    page,
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

  // Fetch vote counts for these articles
  const articleVotes = await payload.find({
    collection: 'articleVotes',
    where: {
      articleId: { in: articleIds },
    },
    select: {
      articleId: true,
      likesCount: true,
      dislikesCount: true,
    },
    depth: 0,
    limit: 50,
  })

  // Create a map of articleId to vote counts
  const voteMap = new Map()
  articleVotes.docs.forEach((vote) => {
    voteMap.set(String(vote.articleId), {
      likesCount: vote.likesCount,
      dislikesCount: vote.dislikesCount,
    })
  })

  // Add vote counts to articles
  const articlesWithVotes = articles.docs.map((article) => ({
    ...article,
    votes: voteMap.get(String(article.id)) || { likesCount: 0, dislikesCount: 0 },
  }))

  return Response.json({ articles: articlesWithVotes })
}
