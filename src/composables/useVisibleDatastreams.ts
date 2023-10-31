import { computed, onMounted } from 'vue'
import { useDatastreamStore } from '@/store/datastreams'
import { useThingOwnership } from './useThingOwnership'
import { useObservationsLast72Hours } from '@/store/observations72Hours'

export function useVisibleDatastreams(thingId: string) {
  const { isOwner } = useThingOwnership(thingId)
  const datastreamStore = useDatastreamStore()
  const obs72HourStore = useObservationsLast72Hours()

  const visibleDatastreams = computed(() => {
    if (!datastreamStore.datastreams[thingId]) return []

    return datastreamStore.datastreams[thingId]
      .filter((datastream) => datastream.isVisible || isOwner.value)
      .map((datastream) => ({
        ...datastream,
        // Add ability to open a modal for each
        chartOpen: false,
      }))
  })

  const observations = computed(() => {
    if (Object.keys(obs72HourStore.observations).length === 0) return {}
    return obs72HourStore.observations
  })

  const mostRecentObs = computed(() => {
    if (Object.keys(obs72HourStore.mostRecentObs).length === 0) return {}
    return obs72HourStore.mostRecentObs
  })

  onMounted(async () => {
    // if (datastreamStore.datastreams[thingId]) return
    await datastreamStore.fetchDatastreamsByThingId(thingId)
    await obs72HourStore.fetchObservationsBulk(visibleDatastreams.value)
  })

  return { visibleDatastreams, observations, mostRecentObs }
}
