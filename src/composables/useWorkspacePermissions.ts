import { computed, Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useUserStore } from '@/store/user'
import { Permission, PermissionType, ResourceType, Workspace } from '@/types'

export function useWorkspacePermissions(
  localWorkspace?: Ref<Workspace | undefined>
) {
  const { selectedWorkspace: globalStoredWorkspace, workspaces } = storeToRefs(
    useWorkspaceStore()
  )
  const { user } = storeToRefs(useUserStore())

  /** Some pages need to be in the context of a specific workspace that isn't the globally
   * selected workspace. We want to preserve the state of the global workspace so we're still
   * in that context when we navigate away from a page that needs the localWorkspace to a
   * page that needs the global workspace context.
   */
  const selectedWorkspace = computed(() => {
    if (localWorkspace?.value) return localWorkspace.value
    return globalStoredWorkspace.value
  })

  const isWorkspaceOwner = computed<boolean>(() => {
    return isOwner(selectedWorkspace.value)
  })

  function isOwner(workspace: Workspace | null) {
    if (!workspace || !user.value?.email) return false
    return workspace.owner?.email === user.value.email
  }

  const hasPermission = (
    permissionType: PermissionType,
    resourceType: ResourceType,
    workspace?: Workspace
  ) => {
    const w = workspace ?? selectedWorkspace.value
    if (!w) return false

    if (isOwner(w)) return true

    const perms = w.collaboratorRole?.permissions ?? []
    return (
      hasGlobalPermissions(perms) ||
      perms.some(
        (p) =>
          p.permission_type === permissionType &&
          p.resource_type === resourceType
      )
    )
  }

  const hasGlobalPermissions = (permissions: Permission[]) =>
    permissions.some(
      (p) =>
        p.permission_type === PermissionType.Global &&
        p.resource_type === ResourceType.Global
    )

  const canEditWorkspace = computed(() =>
    hasPermission(PermissionType.Workspace, ResourceType.Edit)
  )

  const canDeleteThings = computed(() =>
    hasPermission(PermissionType.Thing, ResourceType.Delete)
  )

  const canEditThings = computed(() =>
    hasPermission(PermissionType.Thing, ResourceType.Edit)
  )

  const canCreateDatastreams = computed(() =>
    hasPermission(PermissionType.Datastream, ResourceType.Create)
  )

  const canEditDatastreams = computed(() =>
    hasPermission(PermissionType.Datastream, ResourceType.Edit)
  )

  const canDeleteDatastreams = computed(() =>
    hasPermission(PermissionType.Datastream, ResourceType.Delete)
  )

  const canViewDatastreams = computed(() =>
    hasPermission(PermissionType.Datastream, ResourceType.View)
  )

  const canCreateSensors = computed(() =>
    hasPermission(PermissionType.Sensor, ResourceType.Create)
  )

  const canCreateUnits = computed(() =>
    hasPermission(PermissionType.Unit, ResourceType.Create)
  )

  const canCreateObservedProperties = computed(() =>
    hasPermission(PermissionType.ObservedProperty, ResourceType.Create)
  )

  const canCreateProcessingLevels = computed(() =>
    hasPermission(PermissionType.ProcessingLevel, ResourceType.Create)
  )

  const canViewObservations = computed(() =>
    hasPermission(PermissionType.Observation, ResourceType.View)
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
    canEditWorkspace,
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
    isOwner,
    hasPermission,
    hasGlobalPermissions,
    checkPermissionsByWorkspaceId,
  }
}
