import { db } from './db'
import { enrichmentSchema, type Enrichment, type Note, type Category, type Flashcard } from '../domain/schemas'

export const normalize = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('de')
const now = () => new Date().toISOString()

export async function createNote(content: string, source: string): Promise<Note> {
  if (!content.trim()) throw new Error('Bitte schreibe zuerst eine Notiz.')
  const date = now()
  const note: Note = {
    id: crypto.randomUUID(), content, source: source.trim(),
    title: content.trim().replace(/\s+/g, ' ').slice(0, 65) + (content.trim().length > 65 ? '…' : ''),
    summary: '', created_at: date, updated_at: date, ai_status: 'pending',
  }
  const card: Flashcard = {
    id: crypto.randomUUID(), note_id: note.id, question: 'Was ist die wichtigste Erkenntnis aus dieser Notiz?',
    answer: note.content, created_at: date, updated_at: date,
    repetitions: 0, lapses: 0, interval_days: 0, ease_factor: 2.5, review_count: 0,
    last_reviewed_at: null, due_at: null,
  }
  await db.transaction('rw', ['notes', 'flashcards'], async () => {
    await db.notes.add(note)
    await db.flashcards.add(card)
  })
  return note
}

export async function deleteNote(id: string): Promise<void> {
  await db.transaction('rw', ['notes', 'flashcards', 'noteCategories', 'noteTags'], async () => {
    await db.notes.delete(id)
    await db.flashcards.where('note_id').equals(id).delete()
    await db.noteCategories.where('note_id').equals(id).delete()
    await db.noteTags.where('note_id').equals(id).delete()
  })
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const clean = name.trim().replace(/\s+/g, ' ')
  if (!clean) throw new Error('Bitte einen Kategorienamen eingeben.')
  await db.transaction('rw', db.categories, async () => {
    const categories = await db.categories.toArray()
    if (categories.some(c => c.id !== id && normalize(c.name) === normalize(clean))) throw new Error('Diese Kategorie gibt es bereits.')
    await db.categories.update(id, { name: clean })
  })
}

export async function deleteCategory(id: string): Promise<void> {
  await db.transaction('rw', ['categories', 'noteCategories'], async () => {
    await db.noteCategories.where('category_id').equals(id).delete()
    await db.categories.delete(id)
  })
}

export async function saveManual(noteId: string, fields: {
  title: string; summary: string; content: string; source: string; categories: string; tags: string;
  question: string; answer: string
}): Promise<void> {
  if (!fields.title.trim() || !fields.content.trim() || !fields.question.trim() || !fields.answer.trim()) throw new Error('Titel, Inhalt, Frage und Antwort dürfen nicht leer sein.')
  await db.transaction('rw', ['notes', 'flashcards', 'categories', 'tags', 'noteCategories', 'noteTags'], async () => {
    const note = await db.notes.get(noteId)
    const card = await db.flashcards.where('note_id').equals(noteId).first()
    if (!note || !card) throw new Error('Notiz nicht gefunden.')
    await db.notes.update(noteId, { title: fields.title.trim(), summary: fields.summary.trim(), content: fields.content, source: fields.source.trim(), ai_status: 'manual', updated_at: now() })
    await db.flashcards.update(card.id, { question: fields.question.trim(), answer: fields.answer.trim(), updated_at: now() })
    await setLinks(noteId, fields.categories.split(','), fields.tags.split(','))
  })
}

async function setLinks(noteId: string, categoryNames: string[], tagNames: string[], descriptions: Record<string, string> = {}) {
  const categories = await db.categories.toArray()
  const tags = await db.tags.toArray()
  const unique = (names: string[]) => [...new Map(names.map(n => n.trim().replace(/\s+/g, ' ')).filter(Boolean).map(n => [normalize(n), n])).values()]
  const categoryIds: string[] = []
  for (const name of unique(categoryNames)) {
    let existing = categories.find(c => normalize(c.name) === normalize(name))
    if (!existing) {
      existing = { id: crypto.randomUUID(), name, description: descriptions[normalize(name)] || '', created_at: now() }
      await db.categories.add(existing)
      categories.push(existing)
    }
    categoryIds.push(existing.id)
  }
  const tagIds: string[] = []
  for (const name of unique(tagNames)) {
    let existing = tags.find(t => normalize(t.name) === normalize(name))
    if (!existing) {
      existing = { id: crypto.randomUUID(), name }
      await db.tags.add(existing)
      tags.push(existing)
    }
    tagIds.push(existing.id)
  }
  await db.noteCategories.where('note_id').equals(noteId).delete()
  await db.noteTags.where('note_id').equals(noteId).delete()
  await db.noteCategories.bulkAdd(categoryIds.map(category_id => ({ note_id: noteId, category_id })))
  await db.noteTags.bulkAdd(tagIds.map(tag_id => ({ note_id: noteId, tag_id })))
}

/** AI only writes derived fields. Original content/source and review progress are untouched. */
export async function applyEnrichment(noteId: string, raw: unknown, expectedContent?: string): Promise<void> {
  const result: Enrichment = enrichmentSchema.parse(raw)
  await db.transaction('rw', ['notes', 'flashcards', 'categories', 'tags', 'noteCategories', 'noteTags'], async () => {
    const note = await db.notes.get(noteId)
    const card = await db.flashcards.where('note_id').equals(noteId).first()
    if (!note || !card) throw new Error('Notiz nicht gefunden.')
    if (expectedContent !== undefined && (note.content !== expectedContent || note.ai_status !== 'processing')) throw new Error('Die Notiz wurde zwischenzeitlich bearbeitet. Die KI-Antwort wurde nicht übernommen.')
    await db.notes.update(noteId, { title: result.title, summary: result.summary, ai_status: 'completed', updated_at: now() })
    await db.flashcards.update(card.id, { question: result.flashcard.question, answer: result.flashcard.answer, updated_at: now() })
    await setLinks(noteId, result.categories.map(c => c.name), result.tags,
      Object.fromEntries(result.categories.map(c => [normalize(c.name), c.description])))
  })
}

export async function getNoteRelations(noteId: string): Promise<{ categories: Category[]; tags: string[] }> {
  const [links, tagLinks] = await Promise.all([
    db.noteCategories.where('note_id').equals(noteId).toArray(),
    db.noteTags.where('note_id').equals(noteId).toArray(),
  ])
  const [categories, tags] = await Promise.all([
    db.categories.bulkGet(links.map(l => l.category_id)), db.tags.bulkGet(tagLinks.map(l => l.tag_id)),
  ])
  return { categories: categories.filter((c): c is Category => !!c), tags: tags.flatMap(t => t ? [t.name] : []) }
}
