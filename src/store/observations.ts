import { defineStore } from 'pinia'
import { Observation } from '@/types'

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, Observation>,
    loaded: false,
  }),
  actions: {
    async fetchObservations() {
      if (this.loaded) return
      try {
        const { data } = await this.$http.get('/data/observations')
        const observationsDictionary = data.reduce(
          (acc: Record<string, Observation>, observation: Observation) => {
            acc[observation.id] = observation
            return acc
          },
          {} as Record<string, Observation>
        )
        this.$patch({ observations: observationsDictionary, loaded: true })
      } catch (error) {
        console.error('Error fetching observations from DB', error)
      }
    },
  },
})
