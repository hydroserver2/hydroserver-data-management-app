import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/api'

export const useThingStore = defineStore('things', () => {
  const things = ref<Record<string, Thing>>({})
  const fetching = ref(false)

  const fetchThings = async () => {
    try {
      const data = await api.fetchThings()
      things.value = Object.fromEntries(
        data.map((thing: Thing) => [thing.id, thing])
      )
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
    fetching,
    fetchThings,
    fetchThingById,
  }
})
