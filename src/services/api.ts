import { apiMethods } from '@/services/apiMethods'
import {
  Unit,
  Thing,
  Sensor,
  ResultQualifier,
  ProcessingLevel,
  ObservedProperty,
  Datastream,
  Tag,
  PostHydroShareArchive,
  HydroShareArchive,
  User,
  Workspace,
  ApiKey,
} from '@/types'
import { DataSource } from '@/models'
import {
  convertDataSourceToPostObject,
  OrchestrationSystem,
} from '@/models/dataSource'
import { getCSRFToken } from './getCSRFToken'

export const BASE_URL = `${import.meta.env.VITE_APP_PROXY_BASE_URL}/api`

export const AUTH_BASE = `${BASE_URL}/auth`
export const ACCOUNT_BASE = `${AUTH_BASE}/browser/account`
export const SESSION_BASE = `${AUTH_BASE}/browser/session`
export const PROVIDER_BASE = `${AUTH_BASE}/browser/provider`
const WORKSPACES_BASE = `${BASE_URL}/data/workspaces`
const ROLES_BASE = `${BASE_URL}/data/roles`

const DS_BASE = `${BASE_URL}/data/datastreams`
const SENSOR_BASE = `${BASE_URL}/data/sensors`
export const THINGS_BASE = `${BASE_URL}/data/things`
export const TAG_BASE = `${THINGS_BASE}/tags`
const ETL_SYSTEMS_BASE = `${BASE_URL}/data/orchestration-systems`
const DATA_SOURCES_BASE = `${BASE_URL}/data/data-sources`
const OP_BASE = `${BASE_URL}/data/observed-properties`
const PL_BASE = `${BASE_URL}/data/processing-levels`
const RQ_BASE = `${BASE_URL}/data/result-qualifiers`
const UNIT_BASE = `${BASE_URL}/data/units`

export const getObservationsEndpoint = (
  id: string,
  pageSize: number,
  startTime: string,
  endTime?: string,
  page?: number
) => {
  let url = `${DS_BASE}/${id}/observations?format=column`
  url += `&order_by=phenomenonTime&page_size=${pageSize}`
  url += `&phenomenon_time_min=${encodeURIComponent(startTime)}`
  if (endTime) url += `&phenomenon_time_max=${encodeURIComponent(endTime)}`
  if (page) url += `&page=${page}`
  return url
}

/**
 * Initiates a synchronous form submission to redirect the user for OAuth login in a Django AllAuth
 * environment. This allows the server to return a 302 redirect that the browser will follow,
 * preserving session cookies and enabling AllAuth to handle the full OAuth handshake.
 *
 * @param {string} provider - The ID of the OAuth provider (e.g. "google", "hydroshare").
 * @param {string} callbackUrl - The URL to which the user is redirected after the OAuth flow completes.
 * @param {string} process - Enum: "login" or "connect" The process to be executed when the user successfully authenticates.
 *                           When set to login, the user will be logged into the account to which the provider account is connected,
 *                           or if no such account exists, a signup will occur. If set to connect, the provider account will
 *                           be connected to the list of provider accounts for the currently authenticated user.
 */
const providerRedirect = (
  provider: string,
  callbackUrl: string,
  process: string
) => {
  const data: Record<string, string> = {
    provider: provider,
    callback_url: callbackUrl,
    process: process,
  }
  const csrfToken = getCSRFToken()
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = `${PROVIDER_BASE}/redirect`
  if (csrfToken) {
    const csrfInput = document.createElement('input')
    csrfInput.type = 'hidden'
    csrfInput.name = 'csrfmiddlewaretoken'
    csrfInput.value = csrfToken
    form.appendChild(csrfInput)
  }
  for (const key in data) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = data[key]
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}

