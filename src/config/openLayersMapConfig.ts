import { fromLonLat } from 'ol/proj'

const defaultLatitude = 39
const defaultLongitude = -100

export const defaultOpenLayersMapOptions = {
  center: fromLonLat([defaultLongitude, defaultLatitude]),
  zoom: 4,
  autoFitToMarkers: true,
  tileSource: {
    type: 'OSM',
    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attributions: '© OpenStreetMap contributors',
  },
}
