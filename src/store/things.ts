import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useThingStore = defineStore('things', () => {
  const things = ref<Record<string, Thing>>({})
  const loaded = ref(false)
  const fetching = ref(false)

  const primaryOwnedThings = computed(() =>
    Object.values(things.value).filter((thing) => thing.isPrimaryOwner)
  )

  const ownedThings = computed(() =>
    Object.values(things.value).filter((thing) => thing.ownsThing)
  )

  const fetchThings = async () => {
    try {
      const data = await api.fetch(ENDPOINTS.THINGS)
      things.value = Object.fromEntries(
        data.map((thing: Thing) => [thing.id, thing])
      )
      loaded.value = true
    } catch (error) {
      console.error('Error fetching things', error)
    }
  }

  const fetchThingById = async (id: string) => {
    if (fetching.value) return
    fetching.value = true
    try {
      const data = await api.fetch(ENDPOINTS.THINGS.ID(id))
      things.value[id] = data
      return things.value[id]
    } catch (error) {
      console.error('Error fetching thing by id', error)
    } finally {
      fetching.value = false
    }
  }

  const createThing = async (newThing: Thing) => {
    try {
      const data = await api.post(ENDPOINTS.THINGS, newThing)
      things.value[data.id] = data
      return data
    } catch (error) {
      console.error('Error creating thing', error)
    }
  }

  const updateThing = async (updatedThing: Thing) => {
    try {
      const data = await api.patch(
        ENDPOINTS.THINGS.ID(updatedThing.id),
        updatedThing
      )
      if (data) {
        things.value[updatedThing.id] = data
      }
    } catch (error) {
      console.error('Error updating thing', error)
    }
  }

  const updateThingPrivacy = async (id: string, thingPrivacy: boolean) => {
    try {
      const data = await api.patch(ENDPOINTS.THINGS.PRIVACY(id), {
        isPrivate: thingPrivacy,
      })
      things.value[id] = data
    } catch (error) {
      console.error('Error updating thing privacy', error)
    }
  }

  const deleteThing = async (thingId: string) => {
    try {
      await api.delete(ENDPOINTS.THINGS.ID(thingId))
      delete things.value[thingId]
    } catch (error) {
      console.error('Error deleting thing', error)
    }
  }

  const addSecondaryOwner = async (thingId: string, email: string) => {
    try {
      const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
        email: email,
        makeOwner: true,
      })
      things.value[thingId] = data
    } catch (error) {
      console.error('Error adding secondary owner', error)
    }
  }

  const transferPrimaryOwnership = async (thingId: string, email: string) => {
    try {
      const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
        email: email,
        transferPrimary: true,
      })
      things.value[thingId] = data
    } catch (error) {
      console.error('Error transferring thing ownership', error)
    }
  }

  const removeOwner = async (thingId: string, email: string) => {
    try {
      const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
        email: email,
        removeOwner: true,
      })
      things.value[thingId] = data
    } catch (error) {
      console.error('Error removing owner from thing', error)
    }
  }

  return {
    things,
    loaded,
    fetching,
    primaryOwnedThings,
    ownedThings,
    fetchThings,
    fetchThingById,
    createThing,
    updateThing,
    updateThingPrivacy,
    deleteThing,
    addSecondaryOwner,
    transferPrimaryOwnership,
    removeOwner,
  }
})
