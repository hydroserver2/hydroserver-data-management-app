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
    async fetchObservations(id: string, hoursBefore: number, endTime: string) {
      try {
        const last72HoursStore = useObservationsLast72Hours()
        if (hoursBefore == 72 && last72HoursStore.observations[id]) {
          this.observations[id] = last72HoursStore.observations[id]
          return
        }

        const startTime = this.subtractHours(endTime, hoursBefore)
        const data = await api.fetch(
          ENDPOINTS.SENSORTHINGS.DATASTREAMS.OBSERVATIONS(id, startTime)
        )

        const dataArray = data.values[0].dataArray
        const newObs = dataArray.map((item: [string, number]) => {
          return {
            date: item[0],
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

        // let allData: any = []
        // let nextLink = ENDPOINTS.SENSORTHINGS.DATASTREAMS.OBSERVATIONS(
        //   id,
        //   startTime
        // )
        // console.log('initial Link', nextLink)

        // // While nextLink is available, keep fetching more data
        // while (nextLink) {
        //   const data = await api.fetch(nextLink)
        //   console.log('observations', data)

        //   if (data.values && data.values[0] && data.values[0].dataArray) {
        //     allData = allData.concat(data.values[0].dataArray)
        //   }

        //   // Update nextLink if available
        //   nextLink = data['@iot.nextLink'] || null
        //   console.log('next Link', nextLink)
        // }

        // const newObs = allData.map((item: [string, number]) => {
        //   return {
        //     date: new Date(item[0]),
        //     value: item[1],
        //   }
        // })
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
            return this.fetchObservations(ds.id, hours, ds.phenomenonEndTime)
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
