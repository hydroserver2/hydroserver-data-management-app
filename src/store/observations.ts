import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

interface DataArray {
  date: string
  value: number
}

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, DataArray>,
  }),
  persist: false,
  actions: {
    async fetchObservations(id: string, timestamp: string) {
      try {
        const data = await api.fetch(
          ENDPOINTS.SENSORTHINGS.DATASTREAMS.OBSERVATIONS(id, timestamp)
        )
        const dataArray = data.values[0].dataArray
        const newObs = dataArray.map((item: [string, number]) => {
          return {
            date: new Date(item[0]),
            value: item[1],
          }
        })
        this.$patch({ observations: { ...this.observations, [id]: newObs } })
      } catch (error) {
        console.error('Error fetching observations from DB', error)
      }
    },
    // TODO: Fetch observations for thingId
    subtractHours(timestamp: string, hours: number): string {
      const date = new Date(timestamp)
      date.setHours(date.getHours() - hours)
      return date.toISOString()
    },
  },
})
