import { defineStore, storeToRefs } from 'pinia'
import { Workspace } from '@/types'
import { computed, ref, watch } from 'vue'
import Storage from '@/utils/storage'
import { useUserStore } from './user'

export const selectedWorkspaceStorage = new Storage<Workspace | null>(
  'selectedWorkspace'
)

export const useWorkspaceStore = defineStore('workspace', () => {
  const { user } = storeToRefs(useUserStore())

  const workspaces = ref<Workspace[]>([])

  const selectedWorkspace = ref(selectedWorkspaceStorage.get() || null)
  watch(selectedWorkspace, (newWorkspaceId) => {
    selectedWorkspaceStorage.set(newWorkspaceId)
  })

  const hasWorkspaces = computed(() => workspaces.value?.length)

  const ownedWorkspaces = computed(() =>
    workspaces.value.filter(
      (ws) => !!ws.owner && ws.owner.email === user.value.email
    )
  )

  const setSelectedWorkspaceById = (workspaceId: string) => {
    const selection = workspaces.value.find((ws) => ws.id === workspaceId)
    if (selection) selectedWorkspace.value = selection
    // We're fetching workspaces on app load so this should never console.error
    else console.error('Selected workspace not in workspaces list')
  }

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
    ownedWorkspaces,
    setWorkspaces,
    setSelectedWorkspaceById,
  }
})
