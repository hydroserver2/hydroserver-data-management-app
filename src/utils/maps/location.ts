import {
  elevationService,
  ElevationServices,
  geoService,
  GeoServices,
} from '@/config/openLayersMapConfig'

interface NominatimResponse {
  address: {
    state: string
    county: string
    country: string
  }
}

interface ElevationResponse {
  results: Array<{
    elevation: number
  }>
}
export async function getElevationGoogle(latitude: number, longitude: number) {
  const url = new URL('https://maps.googleapis.com/maps/api/elevation/json')
  url.searchParams.set('locations', `${latitude},${longitude}`)
  url.searchParams.set('key', import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY)
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`Google Elevation error: ${res.status}`)
  const data = (await res.json()) as ElevationResponse
  return data.results[0].elevation
}

export async function getOpenElevation(latitude: number, longitude: number) {
  const elevUrl = new URL('https://api.open-elevation.com/api/v1/lookup')
  elevUrl.searchParams.set('locations', `${latitude},${longitude}`)
  const elevRes = await fetch(elevUrl.toString())
  if (!elevRes.ok) throw new Error(`Elevation error: ${elevRes.status}`)
  const elevData = (await elevRes.json()) as ElevationResponse
  return elevData.results?.[0]?.elevation ?? 0
}

export async function getElevation(latitude: number, longitude: number) {
  return elevationService === ElevationServices.OpenElevation
    ? getOpenElevation(latitude, longitude)
    : getElevationGoogle(latitude, longitude)
}

export async function getGeoDataNominatim(latitude: number, longitude: number) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'HydroServer/1.1',
      'Accept-Language': 'en',
    },
  })
  if (!res.ok)
    throw new Error(`Nominatim location fetching error: ${res.status}`)

  const { address } = (await res.json()) as NominatimResponse
  return address
}

interface GoogleGeocodeResponse {
  status: string
  results: Array<{
    address_components: Array<{
      long_name: string
      types: string[]
    }>
  }>
}

function parseGoogleAddress(response: GoogleGeocodeResponse) {
  if (response.status !== 'OK' || response.results.length === 0) {
    throw new Error(`Google Geocoding API error: ${response.status}`)
  }

  const components = response.results[0].address_components
  const lookup: Record<string, string> = {}

  components.forEach((comp) => {
    comp.types.forEach((t) => {
      lookup[t] = comp.long_name
    })
  })

  return {
    state: lookup['administrative_area_level_1'] || '',
    county: lookup['administrative_area_level_2'] || '',
    country: lookup['country'] || '',
  }
}

export async function getGeoDataGoogle(latitude: number, longitude: number) {
  if (!import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY) {
    throw new Error('Missing Google Maps API key')
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
  url.searchParams.set('latlng', `${latitude},${longitude}`)
  url.searchParams.set('key', import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Google Geocoding HTTP error: ${res.status}`)
  }

  const data = (await res.json()) as GoogleGeocodeResponse

  return parseGoogleAddress(data)
}

export async function getGeoData(latitude: number, longitude: number) {
  return geoService === GeoServices.Nominatim
    ? getGeoDataNominatim(latitude, longitude)
    : getGeoDataGoogle(latitude, longitude)
}

export async function fetchLocationData(latitude: number, longitude: number) {
  const [elevation_m, geo] = await Promise.all([
    getElevation(latitude, longitude),
    getGeoData(latitude, longitude),
  ])

  const { state, county, country } = geo

  return {
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6),
    elevation_m: Math.round(elevation_m),
    state: state,
    county: county,
    country: country,
  }
}
