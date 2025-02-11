import { defineStore } from 'pinia'
import { Workspace } from '@/types'
import { computed, ref, watch } from 'vue'
import Storage from '@/utils/storage'

export const selectedWorkspaceStorage = new Storage<Workspace | null>(
  'selectedWorkspace'
)

export const useWorkspaceStore = defineStore('workspace', () => {
  const workspaces = ref<Workspace[]>([])

  const selectedWorkspace = ref(selectedWorkspaceStorage.get() || null)
  watch(selectedWorkspace, (newWorkspaceId) => {
    selectedWorkspaceStorage.set(newWorkspaceId)
  })

  const hasWorkspaces = computed(() => workspaces.value?.length)

  const setWorkspaces = (newWorkspaces: Workspace[]) => {
    workspaces.value = newWorkspaces
    if (!workspaces.value.length) {
      selectedWorkspace.value = null
      return
    }

    const currentWorkspace = workspaces.value.find(
      (ws) => selectedWorkspace.value?.id === ws.id
    )

    // If the user has a workspace selected, and that workspace is still in
    // the workspaces array, that takes priority over the default. But we still want to refresh it
    // in case the database has changed.
    if (currentWorkspace) {
      selectedWorkspace.value = currentWorkspace
    }
    // TODO: else if there is a default workspace, set selectedWorkspace to default
    else {
      selectedWorkspace.value = workspaces.value[0]
    }
  }

  return {
    workspaces,
    selectedWorkspace,
    hasWorkspaces,
    setWorkspaces,
  }
})
