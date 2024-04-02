import { preProcessData } from '@/utils/observationsUtils'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { useObservationStore } from '@/store/observations'
import { Datastream, GraphSeries } from '@/types'
import { EChartsColors } from '@/utils/materialColors'

const { fetchObservationsInRange } = useObservationStore()

export const fetchGraphSeries = async (
  datastreams: Datastream[],
  start: string,
  end: string
) => {
  const updatedGraphSeries: GraphSeries[] = await Promise.all(
    datastreams.map(async (ds, index) => {
      const observationsPromise = fetchObservationsInRange(
        ds,
        start,
        end
      ).catch((error) => {
        Snackbar.error('Failed to fetch observations')
        console.error('Failed to fetch observations:', error)
        return null
      })
      const fetchUnitPromise = api.getUnit(ds.unitId).catch((error) => {
        console.error('Failed to fetch Unit:', error)
        return null
      })
      const fetchObservedPropertyPromise = api
        .fetchObservedProperty(ds.observedPropertyId)
        .catch((error) => {
          console.error('Failed to fetch ObservedProperty:', error)
          return null
        })

      const [observations, unit, observedProperty] = await Promise.all([
        observationsPromise,
        fetchUnitPromise,
        fetchObservedPropertyPromise,
      ])

      const processedData = preProcessData(observations, ds)

      const yAxisLabel =
        observedProperty && unit
          ? `${observedProperty.name} (${unit.symbol})`
          : 'Unknown'

      const lineColor = EChartsColors[index % EChartsColors.length]

      return {
        id: ds.id,
        name: ds.name,
        data: processedData,
        yAxisLabel,
        lineColor,
      }
    })
  )

  return updatedGraphSeries
}
