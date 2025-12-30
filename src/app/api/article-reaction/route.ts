import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const articleIdStr = searchParams.get('articleId')
    const articleId = articleIdStr ? parseInt(articleIdStr, 10) : null

    if (!articleId || isNaN(articleId)) {
      return NextResponse.json({ error: 'Valid Article ID required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find app user
    const appUsers = await payload.find({
      collection: 'app-users',
      where: { id: { equals: userId } },
      limit: 1,
    })

    if (!appUsers.docs.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const appUser = appUsers.docs[0]

    // Get counts
    const likes = await payload.find({
      collection: 'article-reactions',
      where: {
        article: { equals: articleId },
        type: { equals: 'like' },
      },
      limit: 0,
    })

    const dislikes = await payload.find({
      collection: 'article-reactions',
      where: {
        article: { equals: articleId },
        type: { equals: 'dislike' },
      },
      limit: 0,
    })

    // Get user's reaction
    const userReaction = await payload.find({
      collection: 'article-reactions',
      where: {
        user: { equals: appUser.id },
        article: { equals: articleId },
      },
      limit: 1,
    })

    return NextResponse.json({
      likeCount: likes.totalDocs,
      dislikeCount: dislikes.totalDocs,
      userReaction: userReaction.docs.length ? userReaction.docs[0].type : null,
    })
  } catch (error) {
    console.error('Error fetching article reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { articleId: articleIdStr, type } = body
    const articleId =
      typeof articleIdStr === 'string'
        ? parseInt(articleIdStr, 10)
        : typeof articleIdStr === 'number'
          ? articleIdStr
          : null

    if (!articleId || isNaN(articleId) || !type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Find app user
    const appUsers = await payload.find({
      collection: 'app-users',
      where: { id: { equals: userId } },
      limit: 1,
    })

    if (!appUsers.docs.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const appUser = appUsers.docs[0]

    // Check if reaction exists
    const existingReaction = await payload.find({
      collection: 'article-reactions',
      where: {
        user: { equals: appUser.id },
        article: { equals: articleId },
      },
      limit: 1,
    })

    if (existingReaction.docs.length) {
      const reaction = existingReaction.docs[0]
      if (reaction.type === type) {
        // Remove reaction
        await payload.delete({
          collection: 'article-reactions',
          id: reaction.id,
        })
      } else {
        // Update reaction
        await payload.update({
          collection: 'article-reactions',
          id: reaction.id,
          data: { type },
        })
      }
    } else {
      // Create reaction
      await payload.create({
        collection: 'article-reactions',
        data: {
          user: appUser.id,
          article: articleId,
          type,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating article reaction:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
