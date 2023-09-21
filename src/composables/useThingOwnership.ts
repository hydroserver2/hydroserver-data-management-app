import { useAuthentication } from './useAuthentication'
import { useThingStore } from '@/store/things'
import { computed, ref, onMounted } from 'vue'

export function useThingOwnership(thingId: string) {
  const { isAuthenticated } = useAuthentication()
  const thingStore = useThingStore()

  const newOwnerEmail = ref('')
  const newPrimaryOwnerEmail = ref('')
  const showPrimaryOwnerConfirmation = ref(false)

  const isOwner = computed(() => {
    if (isAuthenticated && thingStore.things[thingId]) {
      return thingStore.things[thingId].ownsThing
    }
    return false
  })

  const isPrimaryOwner = computed(() => {
    if (isAuthenticated && thingStore.things[thingId]) {
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
