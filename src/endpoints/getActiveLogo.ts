import type { Endpoint } from 'payload'

export const getActiveLogo: Endpoint = {
  path: '/active-logo',
  method: 'get',
  handler: async (req) => {
    try {
      const logos = await req.payload.find({
        collection: 'logos',
        where: { active: { equals: true } },
        limit: 1,
      })

      if (!logos.docs.length) {
        return Response.json({ error: 'No active logo' }, { status: 404 })
      }

      const logo = logos.docs[0]

      const sizes = ['small', 'medium', 'large']
      const result: any = { name: logo.name }

      for (const size of sizes) {
        const lightKey = `${size}LogoLight`
        const darkKey = `${size}LogoDark`

        const lightMedia = (logo as any)[lightKey]
        if (lightMedia && lightMedia.url) {
          result[`${size}Light`] = lightMedia.url
        }

        const darkMedia = (logo as any)[darkKey]
        if (darkMedia && darkMedia.url) {
          result[`${size}Dark`] = darkMedia.url
        }
      }

      return Response.json(result)
    } catch (error) {
      console.error('Error in getActiveLogo:', error)
      return Response.json({ error: 'Internal server error' }, { status: 500 })
    }
  },
}
