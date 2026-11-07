import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PawDatabase } from './db'
import { createNote, applyEnrichment, deleteNote, deleteCategory, getNoteRelations, saveManual } from './notes'
import { exportBackup, importBackup, validateBackup } from './backup'
import { db } from './db'

beforeEach(async () => { await db.open() })
afterEach(async () => { await db.delete() })

describe('local data integrity', () => {
  it('creates one usable card and deletes it with its note', async () => {
    const note = await createNote('  Ein Hund lernt in kleinen Schritten.\n', 'Buch')
    expect((await db.notes.get(note.id))?.content).toBe('  Ein Hund lernt in kleinen Schritten.\n')
    const cards = await db.flashcards.toArray()
    expect(cards).toHaveLength(1)
    expect(cards[0].note_id).toBe(note.id)
    expect(cards[0].answer).toBe(note.content)
    await deleteNote(note.id)
    expect(await db.flashcards.count()).toBe(0)
    expect(await db.notes.count()).toBe(0)
  })
  it('reuses categories and does not overwrite original content or review count', async () => {
    const first = await createNote('Originaleins', '')
    const second = await createNote('Originalzwei', '')
    const result = { title: 'Lernen', summary: '', categories: [{ name: 'Erziehung', description: '' }], tags: ['Alltag'], flashcard: { question: 'Wie?', answer: 'So.' } }
    await applyEnrichment(first.id, result)
    await db.flashcards.where('note_id').equals(first.id).modify({ review_count: 4 })
    await applyEnrichment(second.id, { ...result, categories: [{ name: ' erziehung ', description: '' }], tags: ['alltag'] })
    expect(await db.categories.count()).toBe(1)
    expect(await db.tags.count()).toBe(1)
    expect((await getNoteRelations(second.id)).categories[0].name).toBe('Erziehung')
    expect((await db.notes.get(first.id))?.content).toBe('Originaleins')
    expect((await db.flashcards.where('note_id').equals(first.id).first())?.review_count).toBe(4)
    await expect(applyEnrichment(first.id, { title: '' })).rejects.toThrow()
    expect((await db.notes.get(first.id))?.title).toBe('Lernen')
  })
  it('allows manual edits without resetting learning and removes only category links', async () => {
    const note = await createNote('Original', '')
    const card = (await db.flashcards.where('note_id').equals(note.id).first())!
    await db.flashcards.update(card.id, { review_count: 3, repetitions: 2, due_at: '2026-01-02T10:00:00.000Z' })
    await saveManual(note.id, { title: 'Meine Notiz', summary: 'Kurz', content: 'Original', source: 'Buch', categories: 'Erziehung, Welpen', tags: 'Lernen, Alltag', question: 'Frage?', answer: 'Antwort.' })
    const updated = (await db.flashcards.get(card.id))!
    expect(updated).toMatchObject({ question: 'Frage?', answer: 'Antwort.', review_count: 3, repetitions: 2, due_at: '2026-01-02T10:00:00.000Z' })
    const categories = await db.categories.toArray()
    await deleteCategory(categories[0].id)
    expect(await db.notes.get(note.id)).toBeDefined()
    expect(await db.noteCategories.where('note_id').equals(note.id).count()).toBe(1)
    expect(await db.noteTags.where('note_id').equals(note.id).count()).toBe(2)
  })
  it('roundtrips all records and rejects broken references without changing data', async () => {
    const note = await createNote('Ein Gedanke', 'Podcast')
    await applyEnrichment(note.id, { title: 'Gedanke', summary: 'Kurz', categories: [{ name: 'Alltag', description: '' }], tags: ['Hund'], flashcard: { question: 'Was?', answer: 'Ein Gedanke' } })
    const backup = await exportBackup()
    expect(validateBackup(backup)).toEqual(backup)
    const target = new PawDatabase(`test-${crypto.randomUUID()}`)
    try {
      await importBackup(backup, target)
      expect(await exportBackup(target)).toEqual({ ...backup, exported_at: expect.any(String) })
      await expect(importBackup({ ...backup, noteCategories: [{ note_id: note.id, category_id: crypto.randomUUID() }] }, target)).rejects.toThrow()
      expect(await target.notes.count()).toBe(1)
      expect(await target.noteCategories.count()).toBe(1)
      await expect(importBackup({ ...backup, flashcards: [] }, target)).rejects.toThrow()
      expect(await target.flashcards.count()).toBe(1)
    } finally { await target.delete() }
  })
})
