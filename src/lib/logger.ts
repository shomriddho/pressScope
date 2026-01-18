import pino from 'pino'
import path from 'path'
const logPath = path.join(process.cwd(), 'logs', 'app.log')
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  // pino.destination(logPath),
)
