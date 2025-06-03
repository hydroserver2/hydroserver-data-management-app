import { Thing, ThingWithColor } from '@/types'
import { Feature } from 'ol'
import { Style, Fill, Stroke } from 'ol/style'
import CircleStyle from 'ol/style/Circle'
import Text from 'ol/style/Text.js'
import { FeatureLike } from 'ol/Feature'

export const markerStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: '#2196F3' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
})

const getClusterStyle = (features: Feature[]) => {
  const radius = 8 + Math.min(features.length, 20)
  return new Style({
    image: new CircleStyle({
      radius,
      fill: new Fill({ color: '#4CAF50' }),
      stroke: new Stroke({ color: '#fff', width: 2 }),
    }),
    text: new Text({
      text: features.length.toString(),
      fill: new Fill({
        color: '#fff',
      }),
    }),
  })
}

const getColoredMarkerStyle = (feature: Feature) => {
  const thing = feature.get('thing') as ThingWithColor
  return new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: thing.color?.background || '#2196F3' }),
      stroke: new Stroke({
        color: thing.color?.borderColor || '#ffffff',
        width: 2,
      }),
    }),
  })
}

export function getMarkerLayerStyles(featureLike: FeatureLike, res: number) {
  const features = featureLike.get('features')
  if (Array.isArray(features)) {
    if (features.length > 1) return getClusterStyle(features)
    return getColoredMarkerStyle(features[0])
  }
  return markerStyle
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
