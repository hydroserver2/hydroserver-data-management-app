import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useUserStore } from '@/store/user'
import { PermissionType, ResourceType, Workspace } from '@/types'

export function useWorkspacePermissions() {
  const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
  const { user } = storeToRefs(useUserStore())

  const selectedWorkspacePermissions = computed(
    () => selectedWorkspace.value?.collaboratorRole?.permissions ?? []
  )

  const checkIsWorkspaceOwner = (workspace: Workspace) =>
    !!user.value?.email && workspace.owner?.email === user.value.email

  const isWorkspaceOwner = computed(() =>
    selectedWorkspace.value
      ? checkIsWorkspaceOwner(selectedWorkspace.value)
      : false
  )

  const checkSelectedPermissions = (
    permissionType: PermissionType,
    resourceType: ResourceType
  ): boolean =>
    selectedWorkspacePermissions.value.some(
      (p) =>
        p.permission_type === permissionType && p.resource_type === resourceType
    )

  const hasGlobalPermissions = computed(() =>
    checkSelectedPermissions(PermissionType.Global, ResourceType.Global)
  )

  const canDeleteThings = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Thing, ResourceType.Delete)
  )

  const canEditThings = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Thing, ResourceType.Edit)
  )

  const canCreateDatastreams = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Datastream, ResourceType.Create)
  )

  const canEditDatastreams = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Datastream, ResourceType.Edit)
  )

  const canDeleteDatastreams = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Datastream, ResourceType.Delete)
  )

  const canViewDatastreams = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Datastream, ResourceType.View)
  )

  const canCreateSensors = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Sensor, ResourceType.Create)
  )

  const canCreateUnits = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Unit, ResourceType.Create)
  )

  const canCreateObservedProperties = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(
        PermissionType.ObservedProperty,
        ResourceType.Create
      )
  )

  const canCreateProcessingLevels = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(
        PermissionType.ProcessingLevel,
        ResourceType.Create
      )
  )

  const canViewObservations = computed(
    () =>
      hasGlobalPermissions.value ||
      checkSelectedPermissions(PermissionType.Observation, ResourceType.View)
  )

  const checkPermissionsByWorkspaceId = (
    workspaceId: string,
    permissionType: PermissionType,
    resourceType: ResourceType
  ) => {
    const workspace = workspaces.value.find((ws) => ws.id === workspaceId)
    const permissions = workspace?.collaboratorRole?.permissions ?? []
    return permissions.some(
      (p) =>
        p.permission_type === permissionType && p.resource_type === resourceType
    )
  }

  return {
    isWorkspaceOwner,
    hasGlobalPermissions,
    canDeleteThings,
    canEditThings,
    canCreateDatastreams,
    canEditDatastreams,
    canDeleteDatastreams,
    canViewDatastreams,
    canCreateSensors,
    canCreateUnits,
    canCreateProcessingLevels,
    canCreateObservedProperties,
    canViewObservations,
    checkPermissionsByWorkspaceId,
  }
}
