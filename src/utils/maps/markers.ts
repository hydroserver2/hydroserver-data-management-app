import { Thing } from '@/types'

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
