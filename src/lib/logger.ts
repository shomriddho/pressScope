import pino from 'pino'

const token = process.env.BETTERSTACK_SOURCE_TOKEN

const transport = pino.transport({
  target: '@logtail/pino',
  options: {
    sourceToken: token,
    options: { endpoint: 'https://s1694921.eu-nbg-2.betterstackdata.com' },
  },
})
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      service: 'news-portal',
      env: process.env.VERCEL_ENV || process.env.NODE_ENV,
    },
  },
  transport,
)
