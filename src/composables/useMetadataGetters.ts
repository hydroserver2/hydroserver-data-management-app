import { useUnitStore } from '@/store/unit'
import { useSensorStore } from '@/store/sensors'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useObservedPropertyStore } from '@/store/observedProperties'
import { onMounted } from 'vue'

// TODO: This should be replaced by usePrimaryOwnerData or something else once we decide
// how we're going to structure organizations and access control

function useMetadataGetters(
  store: any,
  fetchEntities: string,
  getEntityById: string
) {
  function getNameById(id: string, name: string = 'name') {
    try {
      const entity = store[getEntityById](id)
      return entity[name]
    } catch (error) {
      return null
    }
  }

  onMounted(async () => await store[fetchEntities]())
  return { getNameById }
}

export function useUnitGetters() {
  return useMetadataGetters(useUnitStore(), 'fetchUnits', 'getUnitById')
}

export function useSensorGetters() {
  return useMetadataGetters(useSensorStore(), 'fetchSensors', 'getSensorById')
}

export function useObservedPropertiesGetters() {
  return useMetadataGetters(
    useObservedPropertyStore(),
    'fetchObservedProperties',
    'getById'
  )
}

export function useProcessingLevelGetters() {
  return useMetadataGetters(
    useProcessingLevelStore(),
    'fetchProcessingLevels',
    'getById'
  )
}
