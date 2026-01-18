import { logger } from '@/lib/logger'
import { WideEventBuilder } from '@/lib/wide-event-builder'
import config from '@/payload.config'
import { getPayload } from 'payload'

export const GET = async (request: Request) => {
  const startRequest = Date.now()
  const start = Date.now()
  const payload = await getPayload({ config })

  logger.info(`Payload initialized in ${Date.now() - start}ms`)
  return Response.json({
    message: 'This is an example of a custom route.',
    requestDurationMs: Date.now() - startRequest,
  })
}
