import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'
import { DataArray, Datastream, ObservationRecord } from '@/types'
import { useObservationsLast72Hours } from '@/store/observations72Hours'

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, ObservationRecord>,
  }),
  persist: false,
  actions: {
    async fetchObservations(
      id: string,
      hoursBefore: number,
      beginTime: string,
      endTime: string
    ) {
      const last72HoursStore = useObservationsLast72Hours()

      try {
        // Check if this.observations[id] exists, if not, initialize it
        if (!this.observations[id]) {
          this.observations[id] = {
            dataArray: [],
            beginTime: '',
            endTime: '',
            loading: false,
          }
        }

        // If we have cached data, just set this store and return
        if (hoursBefore == 72 && last72HoursStore.observations[id]) {
          this.observations[id].dataArray = last72HoursStore.observations[id]
          last72HoursStore.loaded[id] = true
          return
        }

        // If the requested time frame is bigger than the data we have, start at the first data point
        let startTime = beginTime
        if (hoursBefore > 0) {
          const calcStart = this.subtractHours(endTime, hoursBefore)
          if (new Date(calcStart) > new Date(beginTime)) startTime = calcStart
        }

        // Keep calling paginated data and combine
        let allData: DataArray = []
        let nextLink = ENDPOINTS.SENSORTHINGS.DATASTREAMS.OBSERVATIONS(
          id,
          startTime
        )

        while (nextLink) {
          const data = await api.fetch(nextLink)
          if (data.value && data.value[0] && data.value[0].dataArray) {
            allData = allData.concat(data.value[0].dataArray)
          }
          nextLink = data['@iot.nextLink'] || null
        }

        // Update 72Hours Store to match
        const end = new Date(endTime)
        const start72H = new Date(end.getTime() - 72 * 3600000)
        const last72Hours = allData.filter(
          (obs: [string, number]) => new Date(obs[0]) >= start72H
        )

        if (last72Hours && last72Hours.length > 0) {
          last72HoursStore.setObservations(id, last72Hours)
          last72HoursStore.setMostRecentObs(id, allData)
        }

        // Update store
        if (!allData || !allData.length) return

        this.$patch({
          observations: {
            ...this.observations,
            [id]: {
              dataArray: allData,
              beginTime: beginTime,
              endTime: endTime,
              loading: false,
            },
          },
        })
      } catch (error) {
        console.error('Error fetching observations from DB.', error)
      } finally {
        last72HoursStore.loaded[id] = true
      }
    },
    async fetchObservationsBulk(datastreams: Datastream[], hours: number) {
      const last72HoursStore = useObservationsLast72Hours()
      const observationPromises = datastreams
        .map((ds) => {
          if (ds.phenomenonEndTime && ds.phenomenonBeginTime) {
            return this.fetchObservations(
              ds.id,
              hours,
              ds.phenomenonBeginTime,
              ds.phenomenonEndTime
            )
          } else {
            last72HoursStore.loaded[ds.id] = true
          }
        })
        .filter(Boolean)
      await Promise.all(observationPromises)
    },
    subtractHours(timestamp: string, hours: number): string {
      const date = new Date(timestamp)
      date.setHours(date.getHours() - hours)
      return date.toISOString()
    },
  },
})
