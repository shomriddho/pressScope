import pino from 'pino'

const isProd = process.env.NODE_ENV === 'production'
const hasBetterStack = !!process.env.BETTERSTACK_SOURCE_TOKEN

// Transport ONLY for critical logs
const betterStackTransport =
  isProd && hasBetterStack
    ? {
        target: 'pino-http-send',
        options: {
          url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`,
          headers: {
            Authorization: `Bearer ${process.env.BETTERSTACK_SOURCE_TOKEN}`,
          },
        },
        level: 'info', // 👈 ONLY error and above
      }
    : undefined

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',

  base: {
    service: 'pressscope_2',
    env: process.env.VERCEL_ENV || process.env.NODE_ENV,
  },

  transport: betterStackTransport,
})
