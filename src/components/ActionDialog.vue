<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    confirmLabel: string
    tone?: 'normal' | 'danger'
    busy?: boolean
  }>(),
  { tone: 'normal', busy: false },
)
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const element = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  (visible) => {
    if (visible && !element.value?.open) element.value?.showModal()
    if (!visible && element.value?.open) element.value.close()
  },
  { immediate: true, flush: 'post' },
)

function outside(event: MouseEvent) {
  if (event.target === element.value && !props.busy) emit('cancel')
}
</script>

<template>
  <Teleport to="body">
    <dialog
      ref="element"
      class="action-dialog"
      :aria-label="title"
      @click="outside"
      @cancel.prevent="!busy && emit('cancel')"
      @close="open && emit('cancel')"
    >
      <div class="dialog-body">
        <h2>{{ title }}</h2>
        <div class="dialog-description"><slot /></div>
        <div class="dialog-actions">
          <button class="btn btn-quiet" :disabled="busy" autofocus @click="emit('cancel')">
            Abbrechen
          </button>
          <button
            :class="['btn', tone === 'danger' ? 'btn-danger' : 'btn-primary']"
            :disabled="busy"
            @click="emit('confirm')"
          >
            {{ busy ? 'Bitte warten …' : confirmLabel }}
          </button>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
