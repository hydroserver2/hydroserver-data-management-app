import {
  elevationService,
  ElevationServices,
  geoService,
  GeoServices,
} from '@/config/openLayersMapConfig'
import { getElevationGoogle, getGeoDataGoogle } from './googleMaps'

export async function getOpenElevation(latitude: number, longitude: number) {
  const elevUrl = new URL('https://api.open-elevation.com/api/v1/lookup')
  elevUrl.searchParams.set('locations', `${latitude},${longitude}`)
  const elevRes = await fetch(elevUrl.toString())
  if (!elevRes.ok) throw new Error(`Elevation error: ${elevRes.status}`)
  const elevData = await elevRes.json()
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

  const { address } = await res.json()
  return {
    state: address.state,
    county: address.county,
    country: address.country_code.toUpperCase(),
  }
}

export async function getGeoData(latitude: number, longitude: number) {
  return geoService === GeoServices.Nominatim
    ? await getGeoDataNominatim(latitude, longitude)
    : await getGeoDataGoogle(latitude, longitude)
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
