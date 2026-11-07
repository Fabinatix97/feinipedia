<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import ActionDialog from '../components/ActionDialog.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { deleteCategory, renameCategory } from '../data/notes'
import { exportBackup, importBackup, validateBackup } from '../data/backup'
import type { Backup } from '../domain/schemas'

const notes = useLive(() => db.notes.toArray(), [])
const categories = useLive(() => db.categories.toArray(), [])
const links = useLive(() => db.noteCategories.toArray(), [])
const selected = ref('')
const search = ref('')
const order = ref<'new' | 'old'>('new')
const error = ref('')
const message = ref('')
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const dialog = ref<'rename' | 'delete' | 'import' | null>(null)
const categoryDraft = ref('')
const pendingBackup = ref<Backup | null>(null)
const filtered = computed(() => notes.value.filter(n => (!selected.value || links.value.some(l => l.note_id === n.id && l.category_id === selected.value)) && `${n.title} ${n.content}`.toLocaleLowerCase('de').includes(search.value.toLocaleLowerCase('de'))).sort((a, b) => order.value === 'new' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)))
const categoryName = computed(() => categories.value.find(c => c.id === selected.value)?.name || 'Alle Notizen')
const countFor = (id: string) => links.value.filter(l => l.category_id === id).length
const categoriesFor = (id: string) => categories.value.filter(c => links.value.some(l => l.note_id === id && l.category_id === c.id))

