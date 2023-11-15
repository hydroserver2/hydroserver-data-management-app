import { useDatastreamStore } from '@/store/datastreams'
import { onMounted, ref, Ref, watch } from 'vue'

import { Datastream } from '@/types'
import Notification from '@/store/notifications'

export function useDatastreamTable(thingId: string) {
  const datastreamStore = useDatastreamStore()
  const selectedDatastream: Ref<Datastream | null> = ref(null)
  const isDeleteModalOpen = ref(false)
  const deleteDatastreamInput = ref('')

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
    if (datastreamStore.datastreams[thingId]) return
    await datastreamStore.fetchDatastreamsByThingId(thingId)
  })

  return {
    toggleVisibility,
    selectedDatastream,
    openDeleteModal,
    deleteDatastream,
    isDeleteModalOpen,
    deleteDatastreamInput,
  }
}
