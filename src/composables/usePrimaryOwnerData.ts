import { onMounted, computed } from 'vue'
import { useThingStore } from '@/store/things'
import {
  ProcessingLevel,
  Unit,
  Sensor,
  ObservedProperty,
  DatastreamMetadata,
} from '@/types'

export function usePrimaryOwnerData(thingId: string) {
  const thingStore = useThingStore()

  // If the current user is the primary owner of the datastream, use their metadata,
  // otherwise get the primary owner's
  function getPOData(attribute: keyof DatastreamMetadata) {
    const metadata = thingStore.POMetadata[thingId]
    return metadata ? metadata[attribute] : []
  }

  function getAttributeById(
    computedList: any,
    id: string,
    attributeName: string
  ) {
    if (!computedList || !computedList.value) return null
    const entity = computedList.value.find((item: any) => item.id === id)
    return entity ? entity[attributeName] : null
  }

  const sensors = computed(() => getPOData('sensors'))
  const units = computed(() => getPOData('units'))
  const observedProperties = computed(() => getPOData('observedProperties'))
  const processingLevels = computed(() => getPOData('processingLevels'))

  const formattedProcessingLevels = computed(() => {
    const pls = processingLevels.value as ProcessingLevel[]
    if (pls)
      return pls.map((pl) => ({
        id: pl.id,
        title: `${pl.code} : ${pl.definition}`,
      }))
    return []
  })

  const getUnitAttrById = (id: string, attr: keyof Unit = 'name') => {
    return getAttributeById(units, id, attr)
  }

  const getSensorAttrById = (id: string, attr: keyof Sensor = 'name') => {
    return getAttributeById(sensors, id, attr)
  }

  const getObservedPropertyAttrById = (
    id: string,
    attr: keyof ObservedProperty = 'name'
  ) => {
    return getAttributeById(observedProperties, id, attr)
  }

  const getProcessingLevelAttrById = (
    id: string,
    attr: keyof ProcessingLevel = 'code'
  ) => {
    return getAttributeById(processingLevels, id, attr)
  }

  onMounted(async () => {
    thingStore.fetchPrimaryOwnerMetadataByThingId(thingId)
  })

  return {
    sensors,
    units,
    observedProperties,
    processingLevels,
    formattedProcessingLevels,
    getUnitAttrById,
    getSensorAttrById,
    getObservedPropertyAttrById,
    getProcessingLevelAttrById,
  }
}
