import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'
import { DataArray, DataPoint, Datastream } from '@/types'

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, DataArray>,
    mostRecentObs: {} as Record<string, DataPoint>,
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
        if (newObs && newObs.length > 0) {
          const mostRecent = newObs[newObs.length - 1]
          this.$patch({
            observations: { ...this.observations, [id]: newObs },
            mostRecentObs: { ...this.mostRecentObs, [id]: mostRecent },
          })
        }
      } catch (error) {
        console.error('Error fetching observations from DB', error)
      }
    },
    async fetchObservationsBulk(datastreams: Datastream[], hours: number) {
      const observationPromises = datastreams
        .map((ds) => {
          if (ds.phenomenonEndTime) {
            const startTime = this.subtractHours(ds.phenomenonEndTime, hours)
            return this.fetchObservations(ds['id'], startTime)
          }
        })
        .filter(Boolean)
      await Promise.all(observationPromises)
    },
    // TODO: Fetch observations for thingId
    subtractHours(timestamp: string, hours: number): string {
      const date = new Date(timestamp)
      date.setHours(date.getHours() - hours)
      return date.toISOString()
    },
  },
})
