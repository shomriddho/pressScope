import pino from 'pino'
import { randomUUID } from 'crypto'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label }
    },
  },
})

// Create child loggers for different contexts
export const createLogger = (context: string) => logger.child({ context })

// Specific loggers for different parts of the app
export const middlewareLogger = createLogger('middleware')
export const apiLogger = createLogger('api')
export const endpointLogger = createLogger('endpoint')
export const collectionLogger = createLogger('collection')
export const authLogger = createLogger('auth')

// Generate request ID for correlation
export const generateRequestId = () => randomUUID()

// Wide event builder
export class WideEvent {
  private event: Record<string, any> = {}

  constructor(service: string, requestId?: string) {
    this.event.service = service
    this.event.requestId = requestId || generateRequestId()
    this.event.timestamp = new Date().toISOString()
    this.event.commit_hash = process.env.COMMIT_HASH || 'unknown'
  }

  setRequest(method: string, path: string, headers?: Record<string, string>) {
    this.event.method = method
    this.event.path = path
    if (headers) {
      this.event.headers = this.sanitizeHeaders(headers)
    }
    return this
  }

  setUser(user: any) {
    if (user) {
      this.event.user = {
        id: user.id,
        email: user.email,
        // Add other user fields as needed
      }
    }
    return this
  }

  setBusinessData(data: Record<string, any>) {
    this.event.business = { ...this.event.business, ...data }
    return this
  }

  setDatabase(operation: string, details?: any) {
    this.event.db = {
      operation,
      ...details,
    }
    return this
  }

  setCache(operation: string, details?: any) {
    this.event.cache = {
      operation,
      ...details,
    }
    return this
  }

  setOutcome(outcome: 'ok' | 'error', statusCode?: number, message?: string, duration?: number) {
    this.event.outcome = outcome
    if (statusCode) this.event.status_code = statusCode
    if (message) this.event.message = message
    if (duration) this.event.duration = duration
    return this
  }

  setError(error: any) {
    this.event.error = {
      message: error.message,
      stack: error.stack,
      name: error.name,
    }
    return this
  }

  addMetadata(metadata: Record<string, any>) {
    this.event.metadata = { ...this.event.metadata, ...metadata }
    return this
  }

  private sanitizeHeaders(headers: Record<string, string>) {
    const sanitized: Record<string, string> = {}
    const sensitive = ['authorization', 'cookie', 'x-api-key', 'x-auth-token']

    for (const [key, value] of Object.entries(headers)) {
      if (sensitive.includes(key.toLowerCase())) {
        sanitized[key] = '***'
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }

  emit(logger: pino.Logger, level: 'info' | 'error' | 'warn' | 'debug' = 'info') {
    logger[level](this.event)
  }
}
