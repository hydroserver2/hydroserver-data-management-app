import { api as apiMethods } from '@/services/apiMethods'
import { Unit } from '@/types'

export const BASE_URL = `${
  import.meta.env.MODE === 'development'
    ? 'http://127.0.0.1:8000'
    : import.meta.env.VITE_APP_PROXY_BASE_URL
}/api`

const USER_BASE = `${BASE_URL}/account/user`
const ACCOUNT_BASE = `${BASE_URL}/account`
const DS_BASE = `${BASE_URL}/data/datastreams`
const SENSOR_BASE = `${BASE_URL}/data/sensors`
const THINGS_BASE = `${BASE_URL}/data/things`
const DATA_LOADERS_BASE = `${BASE_URL}/data/data-loaders`
const DATA_SOURCES_BASE = `${BASE_URL}/data/data-sources`
const OP_BASE = `${BASE_URL}/data/observed-properties`
const PHOTOS_BASE = `${BASE_URL}/data/things`
const PL_BASE = `${BASE_URL}/data/processing-levels`
const RQ_BASE = `${BASE_URL}/data/result-qualifiers`
const UNIT_BASE = `${BASE_URL}/data/units`
const SENSORTHINGS_BASE = `${BASE_URL}/sensorthings/v1.1`

export const api = {
  createUnit: async (unit: Unit) => apiMethods.post(UNIT_BASE, unit),
  fetchUnits: async () => apiMethods.fetch(UNIT_BASE),
  updateUnit: async (newUnit: Unit, oldUnit: Unit | null = null) =>
    apiMethods.patch(`${UNIT_BASE}/${newUnit.id}`, newUnit, oldUnit),
  deleteUnit: async (id: string) => apiMethods.delete(`${UNIT_BASE}/${id}`),
  getUnit: async (id: string) => apiMethods.fetch(`${UNIT_BASE}/${id}`),

  removeThingOwner: async (id: string, email: string) =>
    apiMethods.delete(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      removeOwner: true,
    }),
  addSecondaryOwner: async (id: string, email: string) =>
    apiMethods.post(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      makeOwner: true,
    }),
  transferPrimaryOwnership: async (id: string, email: string) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/ownership`, {
      email: email,
      makeOwner: true,
    }),
  updateThingPrivacy: async (id: string, thingPrivacy: boolean) =>
    apiMethods.patch(`${THINGS_BASE}/${id}/privacy`, {
      isPrivate: thingPrivacy,
    }),

  downloadDatastreamCSV: async (id: string) =>
    apiMethods.fetch(`${DS_BASE}/${id}/csv`),

  getObservedProperty: async (id: string) =>
    apiMethods.fetch(`${OP_BASE}/${id}`),
}
