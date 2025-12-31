import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { eq } from '@payloadcms/db-postgres/drizzle'
import { article_votes } from '@/payload-generated-schema'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const payload = await getPayload({ config })
    const drizzle = payload.db.drizzle

    const articleIdNum = parseInt(id)

    const votes = await drizzle
      .select()
      .from(article_votes)
      .where(eq(article_votes.articleId, articleIdNum))
      .limit(1)

    if (votes.length === 0) {
      return NextResponse.json({ likesCount: 0, dislikesCount: 0 })
    }

    return NextResponse.json({
      likesCount: votes[0].likesCount,
      dislikesCount: votes[0].dislikesCount,
    })
  } catch (error) {
    console.error('Fetch votes error:', error)
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 })
  }
}
