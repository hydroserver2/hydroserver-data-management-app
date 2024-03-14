import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Datastream, ObservationRecord, DataArray } from '@/types'
import { fetchObservationsParallel } from '@/utils/observationsUtils'

export const useObservationStore = defineStore('observations', () => {
  const observations = ref<Record<string, ObservationRecord>>({})

  /**
   * Fetches requested observations that aren't currently in the pinia store,
   * updates the store, then returns the requested observations.
   */
  const fetchObservationsInRange = async (
    datastream: Datastream,
    beginTime: string,
    endTime: string
  ) => {
    const id = datastream.id

    // If nothing is stored yet, create a new record and fetch the data in range
    if (!observations.value[id]?.dataArray) {
      console.log('creating new obs')
      observations.value[id] = {
        dataArray: [],
        beginTime,
        endTime,
        loading: true,
      }

      const fetchedData = await fetchObservationsParallel(
        datastream,
        beginTime,
        endTime
      )
      observations.value[id].dataArray = fetchedData
      observations.value[id].loading = false

      return fetchedData
    } else {
      const existingRecord = observations.value[id]
      const newBeginTime = new Date(beginTime).getTime()
      const newEndTime = new Date(endTime).getTime()
      const storedBeginTime = new Date(existingRecord.beginTime).getTime()
      const storedEndTime = new Date(existingRecord.endTime).getTime()

      let beginDataPromise = Promise.resolve([])
      let endDataPromise = Promise.resolve([])

      // Check if new data before the stored data is needed
      if (newBeginTime < storedBeginTime) {
        console.log('fetching new beginning data')

        beginDataPromise = fetchObservationsParallel(
          datastream,
          beginTime,
          existingRecord.beginTime
        )
      }

      // Check if new data after the stored data is needed
      if (newEndTime > storedEndTime) {
        console.log('New End data')

        endDataPromise = fetchObservationsParallel(
          datastream,
          existingRecord.endTime,
          endTime
        )
      }

      // Fetch and update in parallel if needed
      const [beginData, endData] = await Promise.all([
        beginDataPromise,
        endDataPromise,
      ])

      if (beginData.length > 0) {
        existingRecord.dataArray = [...beginData, ...existingRecord.dataArray]
        existingRecord.beginTime = beginTime
      }
      if (endData.length > 0) {
        existingRecord.dataArray = [...existingRecord.dataArray, ...endData]
        existingRecord.endTime = endTime
      }

      existingRecord.loading = false

      // Return only the data within the requested range
      return observations.value[id].dataArray.filter(([dateString, _]) => {
        const observationTimestamp = new Date(dateString).getTime()
        return (
          observationTimestamp >= newBeginTime &&
          observationTimestamp <= newEndTime
        )
      })
    }
  }

  return {
    observations,
    fetchObservationsInRange,
  }
})
