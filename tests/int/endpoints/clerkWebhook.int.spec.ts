import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { clerkWebhook } from '../../../src/endpoints/clerkWebhook'

// Mock svix
vi.mock('svix', () => ({
  Webhook: vi.fn(),
}))

import { Webhook } from 'svix'

describe('clerkWebhook', () => {
  const mockWebhookInstance = {
    verify: vi.fn(),
  }
  const mockWebhook = vi.mocked(Webhook)
  const mockPayload = {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  }

  const originalSecret = process.env.CLERK_WEBHOOK_SECRET

  beforeEach(() => {
    vi.clearAllMocks()
    mockWebhook.mockReturnValue(mockWebhookInstance as any)
    process.env.CLERK_WEBHOOK_SECRET = 'test-secret'
  })

  afterEach(() => {
    process.env.CLERK_WEBHOOK_SECRET = originalSecret
  })

  const svixHeaders = {
    'svix-id': 'test-id',
    'svix-timestamp': '1234567890',
    'svix-signature': 'test-sig',
  }

  const createMockReq = (body: string, headers: Record<string, string> = {}) =>
    ({
      url: 'http://localhost:3000/api/clerk-webhook',
      payload: mockPayload,
      headers: new Headers(headers),
      text: () => Promise.resolve(body),
    }) as any

  it('should create user on user.created event', async () => {
    const eventData = {
      id: 'user_123',
      username: 'testuser',
      email_addresses: [{ id: 'email_1', email_address: 'test@example.com' }],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.created',
      data: eventData,
    })

    const req = createMockReq('{}', {
      'svix-id': 'test-id',
      'svix-timestamp': '1234567890',
      'svix-signature': 'test-sig',
    })

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200) // Success
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'app-users',
      data: {
        id: 'user_123',
        username: 'testuser',
        email: 'test@example.com',
      },
    })
  })

  it('should create user without username if null', async () => {
    const eventData = {
      id: 'user_123',
      username: null,
      email_addresses: [{ id: 'email_1', email_address: 'test@example.com' }],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.created',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.create).toHaveBeenCalledWith({
      collection: 'app-users',
      data: {
        id: 'user_123',
        email: 'test@example.com',
      },
    })
  })

  it('should update user on user.updated event', async () => {
    const eventData = {
      id: 'user_123',
      username: 'updateduser',
      email_addresses: [{ id: 'email_1', email_address: 'updated@example.com' }],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.updated',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.update).toHaveBeenCalledWith({
      collection: 'app-users',
      where: { id: { equals: 'user_123' } },
      data: {
        username: 'updateduser',
        email: 'updated@example.com',
      },
    })
  })

  it('should update user without username if null', async () => {
    const eventData = {
      id: 'user_123',
      username: null,
      email_addresses: [{ id: 'email_1', email_address: 'updated@example.com' }],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.updated',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.update).toHaveBeenCalledWith({
      collection: 'app-users',
      where: { id: { equals: 'user_123' } },
      data: {
        email: 'updated@example.com',
      },
    })
  })

  it('should delete user on user.deleted event', async () => {
    const eventData = {
      id: 'user_123',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.deleted',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.delete).toHaveBeenCalledWith({
      collection: 'app-users',
      where: { id: { equals: 'user_123' } },
    })
  })

  it('should return error for missing webhook secret', async () => {
    delete process.env.CLERK_WEBHOOK_SECRET

    const req = createMockReq('{}', svixHeaders)

    await expect(clerkWebhook.handler(req)).rejects.toThrow('CLERK_WEBHOOK_SECRET not set')
  })

  it('should return error for missing svix headers', async () => {
    const req = createMockReq('{}')

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({ error: 'Missing svix headers' })
  })

  it('should return error for invalid signature', async () => {
    mockWebhookInstance.verify.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({ error: 'Webhook verification failed' })
  })

  it('should return error for missing primary email', async () => {
    const eventData = {
      id: 'user_123',
      username: 'testuser',
      email_addresses: [],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.created',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(400)
    expect(result).toEqual({ error: 'No primary email' })
  })

  it('should handle unhandled event types', async () => {
    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.signed_in',
      data: {},
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(result).toEqual({ success: true })
    expect(mockWebhookInstance.verify).toHaveBeenCalledWith('{}', svixHeaders)
    expect(mockPayload.create).not.toHaveBeenCalled()
    expect(mockPayload.update).not.toHaveBeenCalled()
    expect(mockPayload.delete).not.toHaveBeenCalled()
  })

  it('should return error for unexpected internal error', async () => {
    mockPayload.create.mockRejectedValue(new Error('Database connection failed'))

    const eventData = {
      id: 'user_123',
      username: 'testuser',
      email_addresses: [{ id: 'email_1', email_address: 'test@example.com' }],
      primary_email_address_id: 'email_1',
    }

    mockWebhookInstance.verify.mockReturnValue({
      type: 'user.created',
      data: eventData,
    })

    const req = createMockReq('{}', svixHeaders)

    const response = await clerkWebhook.handler(req)
    const result = await response.json()

    expect(response.status).toBe(500)
    expect(result).toEqual({ error: 'Failed to create user' })
  })
})
