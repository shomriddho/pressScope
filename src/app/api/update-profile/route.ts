import { auth, clerkClient } from '@clerk/nextjs/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, username } = await request.json()

  if (id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await getPayload({ config })

  try {
    await payload.update({
      collection: 'app-users',
      id,
      data: { username },
      user: { id: userId },
      overrideAccess: false,
    })

    // Sync to Clerk
    const clerk = await clerkClient()
    await clerk.users.updateUser(userId, { username })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