export const api = {
  fetchAuthMethods: async () => apiMethods.fetch(`${AUTH_BASE}/methods`),
  fetchSession: async () => apiMethods.fetch(`${SESSION_BASE}`),
  login: async (email: string, password: string) =>
    apiMethods.post(`${SESSION_BASE}`, { email, password }),
  logout: async () => apiMethods.delete(`${SESSION_BASE}`),

  fetchUser: async () => apiMethods.fetch(`${ACCOUNT_BASE}`),
  signup: async (user: User) => apiMethods.post(`${ACCOUNT_BASE}`, user),
  updateUser: async (user: User, oldUser: User) =>
    apiMethods.patch(`${ACCOUNT_BASE}`, user, oldUser),
  deleteUser: async () => apiMethods.delete(`${ACCOUNT_BASE}`),

  sendVerificationEmail: async (email: string) =>
    apiMethods.put(`${ACCOUNT_BASE}/email/verify`, {
      email: email,
    }),
  verifyEmailWithCode: async (key: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/email/verify`, { key }),

  requestPasswordReset: async (email: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/password/request`, {
      email: email,
    }),
  resetPassword: async (key: string, password: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/password/reset`, {
      key: key,
      password: password,
    }),

  fetchWorkspaces: async () => apiMethods.paginatedFetch(`${WORKSPACES_BASE}`),
  fetchAssociatedWorkspaces: async () =>
    apiMethods.paginatedFetch(`${WORKSPACES_BASE}?is_associated=true`),
  fetchWorkspace: async (id: string) =>
    apiMethods.fetch(`${WORKSPACES_BASE}/${id}`),
  createWorkspace: async (postWorkspace: Workspace) =>
    apiMethods.post(WORKSPACES_BASE, postWorkspace),
  updateWorkspace: async (
    newWorkspace: Workspace,
    oldWorkspace: Workspace | null = null
  ) =>
    apiMethods.patch(
      `${WORKSPACES_BASE}/${newWorkspace.id}`,
      newWorkspace,
      oldWorkspace
    ),
  deleteWorkspace: async (id: string) =>
    apiMethods.delete(`${WORKSPACES_BASE}/${id}`),
  transferWorkspace: async (id: string, newOwner: string) =>
    apiMethods.post(`${WORKSPACES_BASE}/${id}/transfer`, { newOwner }),
  acceptWorkspaceTransfer: async (id: string) =>
    apiMethods.put(`${WORKSPACES_BASE}/${id}/transfer`),
  rejectWorkspaceTransfer: async (id: string) =>
    apiMethods.delete(`${WORKSPACES_BASE}/${id}/transfer`),

  getCollaboratorRoles: async (id: string) =>
    apiMethods.paginatedFetch(`${ROLES_BASE}?is_user_role=true`),
  getAPIKeyRoles: async (id: string) =>
    apiMethods.paginatedFetch(`${ROLES_BASE}?is_apikey_role=true`),
  getRole: async (roleId: string) =>
    apiMethods.fetch(`${ROLES_BASE}/${roleId}`),

  getCollaborators: async (id: string) =>
    apiMethods.paginatedFetch(`${WORKSPACES_BASE}/${id}/collaborators`),
  addCollaborator: async (id: string, email: string, roleId: string) =>
    apiMethods.post(`${WORKSPACES_BASE}/${id}/collaborators`, {
      email,
      roleId,
    }),
  updateCollaboratorRole: async (id: string, email: string, roleId: string) =>
    apiMethods.put(`${WORKSPACES_BASE}/${id}/collaborators`, {
      email,
      roleId,
    }),
  removeCollaborator: async (id: string, email: string) =>
    apiMethods.delete(`${WORKSPACES_BASE}/${id}/collaborators`, { email }),

  fetchApiKeys: async (workspaceId: string) =>
    apiMethods.paginatedFetch(`${WORKSPACES_BASE}/${workspaceId}/api-keys`),
  fetchApiKey: async (workspaceId: string, apiKeyId: string) =>
    apiMethods.fetch(`${WORKSPACES_BASE}/${workspaceId}/api-keys/${apiKeyId}`),
  createApiKey: async (apiKey: ApiKey) =>
    apiMethods.post(`${WORKSPACES_BASE}/${apiKey.workspaceId}/api-keys`, {
      name: apiKey.name,
      description: apiKey.description,
      isActive: true,
      roleId: apiKey.role!.id,
    }),
  updateApiKey: async (newKey: ApiKey, oldKey?: ApiKey) =>
    apiMethods.patch(
      `${WORKSPACES_BASE}/${newKey.workspaceId}/api-keys/${newKey.id}`,
      {
        name: newKey.name,
        description: newKey.description,
        isActive: true,
        roleId: newKey.role!.id,
      },
      oldKey
        ? {
            name: oldKey.name,
            description: oldKey.description,
            isActive: true,
            roleId: oldKey.role!.id,
          }
        : oldKey
    ),
  regenerateApiKey: async (id: string, apiKeyId: string) =>
    apiMethods.put(`${WORKSPACES_BASE}/${id}/api-keys/${apiKeyId}/regenerate`),
  deleteApiKey: async (id: string, apiKeyId: string) =>
    apiMethods.delete(`${WORKSPACES_BASE}/${id}/api-keys/${apiKeyId}`),

  fetchConnectedProviders: async () =>
    apiMethods.fetch(`${PROVIDER_BASE}/connections`),
  providerRedirect,
  providerSignup: async (user: User) =>
    apiMethods.post(`${PROVIDER_BASE}/signup`, user),
  deleteProvider: async (provider: string, account: string) =>
    apiMethods.delete(`${PROVIDER_BASE}/connections`, {
      provider: provider,
      account: account,
    }),

  createUnit: async (unit: Unit) => apiMethods.post(UNIT_BASE, unit),
  fetchUnits: async () => apiMethods.paginatedFetch(`${UNIT_BASE}`),
  fetchWorkspaceUnits: async (id: string) =>
    apiMethods.paginatedFetch(`${UNIT_BASE}?workspace_id=${id}`),
  updateUnit: async (newUnit: Unit, oldUnit: Unit | null = null) =>
    apiMethods.patch(`${UNIT_BASE}/${newUnit.id}`, newUnit, oldUnit),
  deleteUnit: async (id: string) => apiMethods.delete(`${UNIT_BASE}/${id}`),
  getUnit: async (id: string) => apiMethods.fetch(`${UNIT_BASE}/${id}`),

  removeThingOwner: async (id: string, email: string) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      removeOwner: true,
    }),
  addSecondaryOwner: async (id: string, email: string) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      makeOwner: true,
    }),
  transferPrimaryOwnership: async (id: string, email: string) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      transferPrimary: true,
    }),
  createThing: async (thing: Thing) => apiMethods.post(THINGS_BASE, thing),
  fetchThings: async () => apiMethods.paginatedFetch(`${THINGS_BASE}`),
  fetchThingsForWorkspace: async (id: string) =>
    apiMethods.paginatedFetch(`${THINGS_BASE}?workspace_id=${id}`),
  fetchPrimaryOwnedThings: async () =>
    apiMethods.paginatedFetch(`${THINGS_BASE}?primary_owned_only=true`),
  fetchOwnedThings: async () =>
    apiMethods.paginatedFetch(`${THINGS_BASE}?owned_only=true`),
  fetchThing: async (id: string) => apiMethods.fetch(`${THINGS_BASE}/${id}`),
  updateThing: async (thing: Thing) =>
    apiMethods.patch(`${THINGS_BASE}/${thing.id}`, thing),
  updateThingPrivacy: async (id: string, isPrivate: boolean) =>
    apiMethods.patch(`${THINGS_BASE}/${id}`, { isPrivate }),
  deleteThing: async (id: string) => apiMethods.delete(`${THINGS_BASE}/${id}`),
  fetchMetadataForThingOwner: async (thingId: string) =>
    apiMethods.paginatedFetch(
      `${THINGS_BASE}/${thingId}/metadata?include_assignable_metadata=true`
    ),
  fetchMetadataForThing: async (thingId: string) =>
    apiMethods.fetch(`${THINGS_BASE}/${thingId}/metadata`),
  uploadSitePhotos: async (thingId: string, data: FormData) =>
    apiMethods.post(`${THINGS_BASE}/${thingId}/photos`, data),
  fetchSitePhotos: async (thingId: string) =>
    apiMethods.paginatedFetch(`${THINGS_BASE}/${thingId}/photos`),
  deleteSitePhoto: async (thingId: string, name: string) =>
    apiMethods.delete(`${THINGS_BASE}/${thingId}/photos`, { name }),

  createSiteTag: async (thingId: string, tag: Tag) =>
    apiMethods.post(`${THINGS_BASE}/${thingId}/tags`, tag),
  editSiteTag: async (thingId: string, tag: Tag) =>
    apiMethods.put(`${THINGS_BASE}/${thingId}/tags`, tag),
  fetchSiteTags: async (thingId: string) =>
    apiMethods.fetch(`${THINGS_BASE}/${thingId}/tags`),
  fetchUsersSiteTags: async () => apiMethods.fetch(`${TAG_BASE}`),
  deleteSiteTag: async (thingId: string, tag: Tag) =>
    apiMethods.delete(`${THINGS_BASE}/${thingId}/tags`, tag),
  fetchWorkspaceTags: async (workspaceId: string) =>
    apiMethods.fetch(`${TAG_BASE}/keys?workspace_id=${workspaceId}`),

  createHydroShareArchive: async (archive: PostHydroShareArchive) =>
    apiMethods.post(`${THINGS_BASE}/${archive.thingId}/archive`, archive),
  updateHydroShareArchive: async (
    newArchive: HydroShareArchive,
    oldArchive?: HydroShareArchive
  ) =>
    apiMethods.patch(
      `${THINGS_BASE}/${newArchive.thingId}/archive`,
      newArchive,
      oldArchive
    ),
  fetchHydroShareArchive: async (thingId: string) =>
    apiMethods.fetch(`${THINGS_BASE}/${thingId}/archive`),
  deleteHydroShareArchive: async (thingId: string) =>
    apiMethods.delete(`${THINGS_BASE}/${thingId}/archive`),
  archiveToHydroShare: async (thingId: string) =>
    apiMethods.post(`${THINGS_BASE}/${thingId}/archive/trigger`),

  createDatastream: async (datastream: Datastream) =>
    apiMethods.post(DS_BASE, datastream),
  fetchDatastreams: async () => apiMethods.paginatedFetch(`${DS_BASE}`),
  fetchDatastreamsForThing: async (thingId: string) =>
    apiMethods.paginatedFetch(`${DS_BASE}?thing_id=${thingId}`),
  fetchDatastream: async (id: string) => apiMethods.fetch(`${DS_BASE}/${id}`),
  fetchUsersDatastreams: async () =>
    apiMethods.paginatedFetch(`${DS_BASE}?exclude_unowned=true`),
  fetchPrimaryOwnedDatastreams: async () =>
    apiMethods.paginatedFetch(`${DS_BASE}?primary_owned_only=true`),
  updateDatastream: async (
    newDS: Datastream,
    oldDS: Datastream | null = null
  ) => apiMethods.patch(`${DS_BASE}/${newDS.id}`, newDS, oldDS),
  deleteDatastream: async (id: string) => apiMethods.delete(`${DS_BASE}/${id}`),
  downloadDatastreamCSV: async (id: string) =>
    apiMethods.fetch(`${DS_BASE}/${id}/csv`),

  createObservedProperty: async (op: ObservedProperty) =>
    apiMethods.post(OP_BASE, op),
  fetchObservedProperty: async (id: string) =>
    apiMethods.fetch(`${OP_BASE}/${id}`),
  fetchObservedProperties: async () => apiMethods.paginatedFetch(`${OP_BASE}`),
  fetchWorkspaceObservedProperties: async (id: string) =>
    apiMethods.paginatedFetch(`${OP_BASE}?workspace_id=${id}`),
  updateObservedProperty: async (
    newOP: ObservedProperty,
    oldOP: ObservedProperty | null = null
  ) => apiMethods.patch(`${OP_BASE}/${newOP.id}`, newOP, oldOP),
  deleteObservedProperty: async (id: string) =>
    apiMethods.delete(`${OP_BASE}/${id}`),

  createProcessingLevel: async (pl: ProcessingLevel) =>
    apiMethods.post(PL_BASE, pl),
  fetchProcessingLevels: async () => apiMethods.paginatedFetch(`${PL_BASE}`),
  fetchProcessingLevel: async (id: string) =>
    apiMethods.fetch(`${PL_BASE}/${id}`),
  fetchWorkspaceProcessingLevels: async (id: string) =>
    apiMethods.paginatedFetch(`${PL_BASE}?workspace_id=${id}`),
  updateProcessingLevel: async (
    newPL: ProcessingLevel,
    oldPL: ProcessingLevel | null = null
  ) => apiMethods.patch(`${PL_BASE}/${newPL.id}`, newPL, oldPL),
  deleteProcessingLevel: async (id: string) =>
    apiMethods.delete(`${PL_BASE}/${id}`),

  createSensor: async (sensor: Sensor) => apiMethods.post(SENSOR_BASE, sensor),
  fetchSensors: async () => apiMethods.paginatedFetch(`${SENSOR_BASE}`),
  fetchSensor: async (id: string) =>
    apiMethods.paginatedFetch(`${SENSOR_BASE}/${id}`),
  fetchWorkspaceSensors: async (id: string) =>
    apiMethods.paginatedFetch(`${SENSOR_BASE}?workspace_id=${id}`),
  updateSensor: async (newSensor: Sensor, oldSensor: Sensor | null = null) =>
    apiMethods.patch(`${SENSOR_BASE}/${newSensor.id}`, newSensor, oldSensor),
  deleteSensor: async (id: string) => apiMethods.delete(`${SENSOR_BASE}/${id}`),

  createResultQualifier: async (resultQualifier: ResultQualifier) =>
    apiMethods.post(RQ_BASE, resultQualifier),
  fetchResultQualifiers: async () => apiMethods.paginatedFetch(`${RQ_BASE}`),
  fetchWorkspaceResultQualifiers: async (id: string) =>
    apiMethods.paginatedFetch(`${RQ_BASE}?workspace_id=${id}`),
  updateResultQualifier: async (
    newResultQualifier: ResultQualifier,
    oldResultQualifier: ResultQualifier | null = null
  ) =>
    apiMethods.patch(
      `${RQ_BASE}/${newResultQualifier.id}`,
      newResultQualifier,
      oldResultQualifier
    ),
  deleteResultQualifier: async (id: string) =>
    apiMethods.delete(`${RQ_BASE}/${id}`),

  createOrchestrationSystem: async (system: OrchestrationSystem) =>
    apiMethods.post(ETL_SYSTEMS_BASE, system),
  fetchOrchestrationSystems: async () =>
    apiMethods.paginatedFetch(ETL_SYSTEMS_BASE),
  fetchWorkspaceOrchestrationSystems: async (id: string) =>
    apiMethods.paginatedFetch(`${ETL_SYSTEMS_BASE}?workspace_id=${id}`),
  fetchOrchestrationSystem: async (id: string) =>
    apiMethods.fetch(`${ETL_SYSTEMS_BASE}/${id}`),
  updateOrchestrationSystem: async (id: string, system: OrchestrationSystem) =>
    apiMethods.patch(`${ETL_SYSTEMS_BASE}/${id}`, system),
  deleteOrchestrationSystem: async (id: string) =>
    apiMethods.delete(`${ETL_SYSTEMS_BASE}/${id}`),

  createDataSource: async (dataSource: DataSource) => {
    return apiMethods.post(
      `${DATA_SOURCES_BASE}?expand_related=true`,
      convertDataSourceToPostObject(dataSource)
    )
  },
  fetchDataSources: async () =>
    apiMethods.paginatedFetch(`${DATA_SOURCES_BASE}?expand_related=true`),
  fetchWorkspaceDataSources: async (id: string) =>
    apiMethods.paginatedFetch(
      `${DATA_SOURCES_BASE}?workspace_id=${id}&expand_related=true`
    ),
  fetchDataSource: async (id: string) =>
    apiMethods.fetch(`${DATA_SOURCES_BASE}/${id}?expand_related=true`),
  updateDataSource: async (newS: DataSource) =>
    apiMethods.patch(
      `${DATA_SOURCES_BASE}/${newS.id}?expand_related=true`,
      convertDataSourceToPostObject(newS)
    ),
  updateDataSourcePartial: async (newS: DataSource) =>
    apiMethods.patch(
      `${DATA_SOURCES_BASE}/${newS.id}?expand_related=true`,
      newS
    ),
  deleteDataSource: async (id: string) =>
    apiMethods.delete(`${DATA_SOURCES_BASE}/${id}`),

  linkDatastreamToDataSource: async (
    dataSourceId: string,
    datastreamId: string
  ) =>
    apiMethods.post(
      `${DATA_SOURCES_BASE}/${dataSourceId}/datastreams/${datastreamId}`
    ),
  unlinkDatastreamFromDataSource: async (
    dataSourceId: string,
    datastreamId: string
  ) =>
    apiMethods.delete(
      `${DATA_SOURCES_BASE}/${dataSourceId}/datastreams/${datastreamId}`
    ),

  fetchObservations: async (endpoint: string) => apiMethods.fetch(endpoint),

  fetchSiteTypes: async () => apiMethods.fetch(`${THINGS_BASE}/site-types`),
  fetchSamplingFeatureTypes: async () =>
    apiMethods.paginatedFetch(`${THINGS_BASE}/sampling-feature-types`),
  fetchSensorEncodingTypes: async () =>
    apiMethods.paginatedFetch(`${SENSOR_BASE}/encoding-types`),
  fetchMethodTypes: async () =>
    apiMethods.paginatedFetch(`${SENSOR_BASE}/method-types`),
  fetchVariableTypes: async () =>
    apiMethods.paginatedFetch(`${OP_BASE}/variable-types`),
  fetchUnitTypes: async () => apiMethods.paginatedFetch(`${UNIT_BASE}/types`),
  fetchDatastreamStatuses: async () =>
    apiMethods.paginatedFetch(`${DS_BASE}/statuses`),
  fetchDatastreamAggregations: async () =>
    apiMethods.paginatedFetch(`${DS_BASE}/aggregation-statistics`),
  fetchSampledMediums: async () =>
    apiMethods.paginatedFetch(`${DS_BASE}/sampled-mediums`),
}
