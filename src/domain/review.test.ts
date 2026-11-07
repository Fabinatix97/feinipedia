import { describe, expect, it } from 'vitest'
import { isDue, review, sessionCards } from './review'
import type { Flashcard } from './schemas'

const time = new Date('2026-01-01T12:00:00.000Z')
const card = (): Flashcard => ({
  id: crypto.randomUUID(),
  note_id: crypto.randomUUID(),
  question: 'Frage',
  answer: 'Antwort',
  created_at: time.toISOString(),
  updated_at: time.toISOString(),
  repetitions: 0,
  lapses: 0,
  interval_days: 0,
  ease_factor: 2.5,
  review_count: 0,
  last_reviewed_at: null,
  due_at: null,
})

describe('review scheduling', () => {
  it('starts immediately and schedules again in ten minutes', () => {
    const fresh = card()
    expect(isDue(fresh, time)).toBe(false)
    const result = review(fresh, 'again', time)
    expect(result).toMatchObject({ repetitions: 0, lapses: 1, review_count: 1 })
    expect(result.due_at).toBe('2026-01-01T12:10:00.000Z')
    expect(isDue(result, new Date('2026-01-01T12:09:59Z'))).toBe(false)
    expect(isDue(result, new Date('2026-01-01T12:10:00Z'))).toBe(true)
  })
  it('schedules good at one, three, six days and caps at 365', () => {
    const one = review(card(), 'good', time)
    const two = review(one, 'good', time)
    const three = review(two, 'good', time)
    expect([one.interval_days, two.interval_days, three.interval_days]).toEqual([1, 3, 6])
    expect(two.due_at).toBe('2026-01-04T12:00:00.000Z')
    expect(review({ ...three, interval_days: 300 }, 'good', time).interval_days).toBe(365)
  })
  it('hard is at least one day and does not reset progress', () => {
    const hard = review(card(), 'hard', time)
    expect(hard.interval_days).toBe(1)
    expect(hard.repetitions).toBe(1)
    expect(review({ ...hard, interval_days: 5 }, 'hard', time).interval_days).toBe(6)
  })
  it('prioritizes due cards before new cards with a daily limit', () => {
    const due = { ...review(card(), 'again', time), due_at: '2025-12-31T12:00:00.000Z' }
    const later = { ...review(card(), 'again', time), due_at: '2026-01-01T11:00:00.000Z' }
    const fresh = card()
    expect(sessionCards([fresh, later, due], 1, 0, time).map((c) => c.id)).toEqual([
      due.id,
      later.id,
      fresh.id,
    ])
    expect(sessionCards([fresh, later, due], 1, 1, time).length).toBe(2)
  })
})
