import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import config from '../../../../payload.config'
import { eq, and, sql } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { WideEventBuilder } from '@/lib/wide-event-builder'
import { getPayload } from 'payload'
import { logger } from '@/lib/logger'
import { shipToBetterStack } from '@/lib/shipLogs'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const startRequest = Date.now()
  const { id } = await params
  const articleId = Number(id)

  const eventBuilder = new WideEventBuilder().setMessage('API: fetch article vote data').addFields({
    articleId: id,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip'),
  })

  if (!Number.isInteger(articleId)) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'invalid_article_id' }).log()

    // Ship only warnings/errors to Better Stack
    shipToBetterStack(eventBuilder.build())

    return NextResponse.json({ error: 'Invalid article id' }, { status: 400 })
  }

  try {
    // 🔐 Lightweight auth
    const { userId } = await auth()

    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle

    const dbStart = Date.now()

    const rows = await drizzle
      .select({
        likesCount: article_votes.likesCount,
        dislikesCount: article_votes.dislikesCount,
        userVoteType: article_user_votes.voteType,
      })
      .from(article_votes)
      .leftJoin(
        article_user_votes,
        and(
          eq(article_votes.articleId, article_user_votes.articleId),
          userId ? eq(article_user_votes.userId, userId) : sql`false`,
        ),
      )
      .where(eq(article_votes.articleId, articleId))
      .limit(1)

    const dbDurationMs = Date.now() - dbStart
    const row = rows[0]

    const likesCount = row?.likesCount ?? 0
    const dislikesCount = row?.dislikesCount ?? 0
    const userVoteType = row?.userVoteType ?? null

    eventBuilder
      .setSeverity('info')
      .addFields({
        outcome: 'success',
        likesCount,
        dislikesCount,
        userVoteType,
        authenticated: !!userId,
        totalDurationMs: Date.now() - startRequest,
        dbDurationMs,
        dbOperations: [
          {
            operation: 'select_join',
            table: 'article_votes + article_user_votes',
          },
        ],
      })
      .log()

    // Optional: send only important metrics to Better Stack
    // (avoid sending on every request)
    shipToBetterStack(eventBuilder.build())

    return NextResponse.json({
      likesCount,
      dislikesCount,
      userVoteType,
    })
  } catch (error) {
    logger.error({ articleId: id, error }, 'API: failed to fetch article vote data')

    // Ship errors to Better Stack
    shipToBetterStack(eventBuilder.build())

    return NextResponse.json({ error: 'Failed to fetch vote data' }, { status: 500 })
  }
}
