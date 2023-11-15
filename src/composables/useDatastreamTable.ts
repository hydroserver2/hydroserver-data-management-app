import { useDatastreamStore } from '@/store/datastreams'
import { onMounted, ref, Ref, watch, computed } from 'vue'
import { useThingOwnership } from './useThingOwnership'
import { Datastream } from '@/types'
import Notification from '@/store/notifications'
import { useObservationsLast72Hours } from '@/store/observations72Hours'

export function useDatastreamTable(thingId: string) {
  const { isOwner } = useThingOwnership(thingId)
  const datastreamStore = useDatastreamStore()
  const obs72HourStore = useObservationsLast72Hours()

  const selectedDatastream: Ref<Datastream | null> = ref(null)
  const isDeleteModalOpen = ref(false)
  const deleteDatastreamInput = ref('')

  const visibleDatastreams = computed(() => {
    if (!datastreamStore.datastreams[thingId]) return []

    return datastreamStore.datastreams[thingId]
      .filter((datastream) => datastream.isVisible || isOwner.value)
      .map((datastream) => ({
        ...datastream,
        // Add ability to open a modal for each
        chartOpen: false,
      }))
  })

  const observations = computed(() => {
    if (Object.keys(obs72HourStore.observations).length === 0) return {}
    return obs72HourStore.observations
  })

  const mostRecentObs = computed(() => {
    if (Object.keys(obs72HourStore.mostRecentObs).length === 0) return {}
    return obs72HourStore.mostRecentObs
  })

  async function toggleVisibility(datastream: Datastream) {
    datastream.isVisible = !datastream.isVisible
    await datastreamStore.updateDatastream(datastream)
  }

  function openDeleteModal(datastream: Datastream) {
    selectedDatastream.value = datastream
    isDeleteModalOpen.value = true
  }

  function closeDeleteModal() {
    selectedDatastream.value = null
    // isDeleteModalOpen.value = false
    deleteDatastreamInput.value = ''
  }

  watch(isDeleteModalOpen, (newValue) => {
    if (newValue === false) {
      closeDeleteModal()
    }
  })

  async function deleteDatastream() {
    if (deleteDatastreamInput.value !== 'Delete') {
      Notification.toast({
        message: 'inputs do not match',
        type: 'error',
      })
      return
    }
    isDeleteModalOpen.value = false
    if (selectedDatastream.value) {
      await datastreamStore.deleteDatastream(
        selectedDatastream.value.id,
        thingId
      )
    }
    deleteDatastreamInput.value = ''
  }

  onMounted(async () => {
    await datastreamStore.fetchDatastreamsByThingId(thingId)
    await obs72HourStore.fetchObservationsBulk(visibleDatastreams.value)
  })

  return {
    visibleDatastreams,
    observations,
    mostRecentObs,
    toggleVisibility,
    selectedDatastream,
    openDeleteModal,
    deleteDatastream,
    isDeleteModalOpen,
    deleteDatastreamInput,
  }
}
