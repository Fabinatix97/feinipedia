<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { deleteCategory, renameCategory } from '../data/notes'
import { exportBackup, importBackup } from '../data/backup'

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
const filtered = computed(() => notes.value.filter(n => (!selected.value || links.value.some(l => l.note_id === n.id && l.category_id === selected.value)) && `${n.title} ${n.content}`.toLocaleLowerCase('de').includes(search.value.toLocaleLowerCase('de'))).sort((a, b) => order.value === 'new' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at)))
const categoryName = computed(() => categories.value.find(c => c.id === selected.value)?.name || 'Alle Notizen')
const countFor = (id: string) => links.value.filter(l => l.category_id === id).length
const categoriesFor = (id: string) => categories.value.filter(c => links.value.some(l => l.note_id === id && l.category_id === c.id))

async function rename(id: string, name: string) {
  const value = window.prompt('Neuer Kategoriename', name)
  if (value === null) return
  try { await renameCategory(id, value); message.value = 'Kategorie umbenannt.' } catch (e) { error.value = (e as Error).message }
}
async function remove(id: string, name: string) {
  if (!window.confirm(`Kategorie „${name}“ löschen? Die Notizen bleiben erhalten.`)) return
  await deleteCategory(id)
  if (selected.value === id) selected.value = ''
  message.value = 'Kategorie entfernt. Deine Notizen bleiben erhalten.'
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
  error.value = ''; importing.value = true
  try {
    const data: unknown = JSON.parse(await file.text())
    if (!window.confirm('Backup importieren? Alle aktuellen Daten auf diesem Gerät werden ersetzt.')) return
    await importBackup(data)
    selected.value = ''; message.value = 'Backup vollständig wiederhergestellt.'
  } catch (e) { error.value = `Import fehlgeschlagen: ${(e as Error).message}` } finally { importing.value = false; if (fileInput.value) fileInput.value.value = '' }
}
</script>

<template>
  <div class="page"><div class="eyebrow"><Icon name="book" :size="16" /> DEIN WISSENSSCHATZ</div><div class="page-title-row"><div><h1>Sammlungen<span class="dot-accent">.</span></h1><p>Alles, was du gelernt hast – schön an einem Ort.</p></div><RouterLink to="/" class="btn btn-primary desktop-action"><Icon name="plus" :size="18" /> Neue Notiz</RouterLink></div>
    <div class="collection-layout"><aside class="category-panel"><div class="panel-heading">THEMEN <span>{{ categories.length }}</span></div><button :class="['category-button', { selected: !selected }]" @click="selected = ''"><Icon name="book" :size="18" />Alle Notizen <span>{{ notes.length }}</span></button><button v-for="category in categories" :key="category.id" :class="['category-button', { selected: selected === category.id }]" @click="selected = category.id"><Icon name="leaf" :size="18" /><span class="truncate">{{ category.name }}</span><span>{{ countFor(category.id) }}</span></button><div class="panel-bottom"><Icon name="paw" :size="20" /> Mit jedem Gedanken wächst dein Wissen.</div></aside>
      <section class="listing"><div class="listing-header"><div><div class="overline">{{ selected ? 'DEIN THEMA' : 'DEIN ÜBERBLICK' }}</div><h2>{{ categoryName }} <span class="muted-count">{{ filtered.length }}</span></h2></div><div v-if="selected" class="category-tools"><button class="icon-button" :aria-label="`Kategorie ${categoryName} umbenennen`" title="Umbenennen" @click="rename(selected, categoryName)">✎</button><button class="icon-button" :aria-label="`Kategorie ${categoryName} löschen`" title="Löschen" @click="remove(selected, categoryName)"><Icon name="trash" :size="17" /></button></div></div>
        <div class="filters"><label class="search-field"><Icon name="search" :size="19" /><input v-model="search" type="search" placeholder="Notizen durchsuchen …" aria-label="Notizen durchsuchen" /></label><select v-model="order" aria-label="Sortierung"><option value="new">Neueste zuerst</option><option value="old">Älteste zuerst</option></select></div>
        <div v-if="!filtered.length" class="empty-state"><span class="empty-icon"><Icon name="book" :size="32" /></span><h3>{{ search ? 'Nichts gefunden' : 'Noch keine Notizen hier' }}</h3><p>{{ search ? 'Versuch es mit einem anderen Suchbegriff.' : 'Halte deinen nächsten Gedanken fest – er findet hier seinen Platz.' }}</p><RouterLink v-if="!search" to="/" class="btn btn-primary">Notiz erfassen <Icon name="arrow" :size="17" /></RouterLink></div>
        <RouterLink v-for="note in filtered" :key="note.id" class="note-list-card" :to="`/notiz/${note.id}`"><div class="note-card-top"><span class="date-label">{{ new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) }}</span><span v-if="note.ai_status === 'pending' || note.ai_status === 'failed'" class="pending-tag">KI ausstehend</span></div><h3>{{ note.title }}</h3><p>{{ note.summary || note.content }}</p><div class="note-card-footer"><span class="tag-pill" v-for="cat in categoriesFor(note.id).slice(0, 3)" :key="cat.id">{{ cat.name }}</span><span class="read-more">Ansehen <Icon name="arrow" :size="16" /></span></div></RouterLink>
      </section></div>
    <section class="backup-panel"><div><div class="overline">DEINE DATEN GEHÖREN DIR</div><h3>Ein Zuhause für dein Wissen.</h3><p>Deine Notizen liegen nur auf diesem Gerät. Sichere sie regelmäßig als JSON-Datei.</p></div><div class="backup-actions"><button class="btn btn-outline" @click="download"><Icon name="download" :size="18" /> Backup herunterladen</button><button class="btn btn-outline" :disabled="importing" @click="fileInput?.click()"><Icon name="upload" :size="18" /> Backup importieren</button><input ref="fileInput" type="file" accept=".json,application/json" hidden @change="upload" /></div></section>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p><p v-if="message" class="alert" role="status">{{ message }}</p>
  </div>
</template>
