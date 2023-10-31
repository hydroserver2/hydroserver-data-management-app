import { defineStore } from 'pinia'
import { ObservationRecord } from '@/types'
import { fetchObservations } from '@/utils/observationsUtils'
import { DataArray } from '@/types'

export const useObservationStore = defineStore('observations', {
  state: () => ({
    observations: {} as Record<string, ObservationRecord>,
  }),
  persist: false,
  actions: {
    updateObservations(id: string, fetchedData: DataArray, beginTime: string) {
      this.$patch({
        observations: {
          ...this.observations,
          [id]: {
            dataArray: fetchedData,
            beginTime: beginTime,
            loading: false,
          },
        },
      })
    },
    async getObservationsSince(id: string, beginTime: string) {
      if (!this.observations[id]) {
        this.observations[id] = new ObservationRecord()
        this.observations[id].loading = true
        const fetchedData = await fetchObservations(id, beginTime)
        this.updateObservations(id, fetchedData, beginTime)
        return fetchedData
      }

      this.observations[id].loading = true
      const storedBeginTime = this.observations[id].beginTime
      const storedBeginDate = new Date(storedBeginTime).getTime()
      const beginDate = new Date(beginTime).getTime()

      if (beginDate === storedBeginDate) {
        this.observations[id].loading = false
        return this.observations[id].dataArray
      } else if (beginDate > storedBeginDate) {
        this.observations[id].loading = false
        return this.observations[id].dataArray.filter(([dateString, _]) => {
          return beginDate < new Date(dateString).getTime()
        })
      }

      const newData = await fetchObservations(id, beginTime, storedBeginTime)
      const aggregatedData = [...newData, ...this.observations[id].dataArray]
      this.updateObservations(id, aggregatedData, beginTime)

      return this.observations[id].dataArray
    },
  },
})
