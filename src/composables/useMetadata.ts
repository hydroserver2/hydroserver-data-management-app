import { computed, onMounted, Ref, ref, watch } from 'vue'
import {
  ProcessingLevel,
  Unit,
  ObservedProperty,
  Sensor,
  ResultQualifier,
  Workspace,
} from '@/types'
import { api } from '@/services/api'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'

export function useMetadata(localWorkspace?: Ref<Workspace | undefined>) {
  const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

  const effectiveWorkspace = computed(
    () => localWorkspace?.value ?? selectedWorkspace.value
  )

  const workspaceId = computed(() => effectiveWorkspace.value?.id ?? null)

  const sensors = ref<Sensor[]>([])
  const units = ref<Unit[]>([])
  const resultQualifiers = ref<ResultQualifier[]>([])
  const processingLevels = ref<ProcessingLevel[]>([])
  const observedProperties = ref<ObservedProperty[]>([])

  const formattedObservedProperties = computed(() =>
    observedProperties.value
      .map((op) => ({
        id: op.id,
        title: `${op.code}: ${op.name}, ${op.type}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
  )

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
        .filter(
          (u) =>
            (u.type !== 'Time' && u.workspaceId === null) ||
            u.workspaceId === id
        )
        .sort((a, b) => a.name.localeCompare(b.name))

      sensors.value = (sensorsResponse as Sensor[])
        .filter((s) => s.workspaceId === null || s.workspaceId === id)
        .sort((a: Sensor, b: Sensor) => a.name.localeCompare(b.name))

      observedProperties.value = (
        observedPropertiesResponse as ObservedProperty[]
      )
        .filter((op) => op.workspaceId === null || op.workspaceId === id)
        .sort((a, b) => a.name.localeCompare(b.name))

      processingLevels.value = (processingLevelsResponse as ProcessingLevel[])
        .filter((p) => p.workspaceId === null || p.workspaceId === id)
        .sort((a, b) => a.code.localeCompare(b.code))

      resultQualifiers.value = (
        resultQualifiersResponse as ResultQualifier[]
      ).filter((r) => r.workspaceId === null || r.workspaceId === id)
    } catch (error) {
      console.error('Error fetching metadata', error)
    }
  }

  /**
   * Watch the effective workspace ID. When it changes (including on first mount),
   *    immediately fetch metadata if a valid workspace ID is available.
   */
  watch(
    workspaceId,
    async (id) => {
      if (id) {
        await fetchMetadata(id)
      } else {
        sensors.value = []
        units.value = []
        observedProperties.value = []
        processingLevels.value = []
        resultQualifiers.value = []
      }
    },
    { immediate: true }
  )

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
