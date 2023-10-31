import { defineStore } from 'pinia'
import { DataArray, Datastream } from '@/types'
import {
  fetchObservations,
  calculateEffectiveStartTime,
} from '@/utils/observationsUtils'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  {
    state: () => ({
      observations: {} as Record<string, DataArray>,
      mostRecentObs: {} as Record<string, [string, number]>,
      loaded: {} as Record<string, Boolean>,
    }),
    actions: {
      async getObservationsSince(id: string, startTime: string) {
        try {
          if (this.observations[id]) {
            this.loaded[id] = true
            return
          }

          let allData: DataArray = await fetchObservations(id, startTime)
          if (!allData || !allData.length) return

          this.updateObservations(id, allData)
        } catch (error) {
          console.error('Error fetching observations from DB.', error)
        } finally {
          this.loaded[id] = true
        }
      },
      updateObservations(id: string, data: DataArray) {
        const mostRecent = data[data.length - 1]
        this.$patch({
          observations: { ...this.observations, [id]: data },
          mostRecentObs: { ...this.mostRecentObs, [id]: mostRecent },
          loaded: { ...this.loaded, [id]: true },
        })
      },
      async fetchObservationsBulk(datastreams: Datastream[]) {
        const last72HoursStore = useObservationsLast72Hours()
        const observationPromises = datastreams
          .map((ds) => {
            if (ds.phenomenonEndTime && ds.phenomenonBeginTime) {
              let startTime = calculateEffectiveStartTime(
                ds.phenomenonBeginTime,
                ds.phenomenonEndTime,
                72
              )
              return this.getObservationsSince(ds.id, startTime)
            } else {
              last72HoursStore.loaded[ds.id] = true
            }
          })
          .filter(Boolean)
        await Promise.all(observationPromises)
      },
    },
  }
)
