<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import Icon from '../components/Icon.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { createNote } from '../data/notes'
import { enrichNote } from '../data/ai'
import { isDue } from '../domain/review'

const router = useRouter()
const notes = useLive(() => db.notes.orderBy('created_at').reverse().limit(3).toArray(), [])
const count = useLive(() => db.notes.count(), 0)
const cards = useLive(() => db.flashcards.toArray(), [])
const due = computed(() => cards.value.filter(c => isDue(c) || c.review_count === 0).length)
const content = ref('')
const source = ref('')
const busy = ref(false)
const error = ref('')
const notice = ref('')

async function save(withAI: boolean) {
  if (!content.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const note = await createNote(content.value, source.value)
    content.value = ''
    source.value = ''
    if (withAI) {
      if (!navigator.onLine) notice.value = 'Offline gespeichert. Du kannst die KI später in der Notiz starten.'
      else {
        const consent = await db.settings.get('ai_consent')
        if (consent?.value === true || window.confirm('Für die KI-Aufbereitung wird der Originaltext deiner Notiz an OpenAI übertragen. Möchtest du fortfahren?')) {
          if (!consent) await db.settings.put({ id: 'ai_consent', value: true })
          try { await enrichNote(note.id) } catch (e) { notice.value = `${(e as Error).message} Deine Notiz wurde sicher gespeichert.` }
        } else notice.value = 'Deine Notiz wurde ohne KI gespeichert.'
      }
    } else notice.value = 'Deine Notiz wurde lokal gespeichert.'
    await router.push(`/notiz/${note.id}`)
  } catch (e) { error.value = (e as Error).message } finally { busy.value = false }
}
</script>

<template>
  <div class="page capture-page">
    <div class="eyebrow"><Icon name="paw" :size="16" /> WILLKOMMEN BEI PFOTENWISSEN</div>
    <section class="hero">
      <div class="hero-copy"><div class="hero-kicker">WISSEN, DAS BLEIBT <span>✦</span></div><h1>Alles über Hunde.<br /><em>Alles an einem Ort.</em></h1><p>Halte fest, was du lernst – und mach aus kleinen Erkenntnissen großes Wissen für euer gemeinsames Leben.</p></div>
      <div class="hero-art" aria-hidden="true"><div class="sun"></div><div class="art-circle"><Icon name="paw" :size="92" /></div><span class="art-spark one">✦</span><span class="art-spark two">✳</span><span class="art-spark three">✦</span></div>
    </section>

    <div class="section-heading"><div><div class="overline">DEIN NÄCHSTER GEDANKE</div><h2>Wissen festhalten <span class="heading-spark">✳</span></h2><p>Eine Idee, ein Zitat oder etwas, das du nicht vergessen möchtest.</p></div></div>
    <section class="capture-card">
      <div class="capture-label"><span class="label-icon"><Icon name="plus" :size="18" /></span><span>Neue Notiz</span><span class="small-hint">Nur der Text ist nötig</span></div>
      <label class="sr-only" for="note-content">Deine Notiz</label>
      <textarea id="note-content" v-model="content" placeholder="Was hast du heute über Hunde gelernt? Schreib einfach drauflos …" rows="5" maxlength="20000"></textarea>
      <div class="source-row"><Icon name="book" :size="18" /><label class="sr-only" for="note-source">Quelle (optional)</label><input id="note-source" v-model="source" placeholder="Quelle hinzufügen (optional)" maxlength="300" /></div>
      <div class="capture-actions"><p><Icon name="sparkle" :size="17" /> Mit KI wird daraus ein Lernmoment.</p><div class="action-buttons"><button class="btn btn-quiet" :disabled="!content.trim() || busy" @click="save(false)">Nur speichern</button><button class="btn btn-primary" :disabled="!content.trim() || busy" @click="save(true)"><Icon name="sparkle" :size="18" />{{ busy ? 'Wird gespeichert …' : 'Speichern & aufbereiten' }}<Icon v-if="!busy" name="arrow" :size="17" /></button></div></div>
    </section>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p><p v-if="notice" class="alert" role="status">{{ notice }}</p>

    <div class="dashboard-grid">
      <section class="recent-section"><div class="section-title-row"><div><div class="overline">DEINE SAMMLUNG</div><h2>Zuletzt notiert</h2></div><RouterLink class="text-link" to="/sammlungen">Alle ansehen <Icon name="arrow" :size="16" /></RouterLink></div>
        <div v-if="!notes.length" class="empty-inline"><span class="empty-icon"><Icon name="leaf" :size="26" /></span><div><strong>Hier beginnt eure Geschichte.</strong><p>Deine erste Notiz wartet auf dich.</p></div></div>
        <RouterLink v-for="note in notes" :key="note.id" class="recent-item" :to="`/notiz/${note.id}`"><span class="recent-symbol"><Icon name="book" :size="19" /></span><span class="recent-text"><strong>{{ note.title }}</strong><small>{{ new Date(note.created_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' }) }} · {{ note.ai_status === 'completed' ? 'Aufbereitet' : 'Notiz' }}</small></span><Icon name="arrow" :size="18" /></RouterLink>
      </section>
      <RouterLink class="practice-teaser" to="/ueben"><div class="teaser-top"><span class="teaser-icon"><Icon name="cards" :size="25" /></span><span class="teaser-decoration">✦</span></div><div><div class="overline">KLEINE SCHRITTE, GROSSES WISSEN</div><h3>Was weißt du noch?</h3><p>{{ due ? `${due} Lernkarten warten darauf, entdeckt oder wiederholt zu werden.` : 'Wenn du eine Notiz anlegst, wartet hier deine erste Lernkarte.' }}</p></div><span class="teaser-link">Jetzt üben <Icon name="arrow" :size="17" /></span></RouterLink>
    </div>
    <div class="footnote">✳ &nbsp; {{ count }} {{ count === 1 ? 'Gedanke' : 'Gedanken' }} für später festgehalten</div>
  </div>
</template>