function openRename() {
  error.value = ''
  categoryDraft.value = categoryName.value
  dialog.value = 'rename'
}
async function confirmAction() {
  if (importing.value) return
  error.value = ''
  importing.value = true
  try {
    if (dialog.value === 'rename') {
      await renameCategory(selected.value, categoryDraft.value)
      message.value = 'Kategorie umbenannt.'
    } else if (dialog.value === 'delete') {
      await deleteCategory(selected.value)
      selected.value = ''
      message.value = 'Kategorie entfernt. Deine Notizen bleiben erhalten.'
    } else if (dialog.value === 'import' && pendingBackup.value) {
      await importBackup(pendingBackup.value)
      selected.value = ''
      message.value = 'Backup vollständig wiederhergestellt.'
    }
    dialog.value = null
    pendingBackup.value = null
  } catch (e) { error.value = (e as Error).message } finally { importing.value = false }
}
async function download() {
  try {
    const data = await exportBackup()
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }))
    const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `pfotenwissen-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    message.value = 'Backup heruntergeladen.'
  } catch (e) { error.value = (e as Error).message }
}
async function upload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  error.value = ''
  try {
    const data: unknown = JSON.parse(await file.text())
    pendingBackup.value = validateBackup(data)
    dialog.value = 'import'
  } catch (e) { error.value = `Import fehlgeschlagen: ${(e as Error).message}` } finally { if (fileInput.value) fileInput.value.value = '' }
}
</script>

<template>
  <div class="page"><div class="page-title-row"><div><h1>Sammlungen</h1><p>Deine Notizen und Themen.</p></div><RouterLink to="/" class="btn btn-primary desktop-action"><Icon name="plus" :size="18" /> Neue Notiz</RouterLink></div>
    <div class="collection-layout"><aside class="category-panel"><div class="panel-heading">THEMEN <span>{{ categories.length }}</span></div><button :class="['category-button', { selected: !selected }]" @click="selected = ''"><Icon name="book" :size="18" />Alle Notizen <span>{{ notes.length }}</span></button><button v-for="category in categories" :key="category.id" :class="['category-button', { selected: selected === category.id }]" @click="selected = category.id"><Icon name="leaf" :size="18" /><span class="truncate">{{ category.name }}</span><span>{{ countFor(category.id) }}</span></button></aside>
      <section class="listing"><div class="listing-header"><h2>{{ categoryName }} <span class="muted-count">{{ filtered.length }}</span></h2><div v-if="selected" class="category-tools"><button class="icon-button" :aria-label="`Kategorie ${categoryName} umbenennen`" title="Umbenennen" @click="openRename">✎</button><button class="icon-button" :aria-label="`Kategorie ${categoryName} löschen`" title="Löschen" @click="dialog = 'delete'"><Icon name="trash" :size="17" /></button></div></div>
        <div class="filters"><label class="search-field"><Icon name="search" :size="19" /><input v-model="search" type="search" placeholder="Notizen durchsuchen …" aria-label="Notizen durchsuchen" /></label><select v-model="order" aria-label="Sortierung"><option value="new">Neueste zuerst</option><option value="old">Älteste zuerst</option></select></div>
        <div v-if="!filtered.length" class="empty-state"><span class="empty-icon"><Icon name="book" :size="32" /></span><h3>{{ search ? 'Nichts gefunden' : 'Noch keine Notizen hier' }}</h3><p>{{ search ? 'Versuch es mit einem anderen Suchbegriff.' : 'Halte deinen nächsten Gedanken fest – er findet hier seinen Platz.' }}</p><RouterLink v-if="!search" to="/" class="btn btn-primary">Notiz erfassen <Icon name="arrow" :size="17" /></RouterLink></div>
        <RouterLink v-for="note in filtered" :key="note.id" class="note-list-card" :to="`/notiz/${note.id}`"><div class="note-card-top"><span class="date-label">{{ new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span><span v-if="note.ai_status === 'pending' || note.ai_status === 'failed'" class="pending-tag">KI ausstehend</span></div><h3>{{ note.title }}</h3><p>{{ note.content }}</p><div class="note-card-footer"><span class="tag-pill" v-for="cat in categoriesFor(note.id).slice(0, 3)" :key="cat.id">{{ cat.name }}</span><span class="read-more">Ansehen <Icon name="arrow" :size="16" /></span></div></RouterLink>
      </section></div>
    <details class="backup-panel"><summary>Datensicherung</summary><p>Deine Notizen liegen nur auf diesem Gerät. Sichere sie regelmäßig als JSON-Datei.</p><div class="backup-actions"><button class="btn btn-outline" @click="download"><Icon name="download" :size="18" /> Backup herunterladen</button><button class="btn btn-outline" :disabled="importing" @click="fileInput?.click()"><Icon name="upload" :size="18" /> Backup importieren</button><input ref="fileInput" type="file" accept=".json,application/json" hidden @change="upload" /></div></details>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p><p v-if="message" class="alert" role="status">{{ message }}</p>
    <ActionDialog :open="dialog === 'rename'" title="Kategorie umbenennen" confirm-label="Speichern" :busy="importing" @confirm="confirmAction" @cancel="dialog = null"><label class="dialog-label" for="category-name">Neuer Name</label><input id="category-name" v-model="categoryDraft" class="dialog-input" maxlength="100" @keyup.enter="confirmAction" /><p v-if="error" class="alert error" role="alert">{{ error }}</p></ActionDialog>
    <ActionDialog :open="dialog === 'delete'" title="Kategorie löschen?" confirm-label="Kategorie löschen" tone="danger" :busy="importing" @confirm="confirmAction" @cancel="dialog = null"><p>Die Zuordnung „{{ categoryName }}“ wird entfernt. Deine Notizen und Lernkarten bleiben erhalten.</p><p v-if="error" class="alert error" role="alert">{{ error }}</p></ActionDialog>
    <ActionDialog :open="dialog === 'import'" title="Backup importieren?" confirm-label="Daten ersetzen" tone="danger" :busy="importing" @confirm="confirmAction" @cancel="dialog = null; pendingBackup = null"><p>Alle aktuellen Daten auf diesem Gerät werden durch die Daten aus dem Backup ersetzt. Das lässt sich nicht rückgängig machen.</p><p v-if="error" class="alert error" role="alert">{{ error }}</p></ActionDialog>
  </div>
</template>
