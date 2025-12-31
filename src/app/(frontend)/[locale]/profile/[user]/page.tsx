import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const users = await payload.find({
    collection: 'app-users',
    limit: 1000,
  })

  const locales = ['en', 'bn']
  const params: { locale: string; user: string }[] = []

  for (const locale of locales) {
    for (const user of users.docs) {
      params.push({ locale, user: user.id })
    }
  }

  return params
}

export default async function ProfilePage({
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

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center space-x-4">
        {userData.imageUrl && (
          <img src={userData.imageUrl} alt="Profile" className="w-32 h-32 rounded-full" />
        )}
        <div>
          <h1 className="text-4xl font-black">{userData.username || 'User'}</h1>
          <p className="text-lg">{userData.email}</p>
        </div>
      </div>
      <hr className="my-4 w-full" />
    </div>
  )
}
