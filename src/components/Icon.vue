<script setup lang="ts">
defineProps<{ name: string; size?: number }>()
</script>

<template>
  <svg :width="size || 22" :height="size || 22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'paw'"><ellipse cx="7" cy="7.5" rx="1.4" ry="2"/><ellipse cx="12" cy="5.8" rx="1.4" ry="2"/><ellipse cx="17" cy="7.5" rx="1.4" ry="2"/><circle cx="20" cy="11.5" r="1.25"/><path d="M12 11c-3 0-3.8 3.5-6 5.2-2.4 1.8-.3 5.7 2.9 4.3a5.7 5.7 0 0 1 6.2 0c3.2 1.5 5.3-2.5 2.9-4.3C15.8 14.5 15 11 12 11Z"/></template>
    <template v-else-if="name === 'plus'"><path d="M12 5v14M5 12h14"/></template>
    <template v-else-if="name === 'book'"><path d="M12 5.5c-2-1.7-5.6-2.1-9-1.1v14c3.4-1 7-.6 9 1.1 2-1.7 5.6-2.1 9-1.1v-14c-3.4-1-7-.6-9 1.1Zm0 0v14"/></template>
    <template v-else-if="name === 'cards'"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 2h8a4 4 0 0 1 4 4v10M9 11h6m-6 4h4"/></template>
    <template v-else-if="name === 'arrow'"><path d="M5 12h14m-6-6 6 6-6 6"/></template>
    <template v-else-if="name === 'back'"><path d="M19 12H5m6-6-6 6 6 6"/></template>
    <template v-else-if="name === 'search'"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></template>
    <template v-else-if="name === 'sparkle'"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 14 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></template>
    <template v-else-if="name === 'clock'"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></template>
    <template v-else-if="name === 'check'"><path d="m4 12 5 5L20 6"/></template>
    <template v-else-if="name === 'more'"><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></template>
    <template v-else-if="name === 'download'"><path d="M12 3v12m-4-4 4 4 4-4M4 17v3h16v-3"/></template>
    <template v-else-if="name === 'upload'"><path d="M12 16V4m-4 4 4-4 4 4M4 17v3h16v-3"/></template>
    <template v-else-if="name === 'trash'"><path d="M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6"/></template>
    <template v-else-if="name === 'leaf'"><path d="M20 3C9 3 4 7 4 14a7 7 0 0 0 7 7c7 0 11-7 9-18ZM4 20c3-5 7-9 12-11"/></template>
  </svg>
</template>
