import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { id } = params

  try {
    const body = await request.json()
    const { action } = body as { action: 'like' | 'dislike' | 'remove' }

    const payload = await getPayload({ config })

    // Get current article
    const article = await payload.findByID({
      collection: 'articles',
      id,
      depth: 0,
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    let newLikes = (article.likes || []).map((l) => l.userId)
    let newDislikes = (article.dislikes || []).map((d) => d.userId)

    if (action === 'like') {
      if (!newLikes.includes(userId)) {
        newLikes.push(userId)
      }
      newDislikes = newDislikes.filter((id) => id !== userId)
    } else if (action === 'dislike') {
      if (!newDislikes.includes(userId)) {
        newDislikes.push(userId)
      }
      newLikes = newLikes.filter((id) => id !== userId)
    } else if (action === 'remove') {
      newLikes = newLikes.filter((id) => id !== userId)
      newDislikes = newDislikes.filter((id) => id !== userId)
    }

    // Update article
    await payload.update({
      collection: 'articles',
      id,
      data: {
        likes: newLikes.map((id) => ({ userId: id })),
        dislikes: newDislikes.map((id) => ({ userId: id })),
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      likesCount: newLikes.length,
      dislikesCount: newDislikes.length,
    })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
