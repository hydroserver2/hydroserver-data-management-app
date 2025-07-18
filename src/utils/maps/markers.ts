import { Thing } from '@/types'
import { mapMarkerColors } from '@/utils/materialColors'

export const addColorToMarkers = (things: Thing[], key: string) => {
  let colorIndex = 0
  const colorMap = new Map()

  return things.map((thing) => {
    const tagValue = thing.tags.find((tag) => tag.key === key)?.value
    if (tagValue === undefined) return thing

    if (!colorMap.has(tagValue)) {
      colorMap.set(
        tagValue,
        mapMarkerColors[colorIndex % mapMarkerColors.length]
      )
      colorIndex++
    }
    return { ...thing, color: colorMap.get(tagValue), tagValue: tagValue }
  })
}

export function generateMarkerContent(markerData: Thing): string {
  return `
      <div class='ma-0'>
        <h6 class="text-h6">${markerData.name}</h6>
        <p class="text-subtitle-1 mb-2 opacity-60">
        ${markerData.location.county ? markerData.location.county : ''}
        ${markerData.location.county && markerData.location.state ? ',' : ''}
        ${markerData.location.state ? markerData.location.state : ''}
        </p>
        <p class="text-body-2 mb-3">${markerData.description}</p>
        <p class="mt-6">
          <a href="/sites/${markerData.id}">View data for this site</a>
        </p>
      </div>`
}
