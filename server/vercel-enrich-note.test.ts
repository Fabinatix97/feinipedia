import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../api/ai/enrich-note'

const url = 'https://example.com/api/ai/enrich-note'
const request = (body: string, contentType = 'application/json') =>
  new Request(url, { method: 'POST', headers: { 'Content-Type': contentType }, body })

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('Vercel AI function', () => {
  it('only accepts small JSON POST requests', async () => {
    const calls = vi.fn()
    vi.stubGlobal('fetch', calls)

    expect((await handler.fetch(new Request(url))).status).toBe(405)
    expect((await handler.fetch(request('{}', 'text/plain'))).status).toBe(415)
    expect((await handler.fetch(request('{'))).status).toBe(400)
    expect(
      (await handler.fetch(request(JSON.stringify({ content: 'x'.repeat(31000) })))).status,
    ).toBe(413)
    expect(calls).not.toHaveBeenCalled()
  })

  it('validates input and requires a server-side API key before calling OpenAI', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')
    const calls = vi.fn()
    vi.stubGlobal('fetch', calls)

    expect((await handler.fetch(request('{}'))).status).toBe(400)
    const response = await handler.fetch(
      request(JSON.stringify({ content: 'Notiz', categories: [] })),
    )
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(calls).not.toHaveBeenCalled()
  })

  it('returns a validated enrichment from OpenAI', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key')
    const enrichment = {
      title: 'Hunde',
      categories: [],
      tags: ['Hund'],
      flashcard: { question: 'Was?', answer: 'Hund.' },
    }
    const calls = vi
      .fn()
      .mockResolvedValue(
        Response.json({ choices: [{ message: { content: JSON.stringify(enrichment) } }] }),
      )
    vi.stubGlobal('fetch', calls)

    const response = await handler.fetch(
      request(JSON.stringify({ content: 'Notiz', categories: [] })),
    )
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual(enrichment)
    expect(calls).toHaveBeenCalledOnce()
    expect(calls.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key')
  })
})
