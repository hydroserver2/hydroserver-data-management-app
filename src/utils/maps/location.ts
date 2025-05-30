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

export async function getElevation(latitude: number, longitude: number) {
  const elevUrl = new URL('https://api.open-elevation.com/api/v1/lookup')
  elevUrl.searchParams.set('locations', `${latitude},${longitude}`)

  const elevRes = await fetch(elevUrl.toString())
  if (!elevRes.ok) throw new Error(`Elevation error: ${elevRes.status}`)

  const elevData = (await elevRes.json()) as ElevationResponse
  return elevData.results?.[0]?.elevation ?? 0
}

export async function getGeoData(latitude: number, longitude: number) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('lat', String(latitude))
  url.searchParams.set('lon', String(longitude))

  const res = await fetch(url.toString())
  if (!res.ok)
    throw new Error(`Nominatim location fetching error: ${res.status}`)

  const { address } = (await res.json()) as NominatimResponse
  return address
}

export async function fetchLocationData(latitude: number, longitude: number) {
  const elevation_m = await getElevation(latitude, longitude)
  const { state, county, country } = await getGeoData(latitude, longitude)

  return {
    latitude: latitude.toFixed(6),
    longitude: longitude.toFixed(6),
    elevation_m: Math.round(elevation_m),
    state: state,
    county: county,
    country: country,
  }
}
