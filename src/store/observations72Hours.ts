import { defineStore } from 'pinia'
import { DataArray } from '@/types'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  {
    state: () => ({
      observations: {} as Record<string, DataArray>,
      mostRecentObs: {} as Record<string, [string, number]>,
      loaded: {} as Record<string, Boolean>,
    }),
    actions: {
      setObservations(id: string, data: DataArray) {
        this.$patch({
          observations: { ...this.observations, [id]: data },
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
