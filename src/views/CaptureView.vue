<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import ActionDialog from '../components/ActionDialog.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { createNote } from '../data/notes'
import { enrichNote } from '../data/ai'
import { isDue } from '../domain/review'

const router = useRouter()
const notes = useLive(() => db.notes.orderBy('created_at').reverse().limit(3).toArray(), [])
const cards = useLive(() => db.flashcards.toArray(), [])
const due = computed(() => cards.value.filter(c => isDue(c) || c.review_count === 0).length)
const content = ref('')
const source = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')
const consentNoteId = ref<string | null>(null)
const lastSavedId = ref<string | null>(null)

async function processSaved(id: string) {
  busy.value = true
  try {
    await enrichNote(id)
    await router.push(`/notiz/${id}`)
  } catch (e) {
    notice.value = `${(e as Error).message} Deine Notiz ist gespeichert.`
  } finally { busy.value = false }
}

async function confirmConsent() {
  if (busy.value) return
  const id = consentNoteId.value
  if (!id) return
  busy.value = true
  try {
    await db.settings.put({ id: 'ai_consent', value: true })
    consentNoteId.value = null
    await processSaved(id)
  } catch (e) { error.value = (e as Error).message } finally { busy.value = false }
}

function cancelConsent() {
  const id = consentNoteId.value
  consentNoteId.value = null
  if (id) void router.push(`/notiz/${id}`)
}

async function save(withAI: boolean) {
  if (!content.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    const note = await createNote(content.value, source.value)
    lastSavedId.value = note.id
    content.value = ''
    source.value = ''
    if (withAI) {
      if (navigator.onLine) {
        const consent = await db.settings.get('ai_consent')
        if (consent?.value !== true) { consentNoteId.value = note.id; return }
        await processSaved(note.id)
        return
      }
    }
    await router.push(`/notiz/${note.id}`)
  } catch (e) { error.value = (e as Error).message } finally { busy.value = false }
}
</script>

<template>
  <div class="page capture-page">
    <header class="capture-heading"><h1>Wissen festhalten.</h1><p>Eine Idee, ein Zitat oder etwas, das du über Hunde gelernt hast.</p></header>
    <section class="capture-card">
      <div class="capture-label">Neue Notiz <span class="small-hint">Nur der Text ist nötig</span></div>
      <label class="sr-only" for="note-content">Deine Notiz</label>
      <textarea id="note-content" v-model="content" placeholder="Was hast du heute über Hunde gelernt? Schreib einfach drauflos …" rows="5" maxlength="20000"></textarea>
      <div class="source-row"><Icon name="book" :size="18" /><label class="sr-only" for="note-source">Quelle (optional)</label><input id="note-source" v-model="source" placeholder="Quelle hinzufügen (optional)" maxlength="300" /></div>
      <div class="capture-actions"><div class="action-buttons"><button class="btn btn-quiet" :disabled="!content.trim() || busy" @click="save(false)">Nur speichern</button><button class="btn btn-primary" :disabled="!content.trim() || busy" @click="save(true)">{{ busy ? 'Wird aufbereitet …' : 'Speichern & mit KI aufbereiten' }}</button></div></div>
    </section>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p><p v-if="notice" class="alert" role="status">{{ notice }} <RouterLink v-if="lastSavedId" :to="`/notiz/${lastSavedId}`" class="text-link">Notiz öffnen <Icon name="arrow" :size="15" /></RouterLink></p>

    <section v-if="notes.length" class="recent-section"><div class="section-title-row"><h2>Zuletzt notiert</h2><RouterLink class="text-link" to="/sammlungen">Alle ansehen <Icon name="arrow" :size="16" /></RouterLink></div>
      <RouterLink v-for="note in notes" :key="note.id" class="recent-item" :to="`/notiz/${note.id}`"><span class="recent-text"><strong>{{ note.title }}</strong><small>{{ new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' }) }}</small></span><Icon name="arrow" :size="18" /></RouterLink>
    </section>
    <RouterLink v-if="due" to="/ueben" class="practice-shortcut">{{ due }} {{ due === 1 ? 'Lernkarte wartet' : 'Lernkarten warten' }} auf dich <Icon name="arrow" :size="17" /></RouterLink>
    <ActionDialog :open="!!consentNoteId" title="Mit KI aufbereiten?" confirm-label="Ja, aufbereiten" :busy="busy" @confirm="confirmConsent" @cancel="cancelConsent"><p>Deine Notiz ist bereits auf diesem Gerät gespeichert. Für die Aufbereitung wird ihr Originaltext an OpenAI übertragen. Du kannst die Notiz auch ohne KI verwenden.</p><p v-if="error" class="alert error" role="alert">{{ error }}</p></ActionDialog>
  </div>
</template>
