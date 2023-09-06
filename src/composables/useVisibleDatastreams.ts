import { computed, onMounted } from 'vue'
import { useDatastreamStore } from '@/store/datastreams'
import { useThing } from './useThing'

export function useVisibleDatastreams(thingId: string) {
  const { isOwner } = useThing(thingId)
  const datastreamStore = useDatastreamStore()

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

  onMounted(async () => {
    if (datastreamStore.datastreams[thingId]) return
    await datastreamStore.fetchDatastreamsByThingId(thingId)
  })

  return { visibleDatastreams }
}
