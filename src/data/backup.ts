import { db, type PawDatabase } from './db'
import { backupSchema, noteSchema, type Backup } from '../domain/schemas'
import { normalize } from './notes'

export async function exportBackup(database: PawDatabase = db): Promise<Backup> {
  return database.transaction('r', ['notes', 'categories', 'tags', 'noteCategories', 'noteTags', 'flashcards', 'settings'], async () => {
    const [notes, categories, tags, noteCategories, noteTags, flashcards, settings] = await Promise.all([
      database.notes.toArray(), database.categories.toArray(), database.tags.toArray(),
      database.noteCategories.toArray(), database.noteTags.toArray(), database.flashcards.toArray(), database.settings.toArray(),
    ])
    return { version: 1, exported_at: new Date().toISOString(), notes: notes.map(note => noteSchema.parse(note)), categories, tags, noteCategories, noteTags, flashcards, settings }
  })
}

export function validateBackup(input: unknown): Backup {
  const backup = backupSchema.parse(input)
  const unique = (values: string[]) => new Set(values).size === values.length
  if (!unique(backup.notes.map(x => x.id)) || !unique(backup.categories.map(x => x.id)) || !unique(backup.tags.map(x => x.id)) || !unique(backup.flashcards.map(x => x.id)) || !unique(backup.settings.map(x => x.id)) || !unique(backup.categories.map(x => normalize(x.name))) || !unique(backup.tags.map(x => normalize(x.name)))) throw new Error('Das Backup enthält doppelte IDs oder Namen.')
  const notes = new Set(backup.notes.map(x => x.id))
  const categories = new Set(backup.categories.map(x => x.id))
  const tags = new Set(backup.tags.map(x => x.id))
  if (backup.flashcards.length !== notes.size || !unique(backup.flashcards.map(x => x.note_id)) || backup.flashcards.some(x => !notes.has(x.note_id))) throw new Error('Jede Notiz muss genau eine gültige Lernkarte besitzen.')
  if (!unique(backup.noteCategories.map(x => `${x.note_id}:${x.category_id}`)) || backup.noteCategories.some(x => !notes.has(x.note_id) || !categories.has(x.category_id))) throw new Error('Ungültige Kategoriezuordnungen im Backup.')
  if (!unique(backup.noteTags.map(x => `${x.note_id}:${x.tag_id}`)) || backup.noteTags.some(x => !notes.has(x.note_id) || !tags.has(x.tag_id))) throw new Error('Ungültige Tagzuordnungen im Backup.')
  return backup
}

/** Replace, not merge: IDs and review state survive a roundtrip. Invalid input changes nothing. */
export async function importBackup(input: unknown, database: PawDatabase = db): Promise<void> {
  const backup = validateBackup(input)
  await database.transaction('rw', ['notes', 'categories', 'tags', 'noteCategories', 'noteTags', 'flashcards', 'settings'], async () => {
    await Promise.all([database.notes.clear(), database.categories.clear(), database.tags.clear(), database.noteCategories.clear(), database.noteTags.clear(), database.flashcards.clear(), database.settings.clear()])
    await database.notes.bulkAdd(backup.notes.map(n => n.ai_status === 'processing' ? { ...n, ai_status: 'pending' as const } : n))
    await database.categories.bulkAdd(backup.categories)
    await database.tags.bulkAdd(backup.tags)
    await database.noteCategories.bulkAdd(backup.noteCategories)
    await database.noteTags.bulkAdd(backup.noteTags)
    await database.flashcards.bulkAdd(backup.flashcards)
    await database.settings.bulkAdd(backup.settings)
  })
}
