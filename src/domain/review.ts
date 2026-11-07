import type { Flashcard } from './schemas'

export type Rating = 'again' | 'hard' | 'good'
const DAY = 86_400_000

/** UTC instants; display conversion belongs in the UI. */
export function review(card: Flashcard, rating: Rating, now = new Date()): Flashcard {
  const repetitions = rating === 'again' ? 0 : card.repetitions + 1
  const interval = rating === 'again' ? 10 / 1440
    : rating === 'hard' ? Math.min(365, Math.max(1, card.interval_days * 1.2))
      : repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.min(365, card.interval_days * 2)
  return {
    ...card, repetitions, interval_days: interval,
    lapses: card.lapses + (rating === 'again' ? 1 : 0),
    review_count: card.review_count + 1,
    last_reviewed_at: now.toISOString(), due_at: new Date(now.getTime() + interval * DAY).toISOString(),
  }
}

export function isDue(card: Flashcard, now = new Date()): boolean {
  return card.review_count > 0 && (!card.due_at || new Date(card.due_at).getTime() <= now.getTime())
}

/** New cards are last; reviewed cards are ordered by due time. */
export function sessionCards(cards: Flashcard[], dailyLimit: number, newToday = 0, now = new Date()): Flashcard[] {
  const due = cards.filter(c => isDue(c, now)).sort((a, b) => (a.due_at || '').localeCompare(b.due_at || ''))
  const fresh = cards.filter(c => c.review_count === 0).sort((a, b) => a.created_at.localeCompare(b.created_at))
  return [...due, ...fresh.slice(0, Math.max(0, dailyLimit - newToday))]
}
