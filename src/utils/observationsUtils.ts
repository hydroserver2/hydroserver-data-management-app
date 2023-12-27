import { DataArray, DataPoint, Datastream } from '@/types'
import { api, getObservationsEndpoint } from '@/services/api'

export function subtractHours(timestamp: string, hours: number): string {
  const date = new Date(timestamp)
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

export async function fetchObservations(
  id: string,
  startTime: string,
  endTime?: string
) {
  let allData: DataArray = []
  const pageSize = 100_000
  let nextLink = getObservationsEndpoint(id, pageSize, startTime, endTime)

  while (nextLink) {
    const data = await api.fetchObservations(nextLink)
    if (data.value && data.value[0] && data.value[0].dataArray) {
      allData = allData.concat(data.value[0].dataArray)
    }
    nextLink = data['@iot.nextLink'] || null
  }

  return allData
}

export const fetchObservationsParallel = async (
  datastream: Datastream,
  startTime: string | null = null
) => {
  const { id, phenomenonBeginTime, phenomenonEndTime, valueCount } = datastream
  if (!phenomenonBeginTime || !phenomenonEndTime) return

  const pageSize = 50_000
  const endpoints: string[] = []
  let skipCount = 0
  while (skipCount < valueCount) {
    endpoints.push(
      getObservationsEndpoint(
        id,
        pageSize,
        startTime ? startTime : phenomenonBeginTime,
        phenomenonEndTime,
        skipCount
      )
    )
    skipCount += pageSize
  }

  try {
    const results = await Promise.all(
      endpoints.map((endpoint) => api.fetchObservations(endpoint))
    )
    return results.reduce((acc, data) => {
      if (data?.value?.length > 0 && data.value[0].dataArray) {
        return acc.concat(data.value[0].dataArray)
      }
      return acc
    }, [])
  } catch (error) {
    console.error('Error fetching data:', error)
    return Promise.reject(error)
  }
}

/**
 * SensorThings will fail if the requested time range is larger than
 * what's available. This function will check if the requested beginTime
 * (endTime - hoursBefore) is older than the datastream's phenomenonBeginTime
 * and return the newer of the two
 * @return {string} - The effective start time for the time range
 */
export function calculateEffectiveStartTime(
  datastreamBeginTime: string,
  endTime: string,
  hoursBefore: number
): string {
  let effectiveStartTime = datastreamBeginTime
  if (hoursBefore > 0) {
    const calcStart = subtractHours(endTime, hoursBefore)
    if (new Date(calcStart) > new Date(datastreamBeginTime)) {
      effectiveStartTime = calcStart
    }
  }
  return effectiveStartTime
}

export function convertToDataObjects(dataArray: DataArray) {
  return dataArray.map(([dateString, value]) => ({
    date: new Date(dateString),
    value,
  }))
}

// Function to replace 'no data' values with NaN
export function replaceNoDataValues(data: DataPoint[], noDataValue: number) {
  return data.map((d) => ({
    ...d,
    value: d.value === noDataValue ? NaN : d.value,
  }))
}
