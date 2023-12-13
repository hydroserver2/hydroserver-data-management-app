import { defineStore } from 'pinia'
import { ref } from 'vue'
import { DataArray, Datastream } from '@/types'
import {
  fetchObservations,
  calculateEffectiveStartTime,
} from '@/utils/observationsUtils'

export const useObservationsLast72Hours = defineStore(
  'observationsLast72Hours',
  () => {
    const observations = ref<Record<string, DataArray>>({})
    const mostRecentObs = ref<Record<string, [string, number]>>({})
    const loaded = ref<Record<string, boolean>>({})

    const getObservationsSince = async (id: string, startTime: string) => {
      try {
        let allData: DataArray = await fetchObservations(id, startTime)
        if (!allData || !allData.length) return

        updateObservations(id, allData)
      } catch (error) {
        console.error('Error fetching observations from DB.', error)
      } finally {
        loaded.value[id] = true
      }
    }

    const updateObservations = (id: string, data: DataArray) => {
      observations.value[id] = data
      mostRecentObs.value[id] = data[data.length - 1]
    }

    const fetchObservationsBulk = async (datastreams: Datastream[]) => {
      const observationPromises = datastreams
        .map((ds) => {
          if (ds.phenomenonEndTime && ds.phenomenonBeginTime) {
            let startTime = calculateEffectiveStartTime(
              ds.phenomenonBeginTime,
              ds.phenomenonEndTime,
              72
            )
            return getObservationsSince(ds.id, startTime)
          } else {
            loaded.value[ds.id] = true
          }
        })
        .filter(Boolean)

      await Promise.all(observationPromises)
    }

    return {
      observations,
      mostRecentObs,
      loaded,
      getObservationsSince,
      fetchObservationsBulk,
    }
  }
)
