import { useThingStore } from '@/store/things'
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { storeToRefs } from 'pinia'

export function useThingOwnership(thingId: string) {
  const { isLoggedIn } = storeToRefs(useAuthStore())
  const { things } = storeToRefs(useThingStore())
  const {
    addSecondaryOwner,
    transferPrimaryOwnership,
    removeOwner,
    fetchThingById,
  } = useThingStore()

  const newOwnerEmail = ref('')
  const newPrimaryOwnerEmail = ref('')
  const showPrimaryOwnerConfirmation = ref(false)

  const isOwner = computed(() => isLoggedIn && things.value[thingId]?.ownsThing)

  const isPrimaryOwner = computed(
    () => isLoggedIn && things.value[thingId]?.isPrimaryOwner
  )

  async function onAddSecondaryOwner() {
    if (newOwnerEmail.value) {
      await addSecondaryOwner(thingId, newOwnerEmail.value)
      newOwnerEmail.value = ''
    }
  }

  async function onTransferPrimaryOwnership() {
    if (newPrimaryOwnerEmail.value) {
      await transferPrimaryOwnership(thingId, newPrimaryOwnerEmail.value)
      newPrimaryOwnerEmail.value = ''
      showPrimaryOwnerConfirmation.value = false
    }
  }

  async function onRemoveOwner(email: string) {
    if (email) await removeOwner(thingId, email)
  }

  onMounted(async () => {
    await fetchThingById(thingId)
  })

  return {
    newOwnerEmail,
    newPrimaryOwnerEmail,
    showPrimaryOwnerConfirmation,
    onTransferPrimaryOwnership,
    isOwner,
    isPrimaryOwner,
    onAddSecondaryOwner,
    onRemoveOwner,
  }
}
