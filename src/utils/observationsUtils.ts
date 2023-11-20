import { DataArray } from '@/types'
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
  let nextLink = getObservationsEndpoint(id, startTime, endTime)

  while (nextLink) {
    const data = await api.fetchObservations(nextLink)
    if (data.value && data.value[0] && data.value[0].dataArray) {
      allData = allData.concat(data.value[0].dataArray)
    }
    nextLink = data['@iot.nextLink'] || null
  }

  return allData
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
