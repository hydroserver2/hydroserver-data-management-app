export const DEFAULT_TOAST_DURATION = 5000

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
const PHOTOS_BASE = `${BASE_URL}/data/photos`
const PL_BASE = `${BASE_URL}/data/processing-levels`
const UNIT_BASE = `${BASE_URL}/data/units`
const SENSORTHINGS_BASE = `${BASE_URL}/sensorthings/v1.1`

const FOR_ID = (base: string) => (id: string) => `${base}/${id}`

export const ENDPOINTS = {
  DATA_LOADERS: Object.assign(DATA_LOADERS_BASE, {
    ID: FOR_ID(DATA_LOADERS_BASE),
  }),

  DATA_SOURCES: Object.assign(DATA_SOURCES_BASE, {
    ID: FOR_ID(DATA_SOURCES_BASE),
  }),

  USER: Object.assign(USER_BASE, {
    RESET_PASSWORD: `${USER_BASE}/reset-password`,
    SEND_RESET_EMAIL: `${USER_BASE}/send-password-reset-email`,
  }),

  ACCOUNT: Object.assign(ACCOUNT_BASE, {
    SEND_VERIFICATION_EMAIL: `${ACCOUNT_BASE}/send-verification-email`,
    ACTIVATE: `${ACCOUNT_BASE}/activate`,
    JWT_PAIR: `${ACCOUNT_BASE}/jwt/pair`,
    JWT_REFRESH: `${ACCOUNT_BASE}/jwt/refresh`,
  }),

  DATASTREAMS: Object.assign(DS_BASE, {
    FOR_THING: FOR_ID(DS_BASE),
    CSV: (id: string) => `${DS_BASE}/csv/${id}`,
  }),

  OBSERVED_PROPERTIES: Object.assign(OP_BASE, {
    ID: FOR_ID(OP_BASE),
  }),

  PHOTOS: Object.assign(PHOTOS_BASE, {
    FOR_THING: FOR_ID(PHOTOS_BASE),
  }),

  PROCESSING_LEVELS: Object.assign(PL_BASE, {
    ID: FOR_ID(PL_BASE),
  }),

  SENSORS: Object.assign(SENSOR_BASE, {
    ID: FOR_ID(SENSOR_BASE),
  }),

  UNITS: Object.assign(UNIT_BASE, {
    ID: FOR_ID(UNIT_BASE),
  }),

  THINGS: Object.assign(THINGS_BASE, {
    ID: FOR_ID(THINGS_BASE),
    METADATA: (id: string) => `${THINGS_BASE}/${id}/metadata`,
    OWNERSHIP: (id: string) => `${THINGS_BASE}/${id}/ownership`,
    PRIVACY: (id: string) => `${THINGS_BASE}/${id}/privacy`,
  }),

  SENSORTHINGS: {
    DATASTREAMS: {
      OBSERVATIONS: (id: string, timestamp: string) =>
        `${SENSORTHINGS_BASE}/Datastreams(${id})/Observations?$resultFormat=dataArray&$filter=phenomenonTime%20ge%20${timestamp}`,
    },
  },
}
