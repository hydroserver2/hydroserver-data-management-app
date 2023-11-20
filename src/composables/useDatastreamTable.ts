import { useDatastreamStore } from '@/store/datastreams'
import { onMounted, ref, Ref, watch, computed } from 'vue'
import { Datastream } from '@/types'
import Notification from '@/store/notifications'
import { useObservationsLast72Hours } from '@/store/observations72Hours'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/things'

export function useDatastreamTable(thingId: string) {
  const { things } = storeToRefs(useThingStore())
  const isOwner = computed(() => things.value[thingId]?.ownsThing)

  const { datastreams } = storeToRefs(useDatastreamStore())
  const { updateDatastream, deleteDatastream, fetchDatastreamsByThingId } =
    useDatastreamStore()
  const { observations: obs72, mostRecentObs: recObs72 } = storeToRefs(
    useObservationsLast72Hours()
  )
  const { fetchObservationsBulk } = useObservationsLast72Hours()

  const selectedDatastream: Ref<Datastream | null> = ref(null)
  const isDeleteModalOpen = ref(false)
  const deleteDatastreamInput = ref('')

  const visibleDatastreams = computed(() => {
    if (!datastreams.value[thingId]) return []

    return datastreams.value[thingId]
      .filter((d) => d.isVisible || isOwner.value)
      .map((d) => ({
        ...d,
        chartOpen: false,
      }))
  })

  const observations = computed(() => {
    if (Object.keys(obs72.value).length === 0) return {}
    return obs72.value
  })

  const mostRecentObs = computed(() => {
    if (Object.keys(recObs72.value).length === 0) return {}
    return recObs72.value
  })

  async function toggleVisibility(datastream: Datastream) {
    datastream.isVisible = !datastream.isVisible
    await updateDatastream(datastream)
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

  async function onDeleteDatastream() {
    if (deleteDatastreamInput.value !== 'Delete') {
      Notification.toast({
        message: 'inputs do not match',
        type: 'error',
      })
      return
    }
    isDeleteModalOpen.value = false
    if (selectedDatastream.value) {
      await deleteDatastream(selectedDatastream.value.id, thingId)
    }
    deleteDatastreamInput.value = ''
  }

  onMounted(async () => {
    await fetchDatastreamsByThingId(thingId)
    await fetchObservationsBulk(visibleDatastreams.value)
  })

  return {
    visibleDatastreams,
    observations,
    mostRecentObs,
    toggleVisibility,
    selectedDatastream,
    openDeleteModal,
    onDeleteDatastream,
    isDeleteModalOpen,
    deleteDatastreamInput,
  }
}
