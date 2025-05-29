import { Thing } from '@/types'
import { googlePinColors } from '@/utils/materialColors'
import { ThingWithColor } from '@/types'
import { MarkerClusterer } from '@googlemaps/markerclusterer'

let infoWindow: google.maps.InfoWindow | null = null

export const addColorToMarkers = (things: Thing[], key: string) => {
  let colorIndex = 0
  const colorMap = new Map()

  return things.map((thing) => {
    const tagValue = thing.tags.find((tag) => tag.key === key)?.value
    if (tagValue === undefined) return thing

    if (!colorMap.has(tagValue)) {
      colorMap.set(
        tagValue,
        googlePinColors[colorIndex % googlePinColors.length]
      )
      colorIndex++
    }
    return { ...thing, color: colorMap.get(tagValue), tagValue: tagValue }
  })
}

export const loadMarkers = (
  things: Thing[],
  map: google.maps.Map | null,
  markerClusterer: MarkerClusterer | null
) => {
  if (!things || !map) return []

  map.addListener('click', (e: any) => {
    if (infoWindow) infoWindow.close()
    e.stop() // Prevents map labels from opening infoWindows when clicked
  })

  return things
    .map((thing) => createMarker(thing, map, markerClusterer))
    .filter(
      (marker): marker is google.maps.marker.AdvancedMarkerElement =>
        marker !== null
    )
}

const createMarker = (
  markerData: ThingWithColor,
  map: google.maps.Map | null,
  markerClusterer: MarkerClusterer | null
) => {
  if (!markerData || !map || !markerData.latitude || !markerData.longitude)
    return null

  const pinColor = markerData.color || googlePinColors[0]
  const pin = new google.maps.marker.PinElement(pinColor)

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: new google.maps.LatLng(markerData.latitude, markerData.longitude),
    map: map,
    content: pin.element,
  })

  if (markerClusterer) markerClusterer.addMarker(marker)

  const content = generateMarkerContent(markerData)

  marker.addListener('gmp-click', (e: any) => {
    if (infoWindow) infoWindow.close()
    infoWindow = new google.maps.InfoWindow({ content })
    infoWindow.open({ anchor: marker, map: map })
  })
  return marker
}

export function generateMarkerContent(markerData: Thing): string {
  return `
      <div class='ma-2'>
        <div class='d-flex justify-space-between'>
          <h6 class="text-h6 pt-2" style="max-width: 30rem;">${
            markerData.name
          }</h6>
        </div>
        <p class="text-medium-emphasis opacity-80" style="font-size: 1.2em;"><b>
        ${markerData.county ? markerData.county : ''}
        ${markerData.county && markerData.state ? ',' : ''}
        ${markerData.state ? markerData.state : ''}
        </b></p>
        <p class="py-2" style="max-width: 30rem;">${markerData.description}</p>
        <p>
          <a href="/sites/${markerData.id}">View data for this site</a>
        </p>
      </div>`
}
