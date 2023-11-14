import { useThingStore } from '@/store/things'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { storeToRefs } from 'pinia'

export function useThingOwnership(thingId: string) {
  const { isLoggedIn } = storeToRefs(useAuthStore())
  const { things } = storeToRefs(useThingStore())
  const { fetchThingById } = useThingStore()

  const isOwner = computed(() => isLoggedIn && things.value[thingId]?.ownsThing)

  const isPrimaryOwner = computed(
    () => isLoggedIn && things.value[thingId]?.isPrimaryOwner
  )

  onMounted(async () => {
    await fetchThingById(thingId)
  })

  return {
    isOwner,
    isPrimaryOwner,
  }
}
