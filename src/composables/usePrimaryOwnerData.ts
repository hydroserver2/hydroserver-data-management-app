import { onMounted, computed, ref } from 'vue'
import { ProcessingLevel, DatastreamMetadata } from '@/types'
import { api } from '@/services/api'

export function usePrimaryOwnerData(thingId: string) {
  const metadata = ref<DatastreamMetadata | null>()

  const sensors = computed(() => metadata.value?.sensors || [])

  const units = computed(() => {
    const allUnits = metadata.value?.units || []
    return allUnits.filter((u) => u.type !== 'Time' && u.owner !== null)
  })

  const observedProperties = computed(
    () => metadata.value?.observedProperties || []
  )

  const processingLevels = computed(
    () => metadata.value?.processingLevels || []
  )

  const formattedProcessingLevels = computed(() => {
    const pls = processingLevels.value as ProcessingLevel[]
    if (pls)
      return pls.map((pl) => ({
        id: pl.id,
        title: `${pl.code} : ${pl.definition}`,
      }))
    return []
  })

  onMounted(async () => {
    try {
      metadata.value = await api.fetchMetadataForThingOwner(thingId)
    } catch (error) {
      console.error('Error fetching primary owner metadata', error)
    }
  })

  return {
    sensors,
    units,
    observedProperties,
    processingLevels,
    formattedProcessingLevels,
  }
}
