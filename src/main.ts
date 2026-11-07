import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import CaptureView from './views/CaptureView.vue'
import CollectionsView from './views/CollectionsView.vue'
import NoteView from './views/NoteView.vue'
import PracticeView from './views/PracticeView.vue'
import { db } from './data/db'
import './style.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CaptureView },
    { path: '/sammlungen', component: CollectionsView },
    { path: '/notiz/:id', component: NoteView },
    { path: '/ueben', component: PracticeView },
  ],
})

// A terminated browser tab cannot resume an in-flight request; make retries available.
void db.notes
  .where('ai_status')
  .equals('processing')
  .modify({ ai_status: 'pending' })
  .catch(() => {})
createApp(App).use(router).mount('#app')
