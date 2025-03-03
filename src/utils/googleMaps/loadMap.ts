import { Thing } from '@/types'
import { Loader } from '@googlemaps/js-api-loader'

type GoogleMapsLibraries = {
  Map: typeof google.maps.Map
  AdvancedMarkerElement: typeof google.maps.marker.AdvancedMarkerElement
  google: typeof google
}

// Create a module‑scoped promise so the libraries load only once.
let googleMapsPromise: Promise<GoogleMapsLibraries> | null = null
function loadGoogleMaps(): Promise<GoogleMapsLibraries> {
  if (!googleMapsPromise) {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY,
      version: 'beta',
      libraries: ['marker'],
    })
    googleMapsPromise = (async () => {
      const { Map } = (await loader.importLibrary(
        'maps'
      )) as google.maps.MapsLibrary
      const { AdvancedMarkerElement } = await loader.importLibrary('marker')
      return { Map, AdvancedMarkerElement, google: window.google }
    })()
  }
  return googleMapsPromise
}

export const loadMap = async (
  container: HTMLElement,
  mapOptions: google.maps.MapOptions = {},
  useBounds: boolean,
  markers: Thing[]
) => {
  const { Map } = await loadGoogleMaps()

  const initialMapOptions = useBounds
    ? getBoundedMapOptions(container, markers, mapOptions)
    : mapOptions

  return new Map(container, {
    ...initialMapOptions,
    mapId: import.meta.env.VITE_APP_GOOGLE_MAPS_MAP_ID,
  })
}

export const zoomAndCenterMap = (
  map: google.maps.Map | null,
  mapContainer: HTMLElement,
  markers: Thing[],
  defaultMapOptions: {}
) => {
  const mapOptions = getBoundedMapOptions(
    mapContainer,
    markers,
    defaultMapOptions
  )
  map?.setCenter(mapOptions.center)
  map?.setZoom(mapOptions.zoom)
}

function getBoundedMapOptions(
  mapContainer: HTMLElement,
  markers: Thing[],
  defaultMapOptions: any
) {
  if (markers.length > 0) {
    const bounds = new google.maps.LatLngBounds()
    markers.forEach((t) => {
      if (!t.latitude || !t.longitude) return
      bounds.extend(new google.maps.LatLng(t.latitude, t.longitude))
    })

    const center = bounds.getCenter()
    const zoom = calculateZoomForBounds(bounds, mapContainer)

    return {
      ...defaultMapOptions,
      center: { lat: center.lat(), lng: center.lng() },
      zoom: zoom,
    }
  }

  return defaultMapOptions
}

function calculateZoomForBounds(
  bounds: google.maps.LatLngBounds,
  mapContainer: HTMLElement
) {
  const WORLD_DIM = { height: 256, width: 256 }
  const ZOOM_MAX = 14

  function latRad(lat: number) {
    return Math.sin((lat * Math.PI) / 180)
  }

  function zoom(mapPx: number, worldPx: number, fraction: number): number {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2)
  }

  const ne = bounds.getNorthEast()
  const sw = bounds.getSouthWest()

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI
  const lngDiff = ne.lng() - sw.lng()
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360

  const latZoom = zoom(mapContainer.offsetHeight, WORLD_DIM.height, latFraction)
  const lngZoom = zoom(mapContainer.offsetWidth, WORLD_DIM.width, lngFraction)

  return Math.min(latZoom, lngZoom, ZOOM_MAX)
}
