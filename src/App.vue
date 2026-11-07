<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import Icon from './components/Icon.vue'
import { db } from './data/db'
import { useLive } from './data/live'

const route = useRoute()
const cards = useLive(() => db.flashcards.toArray(), [])
const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })
const online = ref(navigator.onLine)
window.addEventListener('online', () => {
  online.value = true
})
window.addEventListener('offline', () => {
  online.value = false
})
const links = [
  { to: '/', label: 'Erfassen', icon: 'plus' },
  { to: '/sammlungen', label: 'Sammlungen', icon: 'book' },
  { to: '/ueben', label: 'Üben', icon: 'cards' },
]
</script>

<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink to="/" class="brand"
        ><span class="brand-mark"><Icon name="dog" :size="32" /></span
        ><span
          >Feini<span class="brand-light">pedia</span><small>DEIN HUNDEWISSENSBUCH</small></span
        ></RouterLink
      >
      <nav class="side-nav" aria-label="Hauptnavigation">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="[
            'side-link',
            {
              active:
                route.path === link.to ||
                (link.to === '/sammlungen' && route.path.startsWith('/notiz/')),
            },
          ]"
        >
          <Icon :name="link.icon" :size="20" />{{ link.label
          }}<span v-if="link.to === '/ueben' && cards.length" class="nav-count">{{
            cards.length
          }}</span>
        </RouterLink>
      </nav>
    </aside>

    <div class="main-area">
      <header class="topbar">
        <RouterLink to="/" class="mobile-brand"
          ><span class="brand-mark"><Icon name="dog" :size="27" /></span>Feinipedia</RouterLink
        >
        <span v-if="!online" class="connection"
          ><span class="status-dot offline"></span>Offline-Modus</span
        >
      </header>
      <main class="content"><RouterView /></main>
      <div v-if="needRefresh" class="update-toast" role="status">
        Eine neue Version ist bereit.
        <button @click="updateServiceWorker()">Jetzt aktualisieren</button>
      </div>
    </div>

    <nav class="bottom-nav" aria-label="Hauptnavigation">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        :class="{
          active:
            route.path === link.to ||
            (link.to === '/sammlungen' && route.path.startsWith('/notiz/')),
        }"
        ><Icon :name="link.icon" :size="22" /><span>{{ link.label }}</span></RouterLink
      >
    </nav>
  </div>
</template>
