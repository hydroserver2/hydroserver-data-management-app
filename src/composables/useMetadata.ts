import { onMounted, computed, ref, ComputedRef } from 'vue'
import { ProcessingLevel, DatastreamMetadata } from '@/types'
import { api as defaultApi } from '@/services/api'

interface Api {
  fetchMetadataForThing: (id: string) => Promise<DatastreamMetadata>
  fetchMetadataForThingOwner: (id: string) => Promise<DatastreamMetadata>
}

/**
 * Fetch metadata for a specific thing or its owner.
 *
 * @param {string | null} [thingId=null] - ID of the thing to fetch metadata for.
 * @param {boolean} [forOwner=false] - Fetch metadata for the primary owner of this thing if true.
 * @param {Api} [api=defaultApi] - API service for fetching metadata.
 */
export function useMetadata(
  thingId?: string | null,
  forOwner: boolean = false,
  api: Api = defaultApi
) {
  const metadata = ref<DatastreamMetadata | null>(null)

  const sensors = computed(
    () =>
      metadata.value?.sensors.sort((a, b) => a.name.localeCompare(b.name)) || []
  )

  const units = computed(() => {
    const allUnits = metadata.value?.units || []
    return allUnits
      .filter((u) => u.type !== 'Time' && u.owner !== null)
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  const observedProperties = computed(
    () =>
      metadata.value?.observedProperties.sort((a, b) =>
        a.name.localeCompare(b.name)
      ) || []
  )

  const processingLevels: ComputedRef<ProcessingLevel[]> = computed(
    () =>
      metadata.value?.processingLevels.sort((a, b) =>
        a.code.localeCompare(b.code)
      ) || []
  )

  const formattedProcessingLevels = computed(
    () =>
      processingLevels.value?.map((pl) => ({
        id: pl.id,
        title: `${pl.code} : ${pl.definition}`,
      })) || []
  )

  const fetchMetadata = async (id: string) => {
    try {
      metadata.value = forOwner
        ? await api.fetchMetadataForThingOwner(id)
        : await api.fetchMetadataForThing(id)
    } catch (error) {
      console.error('Error fetching metadata', error)
    }
  }

  onMounted(async () => {
    if (thingId) await fetchMetadata(thingId)
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
