import { defineStore } from 'pinia'
import { DataArray, DataPoint } from '@/types'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  {
    state: () => ({
      observations: {} as Record<string, DataArray>,
      mostRecentObs: {} as Record<string, DataPoint>,
      loaded: {} as Record<string, Boolean>,
    }),
    actions: {
      setObservations(id: string, data: DataArray) {
        const clonedData = JSON.parse(JSON.stringify(data))
        this.$patch({
          observations: { ...this.observations, [id]: clonedData },
          loaded: { ...this.loaded, [id]: true },
        })
      },
      setMostRecentObs(id: string, obs: DataArray) {
        const mostRecent = obs[obs.length - 1]
        this.$patch({
          mostRecentObs: { ...this.mostRecentObs, [id]: mostRecent },
        })
      },
    },
  }
)
