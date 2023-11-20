import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ProcessingLevel } from '@/types'
import { api } from '@/services/api'
import { useUserStore } from '@/store/user'

export const useProcessingLevelStore = defineStore('processingLevels', () => {
  const processingLevels = ref<ProcessingLevel[]>([])
  const loaded = ref(false)

  const userStore = useUserStore()

  const ownedProcessingLevels = computed(() => {
    if (!userStore.user.email) return []
    return processingLevels.value.filter(
      (pl) => pl.owner === userStore.user.email
    )
  })

  const unownedProcessingLevels = computed(() =>
    processingLevels.value.filter((pl) => pl.owner == null)
  )

  const sortProcessingLevels = () => {
    processingLevels.value.sort((a, b) => a.code.localeCompare(b.code))
  }

  const fetchProcessingLevels = async () => {
    try {
      processingLevels.value = await api.fetchProcessingLevels()
      sortProcessingLevels()
      loaded.value = true
    } catch (error) {
      console.error('Error fetching processing levels from DB', error)
    }
  }

  const updateProcessingLevel = async (procLevel: ProcessingLevel) => {
    try {
      await api.updateProcessingLevel(procLevel)
      const index = processingLevels.value.findIndex(
        (pl) => pl.id === procLevel.id
      )
      if (index !== -1) processingLevels.value[index] = procLevel
      sortProcessingLevels()
    } catch (error) {
      console.error(`Error updating processing level with id`, error)
    }
  }

  const createProcessingLevel = async (processingLevel: ProcessingLevel) => {
    try {
      const data = await api.createProcessingLevel(processingLevel)
      processingLevels.value.push(data)
      sortProcessingLevels()
      return data
    } catch (error) {
      console.error('Error creating processing level', error)
    }
  }

  const deleteProcessingLevel = async (id: string) => {
    try {
      await api.deleteProcessingLevel(id)
      processingLevels.value = processingLevels.value.filter(
        (pl) => pl.id !== id
      )
      sortProcessingLevels()
    } catch (error) {
      console.error('Error deleting processing level', error)
    }
  }

  const getById = (id: string) => {
    const processingLevel = processingLevels.value.find(
      (pl) => pl.id.toString() === id.toString()
    )
    if (!processingLevel)
      throw new Error(`Processing Level with id ${id} not found`)
    return processingLevel
  }

  return {
    processingLevels,
    loaded,
    ownedProcessingLevels,
    unownedProcessingLevels,
    sortProcessingLevels,
    fetchProcessingLevels,
    updateProcessingLevel,
    createProcessingLevel,
    deleteProcessingLevel,
    getById,
  }
})
