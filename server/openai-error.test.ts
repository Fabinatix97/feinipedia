import { describe, expect, it } from 'vitest'
import { openAIError } from './openai-error.js'

describe('OpenAI errors', () => {
  it('names common actionable failures without leaking upstream details', () => {
    expect(openAIError(400).error).toContain('Modell')
    expect(openAIError(401).error).toContain('API-Key')
    expect(openAIError(404).error).toContain('OPENAI_MODEL')
    expect(openAIError(429, 'insufficient_quota').error).toContain('Guthaben')
    expect(openAIError(503).error).toContain('503')
  })
})
