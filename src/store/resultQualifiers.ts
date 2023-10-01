import { defineStore } from 'pinia'
import { ResultQualifier } from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useResultQualifierStore = defineStore('resultQualifiers', {
  state: () => ({ resultQualifiers: [] as ResultQualifier[], loaded: false }),
  getters: {
    ownedResultQualifiers(): ResultQualifier[] {
      return this.resultQualifiers.filter((rq) => rq.owner != null)
    },
    unownedResultQualifiers(): ResultQualifier[] {
      return this.resultQualifiers.filter((rq) => rq.owner == null)
    },
  },
  actions: {
    sortResultQualifiers() {
      this.resultQualifiers.sort((a, b) => a.code.localeCompare(b.code))
    },
    async fetchResultQualifiers() {
      if (this.loaded) return
      try {
        this.resultQualifiers = await api.fetch(ENDPOINTS.RESULT_QUALIFIERS)
        this.sortResultQualifiers()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching result qualifiers from DB', error)
      }
    },
    async updateResultQualifier(resultQualifier: ResultQualifier) {
      try {
        await api.patch(
          ENDPOINTS.RESULT_QUALIFIERS.ID(resultQualifier.id),
          resultQualifier,
          this.getById(resultQualifier.id)
        )
        const index = this.resultQualifiers.findIndex(
          (rq) => rq.id === resultQualifier.id
        )
        if (index !== -1) this.resultQualifiers[index] = resultQualifier
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
          (rq) => rq.id !== id
        )
        this.sortResultQualifiers()
      } catch (error) {
        console.error('Error deleting result qualifier', error)
      }
    },
    getById(id: string) {
      const resultQualifier = this.resultQualifiers.find(
        (rq) => rq.id.toString() === id.toString()
      )
      if (!resultQualifier)
        throw new Error(`Result Qualifier with id ${id} not found`)
      return resultQualifier
    },
  },
})
