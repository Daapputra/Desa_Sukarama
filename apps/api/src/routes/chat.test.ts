import Fastify from 'fastify'
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { chatRoutes } from './chat.js'

// These tests avoid calling the real OpenRouter API (no network, no cost) by
// exercising only the validation/config paths that don't require a live key.
describe('POST /api/chat', () => {
  const app = Fastify()
  const originalKey = process.env.OPENROUTER_API_KEY

  beforeAll(async () => {
    await app.register(chatRoutes)
    await app.ready()
  })

  afterAll(async () => {
    process.env.OPENROUTER_API_KEY = originalKey
    await app.close()
  })

  beforeEach(() => {
    delete process.env.OPENROUTER_API_KEY
  })

  it('returns 503 when OPENROUTER_API_KEY is not configured', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: 'Halo' },
    })

    expect(res.statusCode).toBe(503)
  })

  it('returns 400 for an empty message', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: '   ' },
    })

    expect(res.statusCode).toBe(400)
  })

  it('returns 400 for a message over the length limit', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const res = await app.inject({
      method: 'POST',
      url: '/api/chat',
      payload: { message: 'a'.repeat(1001) },
    })

    expect(res.statusCode).toBe(400)
  })
})
