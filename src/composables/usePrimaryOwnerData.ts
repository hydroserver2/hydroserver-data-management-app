import { onMounted, computed, ref, ComputedRef } from 'vue'
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

  const processingLevels: ComputedRef<ProcessingLevel[]> = computed(
    () => metadata.value?.processingLevels || []
  )

  const formattedProcessingLevels = computed(
    () =>
      processingLevels.value?.map((pl) => ({
        id: pl.id,
        title: `${pl.code} : ${pl.definition}`,
      })) || []
  )

  const fetchMetadata = async () => {
    try {
      metadata.value = await api.fetchMetadataForThingOwner(thingId)
    } catch (error) {
      console.error('Error fetching primary owner metadata', error)
    }
  }

  onMounted(async () => await fetchMetadata())

  return {
    sensors,
    units,
    observedProperties,
    processingLevels,
    formattedProcessingLevels,
    fetchMetadata,
  }
}
