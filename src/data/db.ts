import Dexie, { type EntityTable } from 'dexie'
import type { Note, Category, Tag, NoteCategory, NoteTag, Flashcard, Setting } from '../domain/schemas'

export class PawDatabase extends Dexie {
  notes!: EntityTable<Note, 'id'>
  categories!: EntityTable<Category, 'id'>
  tags!: EntityTable<Tag, 'id'>
  noteCategories!: EntityTable<NoteCategory>
  noteTags!: EntityTable<NoteTag>
  flashcards!: EntityTable<Flashcard, 'id'>
  settings!: EntityTable<Setting, 'id'>

  constructor(name = 'pfotenwissen') {
    super(name)
    this.version(1).stores({
      notes: 'id, created_at, ai_status', categories: 'id, &name', tags: 'id, &name',
      noteCategories: '[note_id+category_id], note_id, category_id',
      noteTags: '[note_id+tag_id], note_id, tag_id',
      flashcards: 'id, &note_id, due_at, review_count', settings: 'id',
    })
  }
}

export const db = new PawDatabase()
