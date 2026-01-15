import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { eq, and } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { WideEventBuilder } from '@/lib/wide-event-builder'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startRequest = Date.now()
  const { id } = await params
  const user = await currentUser()

  const eventBuilder = new WideEventBuilder().setMessage('Fetch user vote').addFields({
    method: 'GET',
    path: `/articles/${id}`,
    headers: Object.fromEntries(request.headers),
  })

  if (!user) {
    eventBuilder
      .setSeverity('warn')
      .addFields({
        outcome: 'unauthorized',
        statusCode: 401,
        durationMs: Date.now() - startRequest,
      })
      .log()

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  eventBuilder.addField('user', { id: user.id, email: user.emailAddresses[0]?.emailAddress })

  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle
    const articleIdNum = parseInt(id)

    // Measure DB query duration
    const startDB = Date.now()
    const userVote = await drizzle
      .select()
      .from(article_user_votes)
      .where(
        and(eq(article_user_votes.articleId, articleIdNum), eq(article_user_votes.userId, user.id)),
      )
      .limit(1)
    const dbDuration = Date.now() - startDB

    const voteType = userVote.length > 0 ? userVote[0].voteType : null
    const statusCode = 200

    eventBuilder
      .setSeverity('info')
      .addFields({
        outcome: 'ok',
        articleId: articleIdNum,
        voteType,
        statusCode,
        durationMs: Date.now() - startRequest,
        dbOperations: [
          {
            table: 'article_user_votes',
            query: 'SELECT ...',
            rowsReturned: userVote.length,
            durationMs: dbDuration,
          },
        ],
        responseSummary: { voteType },
      })
      .log()

    return NextResponse.json({ voteType }, { status: statusCode })
  } catch (error) {
    const statusCode = 500
    eventBuilder
      .setSeverity('error')
      .addFields({
        outcome: 'error',
        error: (error as Error).message,
        statusCode,
        durationMs: Date.now() - startRequest,
      })
      .log()

    return NextResponse.json({ error: 'Failed to fetch user vote' }, { status: statusCode })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startRequest = Date.now()
  const { id } = await params
  const user = await currentUser()

  const eventBuilder = new WideEventBuilder().setMessage('User vote action').addFields({
    method: 'POST',
    path: `/articles/${id}`,
    headers: Object.fromEntries(request.headers),
  })

  if (!user) {
    eventBuilder
      .setSeverity('warn')
      .addFields({
        outcome: 'unauthorized',
        statusCode: 401,
        durationMs: Date.now() - startRequest,
      })
      .log()
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  eventBuilder.addField('user', { id: user.id, email: user.emailAddresses[0]?.emailAddress })

  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle
    const articleIdNum = parseInt(id)
    const body = await request.json()
    const { action }: { action: 'like' | 'dislike' | 'remove' } = body

    const dbOperations: any[] = []

    let statusCode = 200

    if (action === 'remove') {
      const startDB = Date.now()
      const deleteResult = await drizzle
        .delete(article_user_votes)
        .where(
          and(
            eq(article_user_votes.articleId, articleIdNum),
            eq(article_user_votes.userId, user.id),
          ),
        )
      dbOperations.push({
        operation: 'delete',
        table: 'article_user_votes',
        conditions: { articleId: articleIdNum, userId: user.id },
        rowsAffected: deleteResult.rowCount,
        durationMs: Date.now() - startDB,
      })
    } else {
      const startDB = Date.now()
      const upsertResult = await drizzle
        .insert(article_user_votes)
        .values({ articleId: articleIdNum, userId: user.id, voteType: action })
        .onConflictDoUpdate({
          target: [article_user_votes.articleId, article_user_votes.userId],
          set: { voteType: action },
        })
      dbOperations.push({
        operation: 'upsert',
        table: 'article_user_votes',
        data: { articleId: articleIdNum, userId: user.id, voteType: action },
        rowsAffected: upsertResult.rowCount,
        durationMs: Date.now() - startDB,
      })
    }

    // Update vote counts
    const startDBVotes = Date.now()
    const userVotes = await drizzle
      .select()
      .from(article_user_votes)
      .where(eq(article_user_votes.articleId, articleIdNum))
    const likesCount = userVotes.filter((v) => v.voteType === 'like').length
    const dislikesCount = userVotes.filter((v) => v.voteType === 'dislike').length
    dbOperations.push({
      operation: 'select',
      table: 'article_user_votes',
      rowsReturned: userVotes.length,
      durationMs: Date.now() - startDBVotes,
    })

    const startDBVoteUpdate = Date.now()
    const votesUpsert = await drizzle
      .insert(article_votes)
      .values({ articleId: articleIdNum, likesCount, dislikesCount })
      .onConflictDoUpdate({
        target: article_votes.articleId,
        set: { likesCount, dislikesCount },
      })
    dbOperations.push({
      operation: 'upsert',
      table: 'article_votes',
      data: { articleId: articleIdNum, likesCount, dislikesCount },
      rowsAffected: votesUpsert.rowCount,
      durationMs: Date.now() - startDBVoteUpdate,
    })

    statusCode = 201

    const responseSummary = { likesCount, dislikesCount, articleId: articleIdNum }

    eventBuilder
      .setSeverity('info')
      .addFields({
        outcome: 'ok',
        articleId: articleIdNum,
        action,
        likesCount,
        dislikesCount,
        statusCode,
        durationMs: Date.now() - startRequest,
        dbOperations,
        responseSummary,
      })
      .log()

    return NextResponse.json(responseSummary, { status: statusCode })
  } catch (error) {
    const statusCode = 500
    eventBuilder
      .setSeverity('error')
      .addFields({
        outcome: 'error',
        error: (error as Error).message,
        statusCode,
        durationMs: Date.now() - startRequest,
      })
      .log()

    return NextResponse.json({ error: 'Failed to vote' }, { status: statusCode })
  }
}
