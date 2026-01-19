'use server'

import { currentUser } from '@clerk/nextjs/server'
import { getCachedPayload } from '@/lib/payload'
import { eq, and, sql } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { WideEventBuilder } from '@/lib/wide-event-builder'
import { headers } from 'next/headers'

export async function voteArticle(articleId: number, action: 'like' | 'dislike' | 'remove') {
  const startRequest = Date.now()
  const user = await currentUser()
  const requestHeaders = await headers()

  const eventBuilder = new WideEventBuilder().setMessage('Server action: vote article').addFields({
    action,
    articleId,
    userAgent: requestHeaders.get('user-agent'),
    ip: requestHeaders.get('x-forwarded-for') || requestHeaders.get('x-real-ip'),
  })

  if (!user) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'unauthorized' }).log()
    throw new Error('Unauthorized')
  }

  if (!Number.isInteger(articleId)) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'invalid_article_id' }).log()
    throw new Error('Invalid article id')
  }

  eventBuilder.addFields({ userId: user.id })

  const payload = await getCachedPayload()
  const drizzle = payload.db.drizzle

  let result: { newLikesCount: number; newDislikesCount: number }

  const dbStart = Date.now()

  // eslint-disable-next-line prefer-const
  result = await drizzle.transaction(async (tx: any) => {
    let likesDelta = 0
    let dislikesDelta = 0

    // Read previous vote
    const prev = await tx
      .select({ voteType: article_user_votes.voteType })
      .from(article_user_votes)
      .where(
        and(eq(article_user_votes.articleId, articleId), eq(article_user_votes.userId, user.id)),
      )
      .limit(1)

    const previousVote = prev[0]?.voteType ?? null
    eventBuilder.addFields({ previousVote })

    if (previousVote === 'like') likesDelta--
    if (previousVote === 'dislike') dislikesDelta--

    if (action === 'like') likesDelta++
    if (action === 'dislike') dislikesDelta++

    // Read current counts
    const current = await tx
      .select({
        likesCount: article_votes.likesCount,
        dislikesCount: article_votes.dislikesCount,
      })
      .from(article_votes)
      .where(eq(article_votes.articleId, articleId))
      .limit(1)

    const baseLikes = current[0]?.likesCount ?? 0
    const baseDislikes = current[0]?.dislikesCount ?? 0

    const newLikesCount = baseLikes + likesDelta
    const newDislikesCount = baseDislikes + dislikesDelta

    // Update aggregate counters
    if (likesDelta !== 0 || dislikesDelta !== 0) {
      await tx
        .insert(article_votes)
        .values({
          articleId,
          likesCount: likesDelta,
          dislikesCount: dislikesDelta,
        })
        .onConflictDoUpdate({
          target: article_votes.articleId,
          set: {
            likesCount: sql`${article_votes.likesCount} + ${likesDelta}`,
            dislikesCount: sql`${article_votes.dislikesCount} + ${dislikesDelta}`,
          },
        })
    }

    // Update user vote
    if (action === 'remove') {
      await tx
        .delete(article_user_votes)
        .where(
          and(eq(article_user_votes.articleId, articleId), eq(article_user_votes.userId, user.id)),
        )
    } else {
      await tx
        .insert(article_user_votes)
        .values({
          articleId,
          userId: user.id,
          voteType: action,
        })
        .onConflictDoUpdate({
          target: [article_user_votes.articleId, article_user_votes.userId],
          set: { voteType: action },
        })
    }

    return { newLikesCount, newDislikesCount }
  })

  eventBuilder
    .setSeverity('info')
    .addFields({
      outcome: 'success',
      newLikesCount: result.newLikesCount,
      newDislikesCount: result.newDislikesCount,
      totalDurationMs: Date.now() - startRequest,
      dbDurationMs: Date.now() - dbStart,
      dbOperations: [
        { operation: 'select', table: 'article_user_votes' },
        { operation: 'select', table: 'article_votes' },
        { operation: 'upsert', table: 'article_votes' },
        { operation: 'upsert', table: 'article_user_votes' },
      ],
    })
    .log()

  return {
    success: true,
    likesCount: result.newLikesCount,
    dislikesCount: result.newDislikesCount,
  }
}
