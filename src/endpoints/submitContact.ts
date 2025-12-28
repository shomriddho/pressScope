import type { Endpoint } from 'payload'
import { z } from 'zod'

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
    const payload = req.payload

    try {
      const body = await (req as Request).json()
      const validatedData = contactSchema.parse(body)

      // If userId provided, find the app-user
      let user = undefined
      if (validatedData.userId) {
        const appUser = await payload.find({
          collection: 'app-users',
          where: { id: { equals: validatedData.userId } },
          limit: 1,
        })
        if (appUser.docs.length > 0) {
          user = appUser.docs[0].id
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

      return Response.json({ success: true, id: message.id })
    } catch (error) {
      console.error('Contact submission error:', error)
      return Response.json({ error: 'Failed to submit contact' }, { status: 400 })
    }
  },
}
