import { api as apiMethods } from '@/services/apiMethods'
import {
  Unit,
  Thing,
  DataLoader,
  Sensor,
  ResultQualifier,
  ProcessingLevel,
  ObservedProperty,
  Datastream,
  DataSource,
} from '@/types'

export const BASE_URL = `${
  import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:8000'
    : import.meta.env.VITE_APP_PROXY_BASE_URL
}/api`

export const ACCOUNT_BASE = `${BASE_URL}/account`
export const USER_BASE = `${BASE_URL}/account/user`
const DS_BASE = `${BASE_URL}/data/datastreams`
const SENSOR_BASE = `${BASE_URL}/data/sensors`
export const THINGS_BASE = `${BASE_URL}/data/things`
const DATA_LOADERS_BASE = `${BASE_URL}/data/data-loaders`
const DATA_SOURCES_BASE = `${BASE_URL}/data/data-sources`
const OP_BASE = `${BASE_URL}/data/observed-properties`
const PL_BASE = `${BASE_URL}/data/processing-levels`
const RQ_BASE = `${BASE_URL}/data/result-qualifiers`
const UNIT_BASE = `${BASE_URL}/data/units`
const SENSORTHINGS_BASE = `${BASE_URL}/sensorthings/v1.1`

export const JWT_REFRESH = `${ACCOUNT_BASE}/jwt/refresh`

export const getObservationsEndpoint = (
  id: string,
  startTime: string,
  endTime?: string
) => {
  let url = `${SENSORTHINGS_BASE}/Datastreams('${id}')/Observations?$resultFormat=dataArray&$top=100000`
  url += `&$filter=phenomenonTime%20ge%20${startTime}`
  if (endTime) url += `%20and%20phenomenonTime%20lt%20${endTime}`
  return url
}

export const getOAuthLoginEndpoint = (provider: string) =>
  `${ACCOUNT_BASE}/${provider}/login`

