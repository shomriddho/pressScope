import pino from 'pino'

const token = process.env.BETTERSTACK_SOURCE_TOKEN

const betterStackTransport =
  process.env.NODE_ENV === 'production' && token
    ? pino.transport({
        target: '@logtail/pino',
        options: {
          sourceToken: token,
          options: {
            // default Better Stack ingest host
            endpoint: 'https://s1694921.eu-nbg-2.betterstackdata.com',
          },
        },
        level: 'info', // 👈 VERY IMPORTANT
      })
    : undefined

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: 'news-portal',
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
    },
  },
  betterStackTransport,
)
