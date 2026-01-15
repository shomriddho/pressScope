// /src/lib/wide-event-builder.ts
import { logger } from './logger'

type Severity = 'info' | 'warn' | 'error' | 'debug'

export class WideEventBuilder {
  private event: Record<string, any> = {}
  private severity: Severity = 'info'
  private message: string = ''

  constructor(message?: string) {
    if (message) this.message = message
    // automatically add timestamp
    this.event.timestamp = new Date().toISOString()
  }

  setMessage(message: string) {
    this.message = message
    return this
  }

  setSeverity(severity: Severity) {
    this.severity = severity
    return this
  }

  addField(key: string, value: any) {
    this.event[key] = value
    return this
  }

  addFields(fields: Record<string, any>) {
    this.event = { ...this.event, ...fields }
    return this
  }

  log() {
    if (!this.message) throw new Error('WideEventBuilder: message is required')

    switch (this.severity) {
      case 'info':
        logger.info(this.event, this.message)
        break
      case 'warn':
        logger.warn(this.event, this.message)
        break
      case 'error':
        logger.error(this.event, this.message)
        break
      case 'debug':
        logger.debug(this.event, this.message)
        break
    }
  }
}
