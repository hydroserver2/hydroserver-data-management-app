import { onMounted, computed } from 'vue'
import { useSensorStore } from '@/store/sensors'
import { useUnitStore } from '@/store/unit'
import { useObservedPropertyStore } from '@/store/observedProperties'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { ProcessingLevel } from '@/types'

import { useThingOwnership } from '@/composables/useThingOwnership'
import { useThingStore } from '@/store/things'

export function usePrimaryOwnerData(thingId: string) {
  const sensorStore = useSensorStore()
  const opStore = useObservedPropertyStore()
  const unitStore = useUnitStore()
  const plStore = useProcessingLevelStore()
  const thingStore = useThingStore()
  const { isPrimaryOwner } = useThingOwnership(thingId)

  // If the current user is the primary owner of the datastream, use their metadata,
  // otherwise get the primary owner's
  function getPOData(
    primaryStore: any,
    secondaryKey: string,
    secondaryAttribute:
      | 'units'
      | 'sensors'
      | 'observed_properties'
      | 'processing_levels'
  ) {
    if (isPrimaryOwner.value) {
      return primaryStore[secondaryKey] || []
    } else {
      const metadata = thingStore.POMetadata[thingId]
      return metadata ? metadata[secondaryAttribute] : []
    }
  }

  const sensors = computed(() => getPOData(sensorStore, 'sensors', 'sensors'))
  const units = computed(() => getPOData(unitStore, 'ownedUnits', 'units'))
  const observedProperties = computed(() =>
    getPOData(opStore, 'ownedOP', 'observed_properties')
  )

  const processingLevels = computed(() => {
    const pls = getPOData(
      plStore,
      'ownedProcessingLevels',
      'processing_levels'
    ) as ProcessingLevel[]

    if (pls)
      return pls.map((pl) => ({
        id: pl.id,
        title: `${pl.code} : ${pl.definition}`,
      }))
  })

  onMounted(async () => {
    sensorStore.fetchSensors()
    unitStore.fetchUnits()
    plStore.fetchProcessingLevels()
    opStore.fetchObservedProperties()

    if (!isPrimaryOwner.value)
      thingStore.fetchPrimaryOwnerMetadataByThingId(thingId)
  })

  return {
    sensors,
    units,
    observedProperties,
    processingLevels,
    isPrimaryOwner,
  }
}