export const api = {
  createUser: async (user: User) => apiMethods.post(USER_BASE, user),
  fetchUser: async () => apiMethods.fetch(USER_BASE),
  updateUser: async (user: User, oldUser: User) =>
    apiMethods.patch(USER_BASE, user, oldUser),
  deleteUser: async () => apiMethods.delete(USER_BASE),

  resetPassword: async (uid: string, token: string, password: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/reset-password`, {
      uid: uid,
      token: token,
      password: password,
    }),
  sendPasswordRestEmail: async (email: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/send-password-reset-email`, {
      email: email,
    }),
  login: async (email: string, password: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/jwt/pair`, {
      email: email,
      password: password,
    }),
  activateAccount: async (uid: string, token: string) =>
    apiMethods.post(`${ACCOUNT_BASE}/activate`, {
      uid: uid,
      token: token,
    }),
  sendVerificationEmail: async () =>
    apiMethods.post(`${ACCOUNT_BASE}/send-verification-email`),

  createUnit: async (unit: Unit) => apiMethods.post(UNIT_BASE, unit),
  fetchUnits: async () => apiMethods.fetch(UNIT_BASE),
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
  updateThingPrivacy: async (id: string, thingPrivacy: boolean) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/privacy`, {
      isPrivate: thingPrivacy,
    }),
  createThing: async (thing: Thing) => apiMethods.post(THINGS_BASE, thing),
  fetchThings: async () => apiMethods.fetch(THINGS_BASE),
  fetchThing: async (id: string) => apiMethods.fetch(`${THINGS_BASE}/${id}`),
  updateThing: async (thing: Thing) =>
    apiMethods.patch(`${THINGS_BASE}/${thing.id}`, thing),
  deleteThing: async (id: string) => apiMethods.delete(`${THINGS_BASE}/${id}`),
  fetchMetadataForThingOwner: async (thingId: string) =>
    apiMethods.fetch(
      `${THINGS_BASE}/${thingId}/metadata?include_assignable_metadata=true`
    ),
  uploadSitePhotos: async (thingId: string, data: FormData) =>
    apiMethods.post(`${THINGS_BASE}/${thingId}/photos`, data),
  fetchSitePhotos: async (thingId: string) =>
    apiMethods.fetch(`${THINGS_BASE}/${thingId}/photos`),
  deleteSitePhoto: async (thingId: string, photoId: string) =>
    apiMethods.delete(`${THINGS_BASE}/${thingId}/photos/${photoId}`),
  fetchDatastreamsForThing: async (thingId: string) =>
    apiMethods.fetch(`${THINGS_BASE}/${thingId}/datastreams`),

  createDatastream: async (datastream: Datastream) =>
    apiMethods.post(DS_BASE, datastream),
  fetchDatastreams: async () => apiMethods.fetch(DS_BASE),
  fetchUsersDatastreams: async () =>
    apiMethods.fetch(`${DS_BASE}?exclude_unowned=true`),
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
  fetchObservedProperties: async () => apiMethods.fetch(OP_BASE),
  updateObservedProperty: async (
    newOP: ObservedProperty,
    oldOP: ObservedProperty | null = null
  ) => apiMethods.patch(`${OP_BASE}/${newOP.id}`, newOP, oldOP),
  deleteObservedProperty: async (id: string) =>
    apiMethods.delete(`${OP_BASE}/${id}`),

  createProcessingLevel: async (pl: ProcessingLevel) =>
    apiMethods.post(PL_BASE, pl),
  fetchProcessingLevels: async () => apiMethods.fetch(PL_BASE),
  updateProcessingLevel: async (
    newPL: ProcessingLevel,
    oldPL: ProcessingLevel | null = null
  ) => apiMethods.patch(`${PL_BASE}/${newPL.id}`, newPL, oldPL),
  deleteProcessingLevel: async (id: string) =>
    apiMethods.delete(`${PL_BASE}/${id}`),

  createSensor: async (sensor: Sensor) => apiMethods.post(SENSOR_BASE, sensor),
  fetchSensors: async () => apiMethods.fetch(SENSOR_BASE),
  updateSensor: async (newSensor: Sensor, oldSensor: Sensor | null = null) =>
    apiMethods.patch(`${SENSOR_BASE}/${newSensor.id}`, newSensor, oldSensor),
  deleteSensor: async (id: string) => apiMethods.delete(`${SENSOR_BASE}/${id}`),

  createResultQualifier: async (resultQualifier: ResultQualifier) =>
    apiMethods.post(RQ_BASE, resultQualifier),
  fetchResultQualifiers: async () => apiMethods.fetch(RQ_BASE),
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

  createDataLoader: async (dataLoader: DataLoader) =>
    apiMethods.post(DATA_LOADERS_BASE, dataLoader),
  fetchDataLoaders: async () => apiMethods.fetch(DATA_LOADERS_BASE),
  updateDataLoader: async (id: string, dataLoader: DataLoader) =>
    apiMethods.patch(`${DATA_LOADERS_BASE}/${id}`, dataLoader),
  deleteDataLoader: async (id: string) =>
    apiMethods.delete(`${DATA_LOADERS_BASE}/${id}`),

  createDataSource: async (dataSource: DataSource) =>
    apiMethods.post(DATA_SOURCES_BASE, dataSource),
  fetchDataSources: async () => apiMethods.fetch(DATA_SOURCES_BASE),
  fetchDataSource: async (id: string) =>
    apiMethods.fetch(`${DATA_SOURCES_BASE}/${id}`),
  updateDataSource: async (newS: DataSource, oldS: DataSource | null = null) =>
    apiMethods.patch(`${DATA_SOURCES_BASE}/${newS.id}`, newS, oldS),
  deleteDataSource: async (id: string) =>
    apiMethods.delete(`${DATA_SOURCES_BASE}/${id}`),

  fetchObservations: async (endpoint: string) => apiMethods.fetch(endpoint),
}
