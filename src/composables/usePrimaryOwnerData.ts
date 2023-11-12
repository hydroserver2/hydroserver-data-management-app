import { onMounted, computed, ref } from 'vue'
import {
  ProcessingLevel,
  Unit,
  Sensor,
  ObservedProperty,
  DatastreamMetadata,
} from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'

export function usePrimaryOwnerData(thingId: string) {
  function getAttributeById(
    computedList: any,
    id: string,
    attributeName: string
  ) {
    if (!computedList || !computedList.value) return null
    const entity = computedList.value.find((item: any) => item.id === id)
    return entity ? entity[attributeName] : null
  }

  const metadata = ref<DatastreamMetadata | null>()
  const sensors = computed(() => metadata.value?.sensors || [])
  const units = computed(() => {
    const allUnits = metadata.value?.units || []
    return allUnits.filter(
      (unit) => unit.type !== 'Time' && unit.owner !== null
    )
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
    try {
      metadata.value = await api.fetch(ENDPOINTS.THINGS.USER_METADATA(thingId))
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
    getUnitAttrById,
    getSensorAttrById,
    getObservedPropertyAttrById,
    getProcessingLevelAttrById,
  }
}
