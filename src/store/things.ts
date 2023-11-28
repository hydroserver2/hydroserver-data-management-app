import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/api'

export const useThingStore = defineStore('things', () => {
  const things = ref<Record<string, Thing>>({})
  const loaded = ref(false)
  const fetching = ref(false)

  const ownedThings = computed(() =>
    Object.values(things.value).filter((thing) => thing.ownsThing)
  )

  const fetchThings = async () => {
    try {
      const data = await api.fetchThings()
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
      things.value[id] = await api.fetchThing(id)
      return things.value[id]
    } catch (error) {
      console.error('Error fetching thing by id', error)
    } finally {
      fetching.value = false
    }
  }

  return {
    things,
    loaded,
    fetching,
    ownedThings,
    fetchThings,
    fetchThingById,
  }
})
