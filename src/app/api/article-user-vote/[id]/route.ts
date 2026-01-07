import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { eq, and } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { apiLogger, WideEvent, generateRequestId } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params
  const requestId = generateRequestId()

  const wideEvent = new WideEvent('article-vote-api', requestId).setRequest(
    'GET',
    `/api/article-user-vote/${id}`,
    Object.fromEntries(request.headers.entries()),
  )

  const user = await currentUser()
  if (!user) {
    wideEvent
      .setUser(null)
      .setOutcome('ok', 200, 'Vote check for unauthenticated user', Date.now() - startTime)
      .emit(apiLogger)
    return NextResponse.json({ voteType: null })
  }

  wideEvent.setUser(user)
  const userId = user.id

  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle

    const articleIdNum = parseInt(id)

    const userVote = await drizzle
      .select()
      .from(article_user_votes)
      .where(
        and(eq(article_user_votes.articleId, articleIdNum), eq(article_user_votes.userId, userId)),
      )
      .limit(1)

    const voteType = userVote.length > 0 ? userVote[0].voteType : null

    wideEvent
      .setBusinessData({
        articleId: articleIdNum,
        voteType,
        voteFound: userVote.length > 0,
      })
      .setDatabase('select', {
        table: 'article_user_votes',
        conditions: { articleId: articleIdNum, userId },
      })
      .setOutcome('ok', 200, 'Vote retrieved successfully', Date.now() - startTime)
      .emit(apiLogger)

    return NextResponse.json({ voteType })
  } catch (error) {
    wideEvent
      .setBusinessData({ articleId: id })
      .setError(error)
      .setOutcome('error', 500, 'Failed to fetch user vote', Date.now() - startTime)
      .emit(apiLogger)
    return NextResponse.json({ error: 'Failed to fetch user vote' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startTime = Date.now()
  const { id } = await params
  const requestId = generateRequestId()

  const wideEvent = new WideEvent('article-vote-api', requestId).setRequest(
    'POST',
    `/api/article-user-vote/${id}`,
    Object.fromEntries(request.headers.entries()),
  )

  const user = await currentUser()
  if (!user) {
    wideEvent
      .setUser(null)
      .setOutcome('error', 401, 'Unauthorized vote attempt', Date.now() - startTime)
      .emit(apiLogger)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  wideEvent.setUser(user)
  const userId = user.id

  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle

    const articleIdNum = parseInt(id)
    const body = await request.json()
    const { action }: { action: 'like' | 'dislike' | 'remove' } = body

    wideEvent.setBusinessData({ articleId: articleIdNum, action })

    const dbOperations = []

    if (action === 'remove') {
      await drizzle
        .delete(article_user_votes)
        .where(
          and(
            eq(article_user_votes.articleId, articleIdNum),
            eq(article_user_votes.userId, userId),
          ),
        )
      dbOperations.push({
        operation: 'delete',
        table: 'article_user_votes',
        conditions: { articleId: articleIdNum, userId },
      })
    } else {
      await drizzle
        .insert(article_user_votes)
        .values({
          articleId: articleIdNum,
          userId,
          voteType: action,
        })
        .onConflictDoUpdate({
          target: [article_user_votes.articleId, article_user_votes.userId],
          set: { voteType: action },
        })
      dbOperations.push({
        operation: 'upsert',
        table: 'article_user_votes',
        data: { articleId: articleIdNum, userId, voteType: action },
      })
    }

    // Update the vote counts
    const userVotes = await drizzle
      .select()
      .from(article_user_votes)
      .where(eq(article_user_votes.articleId, articleIdNum))

    const likesCount = userVotes.filter((v) => v.voteType === 'like').length
    const dislikesCount = userVotes.filter((v) => v.voteType === 'dislike').length

    // Update article_votes table
    await drizzle
      .insert(article_votes)
      .values({
        articleId: articleIdNum,
        likesCount,
        dislikesCount,
      })
      .onConflictDoUpdate({
        target: article_votes.articleId,
        set: { likesCount, dislikesCount },
      })

    dbOperations.push({
      operation: 'upsert',
      table: 'article_votes',
      data: { articleId: articleIdNum, likesCount, dislikesCount },
    })

    wideEvent
      .setBusinessData({
        articleId: articleIdNum,
        action,
        likesCount,
        dislikesCount,
        userVotesCount: userVotes.length,
      })
      .setDatabase('batch', dbOperations)
      .setOutcome('ok', 200, 'Vote processed successfully', Date.now() - startTime)
      .emit(apiLogger)

    return NextResponse.json({ likesCount, dislikesCount })
  } catch (error) {
    wideEvent
      .setBusinessData({ articleId: id })
      .setError(error)
      .setOutcome('error', 500, 'Vote processing failed', Date.now() - startTime)
      .emit(apiLogger)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
