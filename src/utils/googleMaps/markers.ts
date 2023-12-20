import { Thing } from '@/types'
import { googlePinColors } from '@/utils/materialColors'

let infoWindow: google.maps.InfoWindow | null = null

export const addColorToMarkers = (
  things: Thing[],
  filterCriteria: { key: string; value: string }
) => {
  let colorIndex = 0
  const colorMap = new Map()

  return things.map((thing) => {
    const tagValue = thing.tags.find(
      (tag) => tag.key === filterCriteria.key
    )?.value
    if (tagValue !== undefined) {
      if (!colorMap.has(tagValue)) {
        colorMap.set(
          tagValue,
          googlePinColors[colorIndex % googlePinColors.length]
        )
        colorIndex++
      }
      return { ...thing, color: colorMap.get(tagValue) }
    }
    return thing
  })
}

export const loadMarkers = (things: Thing[], map: google.maps.Map | null) => {
  if (!things || !map) return []

  map.addListener('click', () => {
    if (infoWindow) infoWindow.close()
  })

  return things
    .map((thing) => createMarker(thing, map))
    .filter(
      (marker): marker is google.maps.marker.AdvancedMarkerElement =>
        marker !== null
    )
}

interface ThingWithColor extends Thing {
  color?: {
    borderColor: string
    background: string
    glyphColor: string
  }
}

const createMarker = (
  markerData: ThingWithColor,
  map: google.maps.Map | null
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

  const content = generateMarkerContent(markerData)

  marker.addListener('click', (e: any) => {
    if (infoWindow) infoWindow.close()
    infoWindow = new google.maps.InfoWindow({ content })
    infoWindow.open({ anchor: marker, map: map })
    e.stop()
  })
  return marker
}

function generateMarkerContent(markerData: Thing): string {
  const primaryOwner = markerData.owners.find(
    (owner: any) => owner.isPrimaryOwner
  )
  const primaryOrg =
    primaryOwner && primaryOwner.organizationName
      ? `<p class="pb-1" style='color:green;'>Related Organization: ${primaryOwner.organizationName}</p>`
      : ''

  return `
      <h6 class="text-h6 pb-1">${markerData.name}</h6>
      <p class="pb-1" style="font-size: 1.2em;"><b>
        ${markerData.county ? markerData.county : ''}
        ${markerData.county && markerData.state ? ',' : ''}
        ${markerData.state ? markerData.state : ''}
        </b></p>
        <p class="pb-1" style="max-width: 25rem;">${markerData.description}</p>
        ${primaryOrg}
      <p class="pt-1">
        <a href="/sites/${markerData.id}">View data for this site</a>
      </p>`
}
