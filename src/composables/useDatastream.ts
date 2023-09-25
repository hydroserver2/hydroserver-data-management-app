import { useDatastreamStore } from '@/store/datastreams'
import { onMounted, computed } from 'vue'
import { Datastream } from '@/types'

export function useDatastream(thingId: string, id: string) {
  const dsStore = useDatastreamStore()

  const datastream = computed(
    () =>
      dsStore.getDatastreamForThingById(thingId, id) as unknown as Datastream
  )

  onMounted(async () => {
    if (dsStore.datastreams[thingId]) return
    await dsStore.fetchDatastreamsByThingId(thingId)
  })

  return {
    datastream,
  }
}
