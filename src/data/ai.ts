import { db } from './db'
import { applyEnrichment } from './notes'
import { enrichmentSchema } from '../domain/schemas'

export async function enrichNote(noteId: string): Promise<void> {
  const note = await db.notes.get(noteId)
  if (!note) throw new Error('Notiz nicht gefunden.')
  if (!navigator.onLine) throw new Error('Du bist offline. Deine Notiz bleibt gespeichert; versuche es später erneut.')
  const categories = await db.categories.toArray()
  await db.notes.update(noteId, { ai_status: 'processing' })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 35000)
  try {
    const response = await fetch('/api/ai/enrich-note', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: controller.signal,
      body: JSON.stringify({ content: note.content, categories: categories.map(c => ({ name: c.name, description: c.description })) }),
    })
    const result: unknown = await response.json()
    if (!response.ok) throw new Error(typeof result === 'object' && result !== null && 'error' in result && typeof result.error === 'string' ? result.error : 'KI-Aufbereitung nicht verfügbar.')
    await applyEnrichment(noteId, enrichmentSchema.parse(result), note.content)
  } catch (error) {
    const current = await db.notes.get(noteId)
    if (current?.ai_status === 'processing') await db.notes.update(noteId, { ai_status: 'failed' })
    if (controller.signal.aborted) throw new Error('Die KI hat zu lange gebraucht. Bitte versuche es erneut.')
    throw error instanceof Error ? error : new Error('KI-Aufbereitung fehlgeschlagen.')
  } finally {
    clearTimeout(timer)
  }
}
