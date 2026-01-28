import { defineStore } from 'pinia'
import { ref } from 'vue'
import hs, { Datastream, GraphSeries, DataPoint } from '@hydroserver/client'
import {
  fetchObservations,
  preProcessData,
  ObservationArray,
} from '@/utils/observationsUtils'
import { Snackbar } from '@/utils/notifications'

export const useObservationStore = defineStore('observations', () => {
  type ObservationRecordLocal = {
    dataArray: ObservationArray
    beginTime: string
    endTime: string
    loading: boolean
  }

  type ObservationRaw = {
    datetimes: Float64Array
    dataValues: Float32Array
  }

  const observations = ref<Record<string, ObservationRecordLocal>>({})
  const observationsRaw = ref<Record<string, ObservationRaw>>({})

  const parseObservationRows = (rows: ObservationArray) => {
    const length = rows.length
    const datetimes = new Float64Array(length)
    const dataValues = new Float32Array(length)
    for (let i = 0; i < length; i += 1) {
      const [dateValue, rawValue] = rows[i]
      const time =
        typeof dateValue === 'number' ? dateValue : Date.parse(dateValue)
      datetimes[i] = Number.isFinite(time) ? time : NaN
      dataValues[i] =
        typeof rawValue === 'number' ? rawValue : Number(rawValue)
    }
    return { datetimes, dataValues }
  }

  const findFirstGreaterOrEqual = (arr: Float64Array, value: number) => {
    let low = 0
    let high = arr.length
    while (low < high) {
      const mid = Math.floor((low + high) / 2)
      if (arr[mid] < value) {
        low = mid + 1
      } else {
        high = mid
      }
    }
    return low
  }

  const sliceRawToRows = (
    raw: ObservationRaw,
    beginTime: number,
    endTime: number
  ): ObservationArray => {
    if (!raw.datetimes.length) return []
    const startIdx = findFirstGreaterOrEqual(raw.datetimes, beginTime)
    const endIdx = findFirstGreaterOrEqual(raw.datetimes, endTime + 1)
    const rows: ObservationArray = []
    for (let i = startIdx; i < endIdx; i += 1) {
      rows.push([raw.datetimes[i], raw.dataValues[i]])
    }
    return rows
  }

  /**
   * Fetches requested observations that aren't currently in the pinia store,
   * updates the store, then returns the requested observations.
   */
  const fetchObservationsInRange = async (
    datastream: Datastream,
    beginTime: string,
    endTime: string
  ): Promise<ObservationArray> => {
    const id = datastream.id
    const newBeginTime = Date.parse(beginTime)
    const newEndTime = Date.parse(endTime)

    // If nothing is stored yet, create a new record and fetch the data in range
    if (!observations.value[id]?.dataArray) {
      observations.value[id] = {
        dataArray: [],
        beginTime,
        endTime,
        loading: true,
      }

      const fetchedData = (await fetchObservations(
        datastream,
        beginTime,
        endTime
      )) as ObservationArray
      observationsRaw.value[id] = parseObservationRows(fetchedData)
      observations.value[id].dataArray = []
      observations.value[id].loading = false

      return fetchedData
    } else {
      const existingRecord = observations.value[id]
      const storedBeginTime = new Date(existingRecord.beginTime).getTime()
      const storedEndTime = new Date(existingRecord.endTime).getTime()

      let beginDataPromise: Promise<ObservationArray> = Promise.resolve([])
      let endDataPromise: Promise<ObservationArray> = Promise.resolve([])

      // Check if new data before the stored data is needed
      if (newBeginTime < storedBeginTime) {
        const storedStart = storedBeginTime - 1000
        beginDataPromise = fetchObservations(
          datastream,
          beginTime,
          new Date(storedStart).toISOString()
        ) as Promise<ObservationArray>
      }

      // Check if new data after the stored data is needed
      if (newEndTime > storedEndTime) {
        const storedEnd = storedEndTime + 1000
        endDataPromise = fetchObservations(
          datastream,
          new Date(storedEnd).toISOString(),
          endTime
        ) as Promise<ObservationArray>
      }

      // Fetch and update in parallel if needed
      const [beginData, endData] = await Promise.all([
        beginDataPromise,
        endDataPromise,
      ])

      const hasBegin = beginData.length > 0
      const hasEnd = endData.length > 0
      if (hasBegin || hasEnd) {
        const existingRaw =
          observationsRaw.value[id] ||
          parseObservationRows(existingRecord.dataArray)
        const beginRaw = hasBegin ? parseObservationRows(beginData) : null
        const endRaw = hasEnd ? parseObservationRows(endData) : null

        const beginLen = beginRaw?.datetimes.length || 0
        const existingLen = existingRaw.datetimes.length
        const endLen = endRaw?.datetimes.length || 0
        const newLength = beginLen + existingLen + endLen

        const newDatetimes = new Float64Array(newLength)
        const newValues = new Float32Array(newLength)

        let offset = 0
        if (beginRaw) {
          newDatetimes.set(beginRaw.datetimes, offset)
          newValues.set(beginRaw.dataValues, offset)
          offset += beginLen
        }
        newDatetimes.set(existingRaw.datetimes, offset)
        newValues.set(existingRaw.dataValues, offset)
        offset += existingLen
        if (endRaw) {
          newDatetimes.set(endRaw.datetimes, offset)
          newValues.set(endRaw.dataValues, offset)
        }

        observationsRaw.value[id] = {
          datetimes: newDatetimes,
          dataValues: newValues,
        }
      } else if (!observationsRaw.value[id]) {
        observationsRaw.value[id] = parseObservationRows(existingRecord.dataArray)
      }

      if (hasBegin) {
        existingRecord.beginTime = beginTime
      }
      if (hasEnd) {
        existingRecord.endTime = endTime
      }

      existingRecord.loading = false

      const raw = observationsRaw.value[id]
      if (raw) {
        return sliceRawToRows(raw, newBeginTime, newEndTime)
      }

      // Return only the data within the requested range
      return observations.value[id].dataArray.filter(([dateString, _]) => {
        const observationTimestamp =
          typeof dateString === 'number'
            ? dateString
            : new Date(dateString).getTime()
        return (
          observationTimestamp >= newBeginTime &&
          observationTimestamp <= newEndTime
        )
      })
    }
  }

  const fetchGraphSeriesData = async (
    datastream: Datastream,
    start: string,
    end: string
  ): Promise<DataPoint[]> => {
    const observations = await fetchObservationsInRange(
      datastream,
      start,
      end
    ).catch((error) => {
      Snackbar.error('Failed to fetch observations')
      console.error('Failed to fetch observations:', error)
      return []
    })

    return preProcessData(observations, datastream)
  }

  const fetchGraphSeries = async (
    datastream: Datastream,
    start: string,
    end: string
  ): Promise<GraphSeries> => {
    const observationsPromise = fetchObservationsInRange(
      datastream,
      start,
      end
    ).catch((error) => {
      Snackbar.error('Failed to fetch observations')
      console.error('Failed to fetch observations:', error)
      return null
    })
    const fetchUnitPromise = hs.units
      .getItem(datastream.unitId)
      .catch((error) => {
        console.error('Failed to fetch Unit:', error)
        return null
      })
    const fetchObservedPropertyPromise = hs.observedProperties
      .getItem(datastream.observedPropertyId)
      .catch((error) => {
        console.error('Failed to fetch ObservedProperty:', error)
        return null
      })

    const [observations, unit, observedProperty] = await Promise.all([
      observationsPromise,
      fetchUnitPromise,
      fetchObservedPropertyPromise,
    ])

    const processedData = preProcessData(observations ?? [], datastream)

    const yAxisLabel =
      observedProperty && unit
        ? `${observedProperty.name} (${unit.symbol})`
        : 'Unknown'

    return {
      id: datastream.id,
      name: datastream.name,
      data: processedData,
      yAxisLabel,
      lineColor: '#5571c7', // default to blue,
    } as GraphSeries
  }

  return {
    observations,
    observationsRaw,
    fetchObservationsInRange,
    fetchGraphSeriesData,
    fetchGraphSeries,
  }
})
