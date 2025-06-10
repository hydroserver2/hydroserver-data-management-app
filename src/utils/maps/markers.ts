import { Thing } from '@/types'

export function generateMarkerContent(markerData: Thing): string {
  return `
      <div class='ma-0'>
        <h6 class="text-h6">${markerData.name}</h6>
        <p class="text-subtitle-1 mb-2 opacity-60">
        ${markerData.county ? markerData.county : ''}
        ${markerData.county && markerData.state ? ',' : ''}
        ${markerData.state ? markerData.state : ''}
        </p>
        <p class="text-body-2 mb-3">${markerData.description}</p>
        <p class="mt-6">
          <a href="/sites/${markerData.id}">View data for this site</a>
        </p>
      </div>`
}
