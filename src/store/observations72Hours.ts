import { defineStore } from 'pinia'
import { DataArray } from '@/types'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  {
    state: () => ({
      observations: {} as Record<string, DataArray>,
    }),
    actions: {
      setObservations(id: string, data: DataArray) {
        const clonedData = JSON.parse(JSON.stringify(data))
        this.$patch({
          observations: { ...this.observations, [id]: clonedData },
        })
      },
    },
  }
)
