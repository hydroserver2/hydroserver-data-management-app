import { onMounted, computed, ref, ComputedRef } from 'vue'
import { ProcessingLevel, DatastreamMetadata } from '@/types'
import { api } from '@/services/api'

export function useMetadata(thingId?: string, forUser?: boolean) {
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

  const fetchMetadata = async (id: string, forUser?: boolean) => {
    try {
      metadata.value = forUser
        ? await api.fetchMetadataForThingOwner(id)
        : await api.fetchMetadataForThing(id)
    } catch (error) {
      console.error('Error fetching metadata', error)
    }
  }

  onMounted(async () => {
    if (thingId) await fetchMetadata(thingId, forUser)
  })

  return {
    sensors,
    units,
    observedProperties,
    processingLevels,
    formattedProcessingLevels,
    fetchMetadata,
  }
}
