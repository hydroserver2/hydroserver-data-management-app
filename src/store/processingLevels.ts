import { defineStore, storeToRefs } from 'pinia'
import { ProcessingLevel } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'
import { useUserStore } from '@/store/user'

export const useProcessingLevelStore = defineStore('processingLevels', {
  state: () => ({ processingLevels: [] as ProcessingLevel[], loaded: false }),
  getters: {
    ownedProcessingLevels(): ProcessingLevel[] {
      const { user } = storeToRefs(useUserStore())
      if (!user.value?.email) return []
      return this.processingLevels.filter((pl) => pl.owner === user.value.email)
    },
    unownedProcessingLevels(): ProcessingLevel[] {
      return this.processingLevels.filter((pl) => pl.owner == null)
    },
    dataByUser(): (ownerEmail: string) => ProcessingLevel[] {
      return (ownerEmail: string) =>
        this.processingLevels.filter((pl) => pl.owner === ownerEmail)
    },
  },
  actions: {
    sortProcessingLevels() {
      this.processingLevels.sort((a, b) => a.code.localeCompare(b.code))
    },
    async fetchProcessingLevels() {
      // if (this.loaded) return
      try {
        this.processingLevels = await api.fetch(ENDPOINTS.PROCESSING_LEVELS)
        this.sortProcessingLevels()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching processing levels from DB', error)
      }
    },
    async updateProcessingLevel(procLevel: ProcessingLevel) {
      try {
        await api.patch(
          ENDPOINTS.PROCESSING_LEVELS.ID(procLevel.id),
          procLevel,
          this.getById(procLevel.id)
        )
        const index = this.processingLevels.findIndex(
          (pl) => pl.id === procLevel.id
        )
        if (index !== -1) this.processingLevels[index] = procLevel
        this.sortProcessingLevels()
      } catch (error) {
        console.error(`Error updating processing level with id`, error)
      }
    },
    async createProcessingLevel(processingLevel: ProcessingLevel) {
      try {
        const data = await api.post(
          ENDPOINTS.PROCESSING_LEVELS,
          processingLevel
        )
        this.processingLevels.push(data)
        this.sortProcessingLevels()
        return data
      } catch (error) {
        console.error('Error creating processing level', error)
      }
    },
    async deleteProcessingLevel(id: string) {
      try {
        await api.delete(ENDPOINTS.PROCESSING_LEVELS.ID(id))
        this.processingLevels = this.processingLevels.filter(
          (pl) => pl.id !== id
        )
        this.sortProcessingLevels()
      } catch (error) {
        console.error('Error deleting processing level', error)
      }
    },
    getById(id: string) {
      const processingLevel = this.processingLevels.find(
        (pl) => pl.id.toString() === id.toString()
      )
      if (!processingLevel)
        throw new Error(`Processing Level with id ${id} not found`)
      return processingLevel
    },
  },
})
