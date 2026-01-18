import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getCachedPayload } from '@/lib/payload'
import { eq } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { WideEventBuilder } from '@/lib/wide-event-builder'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startRequest = Date.now()
  const { id } = await params
  const articleIdNum = Number(id)

  const eventBuilder = new WideEventBuilder().setMessage('API: fetch article vote data').addFields({
    articleId: id,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
  })

  if (!Number.isInteger(articleIdNum)) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'invalid_article_id' }).log()
    return NextResponse.json({ error: 'Invalid article id' }, { status: 400 })
  }

  try {
    const payload = await getCachedPayload()
    const drizzle = payload.db.drizzle
    const startDB = Date.now()

    // Get vote counts
    const votes = await drizzle
      .select()
      .from(article_votes)
      .where(eq(article_votes.articleId, articleIdNum))
      .limit(1)

    const likesCount = votes[0]?.likesCount ?? 0
    const dislikesCount = votes[0]?.dislikesCount ?? 0

    // Get user vote if authenticated
    let userVoteType: 'like' | 'dislike' | null = null
    const user = await currentUser()
    if (user) {
      const userVote = await drizzle
        .select({ voteType: article_user_votes.voteType })
        .from(article_user_votes)
        .where(
          eq(article_user_votes.articleId, articleIdNum) && eq(article_user_votes.userId, user.id),
        )
        .limit(1)

      userVoteType = userVote[0]?.voteType ?? null
    }

    eventBuilder
      .setSeverity('info')
      .addFields({
        outcome: 'success',
        likesCount,
        dislikesCount,
        userVoteType,
        authenticated: !!user,
        totalDurationMs: Date.now() - startRequest,
        dbDurationMs: Date.now() - startDB,
        dbOperations: [
          { operation: 'select', table: 'article_votes', rows: votes.length },
          ...(user ? [{ operation: 'select', table: 'article_user_votes', rows: 1 }] : []),
        ],
      })
      .log()

    return NextResponse.json(
      {
        likesCount,
        dislikesCount,
        userVoteType,
      },
      {
        headers: { 'Cache-Control': 'private, max-age=60' }, // 1 minute cache, private since includes user data
      },
    )
  } catch (error) {
    console.error('Error fetching vote data:', error)
    return NextResponse.json({ error: 'Failed to fetch vote data' }, { status: 500 })
  }
}
