import { liveQuery } from 'dexie'
import { onUnmounted, shallowRef, type ShallowRef } from 'vue'

export function useLive<T>(query: () => Promise<T>, initial: T): ShallowRef<T> {
  const value = shallowRef(initial) as ShallowRef<T>
  const subscription = liveQuery(query).subscribe({ next: result => { value.value = result }, error: error => console.error('Lokale Daten konnten nicht geladen werden.', error) })
  onUnmounted(() => subscription.unsubscribe())
  return value
}
