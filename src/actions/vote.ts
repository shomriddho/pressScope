'use server'

import { auth } from '@clerk/nextjs/server'
import config from '../payload.config'
import { eq, and, sql } from '@payloadcms/db-postgres/drizzle'
import { article_user_votes, article_votes } from '@/payload-generated-schema'
import { WideEventBuilder } from '@/lib/wide-event-builder'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

export async function voteArticle(articleId: number, action: 'like' | 'dislike' | 'remove') {
  const startRequest = Date.now()

  const { userId } = await auth()
  const requestHeaders = await headers()

  const eventBuilder = new WideEventBuilder().setMessage('Server action: vote article').addFields({
    action,
    articleId,
    userAgent: requestHeaders.get('user-agent'),
    ip: requestHeaders.get('x-forwarded-for') ?? requestHeaders.get('x-real-ip'),
  })

  // 🔒 Auth check
  if (!userId) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'unauthorized' }).log()
    throw new Error('Unauthorized')
  }

  // 🧪 Validation
  if (!Number.isInteger(articleId)) {
    eventBuilder.setSeverity('warn').addFields({ outcome: 'invalid_article_id' }).log()
    throw new Error('Invalid article id')
  }

  eventBuilder.addFields({ userId })

  const payload = await getPayload({ config })
  const drizzle = payload.db.drizzle

  const dbStart = Date.now()

  const result = await drizzle.transaction(async (tx) => {
    // 1️⃣ Read previous vote
    const prev = await tx
      .select({ voteType: article_user_votes.voteType })
      .from(article_user_votes)
      .where(
        and(eq(article_user_votes.articleId, articleId), eq(article_user_votes.userId, userId)),
      )
      .limit(1)

    const previousVote = prev[0]?.voteType ?? null
    eventBuilder.addFields({ previousVote })

    // 2️⃣ Compute deltas
    let likesDelta = 0
    let dislikesDelta = 0

    if (previousVote === 'like') likesDelta--
    if (previousVote === 'dislike') dislikesDelta--

    if (action === 'like') likesDelta++
    if (action === 'dislike') dislikesDelta++

    // 3️⃣ Update aggregate counts
    let updatedCounts = { likesCount: 0, dislikesCount: 0 }

    if (likesDelta !== 0 || dislikesDelta !== 0) {
      const rows = await tx
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
        .returning({
          likesCount: article_votes.likesCount,
          dislikesCount: article_votes.dislikesCount,
        })

      updatedCounts = rows[0]
    } else {
      const rows = await tx
        .select({
          likesCount: article_votes.likesCount,
          dislikesCount: article_votes.dislikesCount,
        })
        .from(article_votes)
        .where(eq(article_votes.articleId, articleId))
        .limit(1)

      updatedCounts = rows[0] ?? { likesCount: 0, dislikesCount: 0 }
    }

    // 4️⃣ Update user vote
    if (action === 'remove') {
      await tx
        .delete(article_user_votes)
        .where(
          and(eq(article_user_votes.articleId, articleId), eq(article_user_votes.userId, userId)),
        )
    } else {
      await tx
        .insert(article_user_votes)
        .values({
          articleId,
          userId,
          voteType: action,
        })
        .onConflictDoUpdate({
          target: [article_user_votes.articleId, article_user_votes.userId],
          set: { voteType: action },
        })
    }

    return updatedCounts
  })

  eventBuilder
    .setSeverity('info')
    .addFields({
      outcome: 'success',
      likesCount: result.likesCount,
      dislikesCount: result.dislikesCount,
      totalDurationMs: Date.now() - startRequest,
      dbDurationMs: Date.now() - dbStart,
    })
    .log()

  return {
    success: true,
    likesCount: result.likesCount,
    dislikesCount: result.dislikesCount,
  }
}
