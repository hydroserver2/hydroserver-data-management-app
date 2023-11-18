import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ObservationRecord } from '@/types'
import { fetchObservations } from '@/utils/observationsUtils'

export const useObservationStore = defineStore('observations', () => {
  const observations = ref<Record<string, ObservationRecord>>({})

  const updateObservations = (
    id: string,
    fetchedData: any[],
    beginTime: string
  ) => {
    observations.value[id] = {
      dataArray: fetchedData,
      beginTime: beginTime,
      loading: false,
    }
  }

  const getObservationsSince = async (id: string, beginTime: string) => {
    if (!observations.value[id]?.dataArray) {
      observations.value[id] = new ObservationRecord()
    } else {
      const storedBeginTime = observations.value[id].beginTime
      const storedBeginDate = new Date(storedBeginTime).getTime()
      const beginDate = new Date(beginTime).getTime()

      if (beginDate === storedBeginDate) {
        observations.value[id].loading = false
        return observations.value[id].dataArray
      } else if (beginDate > storedBeginDate) {
        observations.value[id].loading = false
        return observations.value[id].dataArray.filter(([dateString, _]) => {
          return beginDate < new Date(dateString).getTime()
        })
      }
    }

    observations.value[id].loading = true
    const fetchedData = await fetchObservations(id, beginTime)
    updateObservations(id, fetchedData, beginTime)
    return observations.value[id].dataArray
  }

  return {
    observations,
    updateObservations,
    getObservationsSince,
  }
})
