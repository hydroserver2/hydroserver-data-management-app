import { useThingStore } from '@/store/things'
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/authentication'

export function useThingOwnership(thingId: string) {
  const authStore = useAuthStore()
  const thingStore = useThingStore()

  const newOwnerEmail = ref('')
  const newPrimaryOwnerEmail = ref('')
  const showPrimaryOwnerConfirmation = ref(false)

  const isOwner = computed(() => {
    if (authStore.isLoggedIn && thingStore.things[thingId]) {
      return thingStore.things[thingId].ownsThing
    }
    return false
  })

  const isPrimaryOwner = computed(() => {
    if (authStore.isLoggedIn && thingStore.things[thingId]) {
      return thingStore.things[thingId].isPrimaryOwner
    }
    return false
  })

  async function addSecondaryOwner() {
    if (newOwnerEmail.value) {
      await thingStore.addSecondaryOwner(thingId, newOwnerEmail.value)
      newOwnerEmail.value = ''
    }
  }

  async function transferPrimaryOwnership() {
    if (newPrimaryOwnerEmail.value) {
      await thingStore.transferPrimaryOwnership(
        thingId,
        newPrimaryOwnerEmail.value
      )
      newPrimaryOwnerEmail.value = ''
      showPrimaryOwnerConfirmation.value = false
    }
  }

  async function removeOwner(email: string) {
    if (email) await thingStore.removeOwner(thingId, email)
  }

  onMounted(async () => {
    await thingStore.fetchThingById(thingId)
  })

  return {
    newOwnerEmail,
    newPrimaryOwnerEmail,
    showPrimaryOwnerConfirmation,
    transferPrimaryOwnership,
    isOwner,
    isPrimaryOwner,
    addSecondaryOwner,
    removeOwner,
  }
}
