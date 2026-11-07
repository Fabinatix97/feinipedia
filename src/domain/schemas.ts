import { z } from 'zod'

const id = z.uuid()
const date = z.iso.datetime({ offset: true })
const text = z.string().trim().min(1)
export const noteSchema = z.object({ id, title: text, content: text, summary: z.string(), source: z.string(), created_at: date, updated_at: date, ai_status: z.enum(['pending', 'processing', 'completed', 'failed', 'manual']) })
export const categorySchema = z.object({ id, name: text, description: z.string(), created_at: date })
export const tagSchema = z.object({ id, name: text })
export const linkSchema = z.object({ note_id: id, category_id: id })
export const tagLinkSchema = z.object({ note_id: id, tag_id: id })
export const cardSchema = z.object({ id, note_id: id, question: text, answer: text, created_at: date, updated_at: date, repetitions: z.number().int().nonnegative(), lapses: z.number().int().nonnegative(), interval_days: z.number().nonnegative().max(365), ease_factor: z.number().positive(), review_count: z.number().int().nonnegative(), last_reviewed_at: date.nullable(), due_at: date.nullable() })
export const settingSchema = z.object({ id: z.string().min(1), value: z.unknown() })

export type Note = z.infer<typeof noteSchema>
export type Category = z.infer<typeof categorySchema>
export type Tag = z.infer<typeof tagSchema>
export type NoteCategory = z.infer<typeof linkSchema>
export type NoteTag = z.infer<typeof tagLinkSchema>
export type Flashcard = z.infer<typeof cardSchema>
export type Setting = z.infer<typeof settingSchema>

export const enrichmentSchema = z.object({
  title: text.max(80), summary: z.string(),
  categories: z.array(z.object({ name: text, description: z.string() })),
  tags: z.array(text),
  flashcard: z.object({ question: text, answer: text }),
})
export type Enrichment = z.infer<typeof enrichmentSchema>

export const backupSchema = z.object({
  version: z.literal(1), exported_at: date,
  notes: z.array(noteSchema), categories: z.array(categorySchema), tags: z.array(tagSchema),
  noteCategories: z.array(linkSchema), noteTags: z.array(tagLinkSchema),
  flashcards: z.array(cardSchema), settings: z.array(settingSchema),
})
export type Backup = z.infer<typeof backupSchema>
