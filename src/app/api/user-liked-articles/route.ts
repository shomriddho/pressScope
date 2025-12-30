import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')

    if (!userId || !type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
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

    // Find reactions
    const reactions = await payload.find({
      collection: 'article-reactions',
      where: {
        user: { equals: appUser.id },
        type: { equals: type },
      },
      depth: 1, // Populate article
      limit: 100, // Reasonable limit
    })

    const articles = reactions.docs.map((reaction) => reaction.article).filter(Boolean)

    return NextResponse.json(articles)
  } catch (error) {
    console.error('Error fetching liked articles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
