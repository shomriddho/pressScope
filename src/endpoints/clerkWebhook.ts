import type { Endpoint } from 'payload'
import { Webhook } from 'svix'

interface ClerkUserEventData {
  id: string
  username: string | null
  email_addresses: Array<{ id: string; email_address: string }>
  primary_email_address_id: string
  image_url: string | null
}

export const clerkWebhook: Endpoint = {
  path: '/clerk-webhook',
  method: 'post',
  handler: async (req) => {
    console.log('Webhook received:', req.url)

    const payload = req.payload

    // Get the webhook secret from env
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not set')
      throw new Error('CLERK_WEBHOOK_SECRET not set')
    }

    // Get headers
    const svixId = (req as Request).headers.get('svix-id')
    const svixTimestamp = (req as Request).headers.get('svix-timestamp')
    const svixSignature = (req as Request).headers.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return Response.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    // Get body
    const body = await (req as Request).text()

    // Verify webhook
    const wh = new Webhook(webhookSecret)
    let evt: { type: string; data: ClerkUserEventData }

    try {
      evt = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as { type: string; data: ClerkUserEventData }
    } catch (err) {
      console.error('Webhook verification failed', err)
      return Response.json({ error: 'Webhook verification failed' }, { status: 400 })
    }

    // Handle the event
    if (evt.type === 'user.created') {
      const { id, username, email_addresses, primary_email_address_id, image_url } = evt.data

      // Get primary email
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id,
      )?.email_address

      if (!primaryEmail) {
        console.error('No primary email found')
        return Response.json({ error: 'No primary email' }, { status: 400 })
      }

      // Create app-user
      const createData: { id: string; email: string; username?: string; imageUrl?: string } = {
        id,
        email: primaryEmail,
      }
      if (username !== null) {
        createData.username = username
      }
      if (image_url !== null) {
        createData.imageUrl = image_url
      }

      try {
        await payload.create({
          collection: 'app-users',
          data: createData,
          draft: false,
        })
      } catch (error) {
        console.error('Failed to create app-user', error)
        return Response.json({ error: 'Failed to create user' }, { status: 500 })
      }
    } else if (evt.type === 'user.deleted') {
      const { id } = evt.data

      try {
        await payload.delete({
          collection: 'app-users',
          where: { id: { equals: id } },
        })
      } catch (error) {
        console.error('Failed to delete app-user', error)
        return Response.json({ error: 'Failed to delete user' }, { status: 500 })
      }
    } else if (evt.type === 'user.updated') {
      const { id, username, email_addresses, primary_email_address_id, image_url } = evt.data

      // Get primary email
      const primaryEmail = email_addresses.find(
        (email) => email.id === primary_email_address_id,
      )?.email_address

      if (!primaryEmail) {
        console.error('No primary email found')
        return Response.json({ error: 'No primary email' }, { status: 400 })
      }

      // Update app-user
      const updateData: { email: string; username?: string; imageUrl?: string } = {
        email: primaryEmail,
      }
      if (username !== null) {
        updateData.username = username
      }
      if (image_url !== null) {
        updateData.imageUrl = image_url
      }

      try {
        await payload.update({
          collection: 'app-users',
          where: { id: { equals: id } },
          data: updateData,
        })
      } catch (error) {
        console.error('Failed to update app-user', error)
        return Response.json({ error: 'Failed to update user' }, { status: 500 })
      }
    } else {
      console.log(`Unhandled event type: ${evt.type}`)
    }

    return Response.json({ success: true })
  },
}
