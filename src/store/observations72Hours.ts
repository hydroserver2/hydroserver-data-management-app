import { defineStore } from 'pinia'
import { DataArray, DataPoint } from '@/types'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  {
    state: () => ({
      observations: {} as Record<string, DataArray>,
      mostRecentObs: {} as Record<string, DataPoint>,
    }),
    actions: {
      setObservations(id: string, data: DataArray) {
        const clonedData = JSON.parse(JSON.stringify(data))
        this.$patch({
          observations: { ...this.observations, [id]: clonedData },
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
