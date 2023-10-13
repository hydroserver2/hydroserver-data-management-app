import { defineStore } from 'pinia'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'
import { DataArray, DataPoint, Datastream } from '@/types'
import { useObservationsLast72Hours } from '@/store/observations72Hours'

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, DataArray>,
    mostRecentObs: {} as Record<string, DataPoint>,
  }),
  persist: false,
  actions: {
    async fetchObservations(
      id: string,
      hoursBefore: number,
      beginTime: string,
      endTime: string
    ) {
      // TODO: Probably move the startTime endTime calculations to a separate function
      // and fetch directly from the last72HourStore
      try {
        const last72HoursStore = useObservationsLast72Hours()
        if (hoursBefore == 72 && last72HoursStore.observations[id]) {
          this.observations[id] = last72HoursStore.observations[id]
          return
        }

        let startTime = beginTime
        if (hoursBefore > 0) {
          const calcStart = this.subtractHours(endTime, hoursBefore)
          if (new Date(calcStart) > new Date(beginTime)) startTime = calcStart
        }

        let allData: any = []
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

        const newObs = allData.map((item: [string, number]) => {
          return {
            date: new Date(item[0]),
            value: item[1],
          }
        })

        const end = new Date(endTime)
        const start72H = new Date(end)
        start72H.setHours(end.getHours() - 72)
        const last72Hours = newObs.filter((obs: DataPoint) => {
          return new Date(obs.date) >= start72H && new Date(obs.date) <= end
        })
        if (last72Hours && last72Hours.length > 0) {
          last72HoursStore.setObservations(id, last72Hours)
        }

        if (newObs && newObs.length > 0) {
          const mostRecent = newObs[newObs.length - 1]
          this.$patch({
            observations: { ...this.observations, [id]: newObs },
            mostRecentObs: { ...this.mostRecentObs, [id]: mostRecent },
          })
        }
      } catch (error) {
        console.error('Error fetching observations from DB.', error)
      }
    },
    async fetchObservationsBulk(datastreams: Datastream[], hours: number) {
      const observationPromises = datastreams
        .map((ds) => {
          if (ds.phenomenonEndTime && ds.phenomenonBeginTime) {
            return this.fetchObservations(
              ds.id,
              hours,
              ds.phenomenonBeginTime,
              ds.phenomenonEndTime
            )
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
