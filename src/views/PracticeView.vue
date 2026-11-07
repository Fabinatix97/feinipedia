<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from '../components/Icon.vue'
import { db } from '../data/db'
import { useLive } from '../data/live'
import { isDue, review, sessionCards, type Rating } from '../domain/review'

const cards = useLive(() => db.flashcards.toArray(), [])
const notes = useLive(() => db.notes.toArray(), [])
const setting = useLive(() => db.settings.get('daily_new_limit'), undefined)
const newLog = useLive(() => db.settings.get('new_review_log'), undefined)
const dailyLimit = computed(() => typeof setting.value?.value === 'number' ? setting.value.value : 10)
const due = computed(() => cards.value.filter(c => isDue(c)).length)
const fresh = computed(() => cards.value.filter(c => c.review_count === 0).length)
const today = () => new Date().toLocaleDateString('en-CA')
const usedToday = computed(() => {
  const log = newLog.value?.value
  return typeof log === 'object' && log !== null && 'date' in log && log.date === today() && 'count' in log && typeof log.count === 'number' ? log.count : 0
})
const queue = computed(() => sessionCards(cards.value, dailyLimit.value, usedToday.value))
const active = ref(false)
const revealed = ref(false)
const seen = ref<string[]>([])
const completed = ref(0)
const error = ref('')
const current = computed(() => queue.value.find(c => !seen.value.includes(c.id)))
const nextDate = computed(() => cards.value.filter(c => c.review_count > 0 && c.due_at).sort((a, b) => (a.due_at || '').localeCompare(b.due_at || ''))[0]?.due_at)
const currentNote = computed(() => notes.value.find(n => n.id === current.value?.note_id))
async function rate(rating: Rating) {
  if (!current.value || !revealed.value) return
  try {
    const id = current.value.id
    await db.transaction('rw', db.flashcards, db.settings, async () => {
      const existing = await db.flashcards.get(id)
      if (!existing) throw new Error('Lernkarte nicht gefunden.')
      if (existing.review_count === 0) {
        const log = await db.settings.get('new_review_log')
        const value = log?.value
        const count = typeof value === 'object' && value !== null && 'date' in value && value.date === today() && 'count' in value && typeof value.count === 'number' ? value.count : 0
        await db.settings.put({ id: 'new_review_log', value: { date: today(), count: count + 1 } })
      }
      await db.flashcards.put(review(existing, rating))
    })
    seen.value = [...seen.value, id]
    completed.value++
    revealed.value = false
  } catch (e) { error.value = (e as Error).message }
}
async function setLimit(event: Event) {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isInteger(value) && value >= 0 && value <= 100) await db.settings.put({ id: 'daily_new_limit', value })
}
</script>

<template>
  <div class="page practice-page"><div class="eyebrow"><Icon name="cards" :size="16" /> WISSEN, DAS BLEIBT</div><div class="page-title-row"><div><h1>Ein bisschen üben<span class="dot-accent">.</span></h1><p>Ein paar Minuten heute machen morgen den Unterschied.</p></div></div>
    <template v-if="!active"><div class="practice-overview"><div class="practice-intro"><span class="practice-illustration"><Icon name="paw" :size="64" /></span><div class="overline">DEIN TÄGLICHER LERNMOMENT</div><h2>Bereit, dein Wissen<br /><em>aufzufrischen?</em></h2><p>Schau dir die Frage an, erinnere dich an die Antwort und bewerte dich ganz ehrlich. Kein Druck – nur du und dein Wissen.</p><button class="btn btn-primary btn-large" :disabled="!queue.length" @click="active = true; seen = []; completed = 0"><Icon name="cards" :size="20" /> {{ queue.length ? 'Lernsession starten' : 'Heute nichts zu üben' }} <Icon v-if="queue.length" name="arrow" :size="18" /></button></div><div class="practice-stats"><div class="stat-box"><span class="stat-icon"><Icon name="clock" :size="22" /></span><strong>{{ due }}</strong><span>Fällige Karten</span></div><div class="stat-box"><span class="stat-icon peach"><Icon name="sparkle" :size="22" /></span><strong>{{ fresh }}</strong><span>Neue Karten</span></div><div class="limit-box"><div><strong>Neue Karten pro Tag</strong><p>Fällige Karten zählen nicht zum Limit.</p></div><input type="number" min="0" max="100" :value="dailyLimit" aria-label="Tageslimit neuer Karten" @change="setLimit" /></div></div></div>
      <div v-if="!cards.length" class="practice-hint"><Icon name="leaf" :size="22" /><span>Deine erste Lernkarte entsteht mit deiner ersten Notiz. <RouterLink to="/">Jetzt etwas festhalten <Icon name="arrow" :size="15" /></RouterLink></span></div>
      <div v-else-if="!queue.length" class="practice-hint"><Icon name="check" :size="22" /><span>Alles geschafft für heute! {{ nextDate ? `Die nächste Karte ist ${new Date(nextDate).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })} fällig.` : 'Komm bald wieder vorbei.' }}</span></div>
    </template>
    <template v-else><div class="session-top"><button class="back-link" @click="active = false"><Icon name="back" :size="18" /> Session beenden</button><span>{{ completed }} geschafft <span class="middle-dot">·</span> {{ queue.filter(c => !seen.includes(c.id)).length }} übrig</span></div>
      <div v-if="current" class="session-wrap"><div class="session-progress"><span :style="{ width: `${100 * completed / Math.max(1, completed + queue.filter(c => !seen.includes(c.id)).length)}%` }"></span></div><div class="flashcard"><span class="card-eyebrow"><Icon name="paw" :size="17" /> {{ revealed ? 'DEINE ANTWORT' : 'DIE FRAGE' }}</span><p v-if="currentNote" class="card-context">Aus „{{ currentNote.title }}“</p><h2>{{ current.question }}</h2><div v-if="revealed" class="revealed-answer"><div class="overline">ANTWORT</div><p>{{ current.answer }}</p></div><div v-else class="think-prompt">Nimm dir einen Moment. Was fällt dir dazu ein?</div></div><button v-if="!revealed" class="btn btn-primary reveal-button" @click="revealed = true">Antwort anzeigen <Icon name="arrow" :size="18" /></button><div v-else class="rating-area"><p>Wie gut wusstest du die Antwort?</p><div class="rating-buttons"><button class="btn rating again" @click="rate('again')">Nochmal <small>in 10 Min.</small></button><button class="btn rating hard" @click="rate('hard')">Schwer <small>ab 1 Tag</small></button><button class="btn rating good" @click="rate('good')">Gut <small>weiter so!</small></button></div></div></div>
      <div v-else class="session-done"><span class="done-mark"><Icon name="check" :size="38" /></span><div class="overline">GUT GEMACHT!</div><h2>Für heute gelernt.</h2><p>Du hast {{ completed }} {{ completed === 1 ? 'Karte' : 'Karten' }} wiederholt. Jeder kleine Schritt zählt!</p><button class="btn btn-primary" @click="active = false">Zur Übersicht <Icon name="arrow" :size="17" /></button></div></template>
    <p v-if="error" class="alert error" role="alert">{{ error }}</p>
  </div>
</template>
