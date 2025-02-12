import { computed, onMounted, ref } from 'vue'
import {
  ProcessingLevel,
  Unit,
  ObservedProperty,
  Sensor,
  ResultQualifier,
} from '@/types'
import { api } from '@/services/api'

export function useMetadata(workspaceId: string) {
  const sensors = ref<Sensor[]>([])
  const units = ref<Unit[]>([])
  const resultQualifiers = ref<ResultQualifier[]>([])

  const processingLevels = ref<ProcessingLevel[]>([])
  const formattedObservedProperties = computed(() =>
    observedProperties.value
      .map((op) => ({
        id: op.id,
        title: `${op.code}: ${op.name}, ${op.type}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
  )

  const observedProperties = ref<ObservedProperty[]>([])
  const formattedProcessingLevels = computed(() =>
    processingLevels.value.map((pl) => ({
      id: pl.id,
      title: `${pl.code}: ${pl.definition}`,
    }))
  )

  const fetchMetadata = async (id: string) => {
    try {
      const [
        unitsResponse,
        observedPropertiesResponse,
        processingLevelsResponse,
        sensorsResponse,
        resultQualifiersResponse,
      ] = await Promise.all([
        api.fetchUnits(),
        api.fetchObservedProperties(),
        api.fetchProcessingLevels(),
        api.fetchSensors(),
        api.fetchResultQualifiers(),
      ])

      units.value = (unitsResponse as Unit[])
        .filter((u) => u.type !== 'Time' && u.workspaceId !== null)
        .sort((a, b) => a.name.localeCompare(b.name))

      sensors.value = (sensorsResponse as Sensor[]).sort(
        (a: Sensor, b: Sensor) => a.name.localeCompare(b.name)
      )

      observedProperties.value = (
        observedPropertiesResponse as ObservedProperty[]
      ).sort((a, b) => a.name.localeCompare(b.name))

      processingLevels.value = (
        processingLevelsResponse as ProcessingLevel[]
      ).sort((a, b) => a.code.localeCompare(b.code))

      resultQualifiers.value = resultQualifiersResponse as ResultQualifier[]
    } catch (error) {
      console.error('Error fetching metadata', error)
    }
  }

  onMounted(async () => {
    await fetchMetadata(workspaceId)
  })

  return {
    sensors,
    units,
    observedProperties,
    formattedObservedProperties,
    processingLevels,
    formattedProcessingLevels,
    resultQualifiers,
    fetchMetadata,
  }
}
