import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useUserStore } from '@/store/user'
import { PermissionType, ResourceType, Workspace } from '@/types'

export function useWorkspacePermissions() {
  const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
  const { user } = storeToRefs(useUserStore())

  const permissions = computed(
    () => selectedWorkspace.value?.collaboratorRole?.permissions ?? []
  )

  const checkIsWorkspaceOwner = (workspace: Workspace) =>
    !!user.value?.email && workspace.owner?.email === user.value.email

  const isWorkspaceOwner = computed(() =>
    selectedWorkspace.value
      ? checkIsWorkspaceOwner(selectedWorkspace.value)
      : false
  )

  const checkPermission = (
    permissionType: PermissionType,
    resourceType: ResourceType
  ): boolean =>
    hasGlobalPermissions.value ||
    permissions.value.some(
      (p) =>
        p.permission_type === permissionType && p.resource_type === resourceType
    )

  const hasGlobalPermissions = computed(() =>
    checkPermission(PermissionType.Global, ResourceType.Global)
  )

  const canDeleteThings = computed(() =>
    checkPermission(PermissionType.Thing, ResourceType.Delete)
  )

  const canEditThings = computed(() =>
    checkPermission(PermissionType.Thing, ResourceType.Edit)
  )

  const canCreateDatastreams = computed(() =>
    checkPermission(PermissionType.Datastream, ResourceType.Create)
  )

  const canEditDatastreams = computed(() =>
    checkPermission(PermissionType.Datastream, ResourceType.Edit)
  )

  const canDeleteDatastreams = computed(() =>
    checkPermission(PermissionType.Datastream, ResourceType.Delete)
  )

  const canViewDatastreams = computed(() =>
    checkPermission(PermissionType.Datastream, ResourceType.View)
  )

  const canCreateSensors = computed(() =>
    checkPermission(PermissionType.Sensor, ResourceType.Create)
  )

  const canCreateUnits = computed(() =>
    checkPermission(PermissionType.Unit, ResourceType.Create)
  )

  const canCreateObservedProperties = computed(() =>
    checkPermission(PermissionType.ObservedProperty, ResourceType.Create)
  )

  const canCreateProcessingLevels = computed(() =>
    checkPermission(PermissionType.ProcessingLevel, ResourceType.Create)
  )

  const canViewObservations = computed(() =>
    checkPermission(PermissionType.Observation, ResourceType.View)
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
