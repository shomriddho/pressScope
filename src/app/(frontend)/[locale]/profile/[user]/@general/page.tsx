import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'
import GeneralTabClient from '../GeneralTabClient'

export default async function GeneralPage({
  params,
}: {
  params: Promise<{ locale: string; user: string }>
}) {
  const { user: userId } = await params

  const payload = await getPayload({ config })
  let userData

  try {
    userData = await payload.findByID({
      collection: 'app-users',
      id: userId,
    })
  } catch (error) {
    // User not found in Payload, try to fetch from Clerk
    try {
      const clerk = await clerkClient()
      const clerkUser = await clerk.users.getUser(userId)

      // Create user in AppUsers
      userData = await payload.create({
        collection: 'app-users',
        data: {
          id: clerkUser.id,
          username: clerkUser.username,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          imageUrl: clerkUser.imageUrl,
        },
      })
    } catch (clerkError) {
      console.error('Error fetching user from Clerk:', clerkError)
      notFound()
    }
  }

  return <GeneralTabClient initialUserData={userData} />
}
