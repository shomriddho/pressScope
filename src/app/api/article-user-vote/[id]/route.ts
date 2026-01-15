import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { eq, and } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

    return NextResponse.json({ voteType })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user vote' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle

    const articleIdNum = parseInt(id)
    const body = await request.json()
    const { action }: { action: 'like' | 'dislike' | 'remove' } = body

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

    return NextResponse.json({ likesCount, dislikesCount })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
