import { preProcessData } from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { useObservationStore } from '@/store/observations'
import { Datastream, GraphSeries } from '@/types'

const { fetchObservationsInRange } = useObservationStore()

export const fetchGraphSeries = async (
  datastream: Datastream,
  start: string,
  end: string
) => {
  const observationsPromise = fetchObservationsInRange(
    datastream,
    start,
    end
  ).catch((error) => {
    Snackbar.error('Failed to fetch observations')
    console.error('Failed to fetch observations:', error)
    return null
  })
  const fetchUnitPromise = api.getUnit(datastream.unitId).catch((error) => {
    console.error('Failed to fetch Unit:', error)
    return null
  })
  const fetchObservedPropertyPromise = api
    .fetchObservedProperty(datastream.observedPropertyId)
    .catch((error) => {
      console.error('Failed to fetch ObservedProperty:', error)
      return null
    })

  const [observations, unit, observedProperty] = await Promise.all([
    observationsPromise,
    fetchUnitPromise,
    fetchObservedPropertyPromise,
  ])

  const processedData = preProcessData(observations, datastream)

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
