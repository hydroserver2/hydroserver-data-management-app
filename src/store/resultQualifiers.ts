import { defineStore } from 'pinia'
import { ResultQualifier } from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useResultQualifierStore = defineStore('resultQualifiers', {
  state: () => ({ resultQualifiers: [] as ResultQualifier[], loaded: false }),
  getters: {
    ownedResultQualifiers(): ResultQualifier[] {
      return this.resultQualifiers.filter((pl) => pl.personId != null)
    },
    unownedResultQualifiers(): ResultQualifier[] {
      return this.resultQualifiers.filter((pl) => pl.personId == null)
    },
  },
  actions: {
    sortResultQualifiers() {
      this.resultQualifiers.sort((a, b) => a.code.localeCompare(b.code))
    },
    async fetchResultQualifiers() {
      if (this.loaded) return
      try {
        const data = await api.fetch(ENDPOINTS.RESULT_QUALIFIERS)
        this.resultQualifiers = data
        this.sortResultQualifiers()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching result qualifiers from DB', error)
      }
    },
    async updateResultQualifier(procLevel: ResultQualifier) {
      try {
        await api.patch(
          ENDPOINTS.RESULT_QUALIFIERS.ID(procLevel.id),
          procLevel,
          this.getById(procLevel.id)
        )
        const index = this.resultQualifiers.findIndex(
          (pl) => pl.id === procLevel.id
        )
        if (index !== -1) this.resultQualifiers[index] = procLevel
        this.sortResultQualifiers()
      } catch (error) {
        console.error(`Error updating result qualifier with id`, error)
      }
    },
    async createResultQualifier(resultQualifier: ResultQualifier) {
      try {
        const data = await api.post(
          ENDPOINTS.RESULT_QUALIFIERS,
          resultQualifier
        )
        this.resultQualifiers.push(data)
        this.sortResultQualifiers()
        return data
      } catch (error) {
        console.error('Error creating result qualifier', error)
      }
    },
    async deleteResultQualifier(id: string) {
      try {
        await api.delete(ENDPOINTS.RESULT_QUALIFIERS.ID(id))
        this.resultQualifiers = this.resultQualifiers.filter(
          (pl) => pl.id !== id
        )
        this.sortResultQualifiers()
      } catch (error) {
        console.error('Error deleting result qualifier', error)
      }
    },
    getById(id: string) {
      const resultQualifier = this.resultQualifiers.find(
        (pl) => pl.id.toString() === id.toString()
      )
      if (!resultQualifier)
        throw new Error(`Result Qualifier with id ${id} not found`)
      return resultQualifier
    },
  },
})
