<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { deleteNote, getNoteRelations, saveManual } from '../data/notes'
import { enrichNote } from '../data/ai'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string
const note = useLive(() => db.notes.get(id), undefined)
const card = useLive(() => db.flashcards.where('note_id').equals(id).first(), undefined)
const relations = useLive(() => getNoteRelations(id), { categories: [], tags: [] })
const editing = ref(false)
const busy = ref(false)
const error = ref('')
const notice = ref('')
const form = ref({ title: '', summary: '', content: '', source: '', categories: '', tags: '', question: '', answer: '' })
watch([note, card, relations], () => {
  if (!editing.value && note.value && card.value) form.value = {
    title: note.value.title, summary: note.value.summary, content: note.value.content, source: note.value.source,
    categories: relations.value.categories.map(c => c.name).join(', '), tags: relations.value.tags.join(', '),
    question: card.value.question, answer: card.value.answer,
  }
}, { immediate: true })
const statusText = computed(() => ({ pending: 'KI-Aufbereitung ausstehend', processing: 'KI arbeitet …', completed: 'Mit KI aufbereitet', failed: 'KI-Aufbereitung fehlgeschlagen', manual: 'Manuell bearbeitet' }[note.value?.ai_status || 'pending']))
async function save() {
  busy.value = true; error.value = ''
  try { await saveManual(id, form.value); editing.value = false; notice.value = 'Änderungen gespeichert. Dein Lernfortschritt bleibt erhalten.' }
  catch (e) { error.value = (e as Error).message } finally { busy.value = false }
}
async function process() {
  if (busy.value) return
  const consent = await db.settings.get('ai_consent')
  if (consent?.value !== true) {
    if (!window.confirm('Für die KI-Aufbereitung wird der Originaltext deiner Notiz an OpenAI übertragen. Möchtest du fortfahren?')) return
    await db.settings.put({ id: 'ai_consent', value: true })
  }
  busy.value = true; error.value = ''; notice.value = ''
  try { await enrichNote(id); notice.value = 'Deine Notiz wurde aufbereitet. Du kannst alle Ergebnisse bearbeiten.' }
  catch (e) { error.value = `${(e as Error).message} Die Notiz bleibt gespeichert.` } finally { busy.value = false }
}
async function remove() {
  if (!window.confirm('Diese Notiz und ihre Lernkarte wirklich löschen?')) return
  await deleteNote(id)
  await router.push('/sammlungen')
}
</script>

<template>
  <div class="page detail-page"><RouterLink to="/sammlungen" class="back-link"><Icon name="back" :size="18" /> Zurück zu Sammlungen</RouterLink>
    <div v-if="!note || !card" class="empty-state"><h2>Notiz nicht gefunden</h2><RouterLink to="/sammlungen" class="text-link">Zu den Sammlungen</RouterLink></div>
    <template v-else>
      <div class="detail-heading"><div><div class="eyebrow"><Icon name="paw" :size="16" /> DEIN WISSEN</div><h1>{{ note.title }}</h1><p>{{ new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) }} <span class="middle-dot">·</span> {{ statusText }}</p></div><div class="detail-actions"><button v-if="!editing" class="btn btn-outline" @click="editing = true">✎ &nbsp; Bearbeiten</button><button class="btn btn-danger-ghost" title="Notiz löschen" aria-label="Notiz löschen" @click="remove"><Icon name="trash" :size="18" /></button></div></div>
      <div v-if="editing" class="edit-card"><div class="overline">NOTIZ BEARBEITEN</div><p class="edit-hint">Der Originaltext wird nur durch deine Eingabe verändert – nie durch die KI. Kategorien und Tags mit Kommas trennen.</p>
        <label>Titel<input v-model="form.title" maxlength="200" /></label>
        <label>Originalinhalt<textarea v-model="form.content" rows="6" /></label>
        <label>Quelle<input v-model="form.source" placeholder="Optional" /></label>
        <label>Zusammenfassung<textarea v-model="form.summary" rows="3" /></label>
        <div class="form-two"><label>Kategorien<input v-model="form.categories" placeholder="z. B. Welpen, Erziehung" /></label><label>Tags<input v-model="form.tags" placeholder="z. B. Training, Alltag" /></label></div>
        <label>Lernfrage<input v-model="form.question" /></label><label>Antwort<textarea v-model="form.answer" rows="3" /></label>
        <div class="edit-actions"><button class="btn btn-quiet" @click="editing = false">Abbrechen</button><button class="btn btn-primary" :disabled="busy" @click="save">Änderungen speichern</button></div></div>
      <div v-else class="detail-grid"><div class="detail-main"><div v-if="note.ai_status === 'pending' || note.ai_status === 'failed' || note.ai_status === 'processing'" class="ai-banner"><span class="ai-banner-icon"><Icon name="sparkle" :size="22" /></span><div><strong>{{ statusText }}</strong><p>Dein Original ist sicher gespeichert. Du kannst es mit KI aufbereiten oder alles selbst bearbeiten.</p></div><button class="btn btn-primary" :disabled="busy || note.ai_status === 'processing'" @click="process">{{ busy || note.ai_status === 'processing' ? 'Wird aufbereitet …' : 'KI starten' }}</button></div>
          <section class="detail-section"><div class="overline">DEINE NOTIZ</div><h2>Das hast du festgehalten</h2><p class="original-content">{{ note.content }}</p><p v-if="note.source" class="source-line"><Icon name="book" :size="17" /> Quelle: {{ note.source }}</p></section>
          <section v-if="note.summary" class="detail-section"><div class="overline">AUF EINEN BLICK</div><h2>Das Wichtigste</h2><p class="summary-content">{{ note.summary }}</p></section>
          <section class="detail-section"><div class="overline">ZUM MERKEN</div><h2>Deine Lernkarte</h2><div class="preview-card"><span>FRAGE</span><strong>{{ card.question }}</strong><div class="preview-divider"></div><span>ANTWORT</span><p>{{ card.answer }}</p></div><p class="review-info">{{ card.review_count }} × geübt <span class="middle-dot">·</span> {{ card.due_at ? `Nächste Fälligkeit: ${new Date(card.due_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Noch nicht geübt' }}</p></section></div>
        <aside class="detail-aside"><div class="aside-card"><div class="overline">EINSORTIERT UNTER</div><h3>Kategorien</h3><div v-if="relations.categories.length" class="pill-list"><span class="tag-pill" v-for="cat in relations.categories" :key="cat.id">{{ cat.name }}</span></div><p v-else class="aside-muted">Noch keine Kategorien</p><div class="aside-divider"></div><h3>Tags</h3><div v-if="relations.tags.length" class="pill-list"><span class="tag-pill light" v-for="tag in relations.tags" :key="tag">#{{ tag }}</span></div><p v-else class="aside-muted">Noch keine Tags</p></div><RouterLink to="/ueben" class="aside-practice"><Icon name="cards" :size="24" /><span>Wissen bleibt, wenn wir es wiederholen.<strong>Zur Lernsession <Icon name="arrow" :size="15" /></strong></span></RouterLink></aside></div>
      <p v-if="error" class="alert error" role="alert">{{ error }}</p><p v-if="notice" class="alert" role="status">{{ notice }}</p>
    </template>
  </div>
</template>
