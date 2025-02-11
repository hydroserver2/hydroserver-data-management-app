import { defineStore } from 'pinia'
import { Workspace } from '@/types'
import { computed, ref, watch } from 'vue'
import Storage from '@/utils/storage'

export const selectedWorkspaceStorage = new Storage<string>('selectedWorkspace')

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([])
  // const selectedWorkspace = ref<Workspace[]>([])

  const selectedWorkspaceId = ref(selectedWorkspaceStorage.get() || '')
  watch(selectedWorkspaceId, (newWorkspaceId) => {
    selectedWorkspaceStorage.set(newWorkspaceId)
  })

  const selectedWorkspace = computed(() => {
    if (workspaces.value?.length === 0) return null
    workspaces.value.find((ws) => ws.id === selectedWorkspaceId.value)
  })

  watch(workspaces, (newWorkspaces) => {
    workspaces.value = newWorkspaces
    console.log('workspaces watcher', workspaces.value)
    if (!workspaces.value.length) {
      selectedWorkspaceId.value = ''
      return
    }

    // If the user has a workspace selected, and that workspace is still in
    // the workspaces array, that takes priority over the default.
    if (workspaces.value.find((ws) => selectedWorkspaceId.value === ws.id))
      return

    // TODO: else if there is a default workspace, set selectedWorkspace to default
    // TODO: else set the selected workspace to the first workspace in the array
    console.log('setting to first workspace item')
    selectedWorkspaceId.value = workspaces.value[0].id
  })

  return {
    workspaces,
    selectedWorkspaceId,
  }
})
