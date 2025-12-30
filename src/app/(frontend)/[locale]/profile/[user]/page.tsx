import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsHighlight,
  TabsHighlightItem,
  TabsList,
  TabsTrigger,
} from '@/components/animate-ui/primitives/animate/tabs'
import GeneralTabClient from './GeneralTabClient'
import LikedArticles from '../../../../../components/LikedArticles'

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
  const { locale, user: userId } = await params

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
      userData = {
        id: clerkUser.id,
        username: clerkUser.username,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        imageUrl: clerkUser.imageUrl,
      }
    } catch (clerkError) {
      console.error('Error fetching user from Clerk:', clerkError)
      notFound()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center space-x-4">
        {userData.imageUrl && (
          <img src={userData.imageUrl} alt="Profile" className="w-16 h-16 rounded-full" />
        )}
        <div>
          <h1 className="text-2xl font-bold">{userData.username || 'User'}</h1>
          <p className="text-gray-600">{userData.email}</p>
        </div>
      </div>
      <hr className="my-4 w-full" />
      <Tabs className="w-full" defaultValue="general">
        <TabsHighlight className="bg-background absolute z-0 inset-0">
          <TabsList className="h-10 inline-flex p-1 bg-accent w-full">
            <TabsHighlightItem value="general" className="flex-1">
              <TabsTrigger value="general" className="h-full px-4 py-2 leading-0 w-full text-sm">
                General
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="comments" className="flex-1">
              <TabsTrigger value="comments" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Comments
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="likes" className="flex-1">
              <TabsTrigger value="likes" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Likes
              </TabsTrigger>
            </TabsHighlightItem>
            <TabsHighlightItem value="dislikes" className="flex-1">
              <TabsTrigger value="dislikes" className="h-full px-4 py-2 leading-0 w-full text-sm">
                Dislikes
              </TabsTrigger>
            </TabsHighlightItem>
          </TabsList>
        </TabsHighlight>
        <TabsContents className="bg-background p-3 border-4 border-accent border-t-0">
          <TabsContent value="general" className="space-y-4">
            <GeneralTabClient initialUserData={userData} />
          </TabsContent>
          <TabsContent value="comments" className="space-y-4">
            <p className="text-sm text-muted-foreground">Comments will be displayed here.</p>
          </TabsContent>
          <TabsContent value="likes" className="space-y-4">
            <LikedArticles userId={userId} type="like" />
          </TabsContent>
          <TabsContent value="dislikes" className="space-y-4">
            <LikedArticles userId={userId} type="dislike" />
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}
