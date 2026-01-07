import type { Endpoint } from 'payload'
import { z } from 'zod'
import { endpointLogger, WideEvent, generateRequestId } from '@/lib/logger'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(1, 'Message is required'),
  userId: z.string().optional(),
})

export const submitContact: Endpoint = {
  path: '/submit-contact',
  method: 'post',
  handler: async (req) => {
    const startTime = Date.now()
    const requestId = generateRequestId()

    const wideEvent = new WideEvent('contact-endpoint', requestId).setRequest(
      'POST',
      '/submit-contact',
      Object.fromEntries(req.headers.entries()),
    )

    const payload = req.payload

    try {
      const body = await (req as Request).json()
      const validatedData = contactSchema.parse(body)

      wideEvent.setBusinessData({
        email: validatedData.email,
        hasUserId: !!validatedData.userId,
        messageLength: validatedData.message.length,
      })

      // If userId provided, find the app-user
      let user = undefined
      let appUserQuery = null
      if (validatedData.userId) {
        const appUser = await payload.find({
          collection: 'app-users',
          where: { id: { equals: validatedData.userId } },
          limit: 1,
        })
        appUserQuery = { collection: 'app-users', conditions: { id: validatedData.userId } }

        if (appUser.docs.length > 0) {
          user = appUser.docs[0].id
          wideEvent.setBusinessData({
            userId: validatedData.userId,
            appUserId: user,
            appUserFound: true,
          })
        } else {
          wideEvent.setBusinessData({
            userId: validatedData.userId,
            appUserFound: false,
          })
        }
      }

      // Create the contact message
      const message = await payload.create({
        collection: 'contact-messages',
        data: {
          name: validatedData.name,
          email: validatedData.email,
          message: validatedData.message,
          user,
        },
      })

      wideEvent
        .setBusinessData({
          messageId: message.id,
          contactData: {
            name: validatedData.name,
            email: validatedData.email,
            user,
          },
        })
        .setDatabase('create', {
          collection: 'contact-messages',
          data: {
            name: validatedData.name,
            email: validatedData.email,
            message: validatedData.message,
            user,
          },
        })
        .setOutcome('ok', 200, 'Contact message created successfully', Date.now() - startTime)
        .emit(endpointLogger)

      return Response.json({ success: true, id: message.id })
    } catch (error) {
      wideEvent
        .setError(error)
        .setOutcome('error', 400, 'Contact submission failed', Date.now() - startTime)
        .emit(endpointLogger)

      return Response.json({ error: 'Failed to submit contact' }, { status: 400 })
    }
  },
}
