import { fromLonLat } from 'ol/proj'

const defaultLatitude = 39
const defaultLongitude = -100

export const defaultOpenLayersMapOptions = {
  /**
   * Center of the map in [longitude, latitude] (EPSG:4326).
   * Will be converted to EPSG:3857 automatically in the map component.
   */
  // center: [-100, 39],
  center: fromLonLat([defaultLongitude, defaultLatitude]),
  zoom: 4,
  //   minZoom: 2,
  //   maxZoom: 18,
  autoFitToMarkers: true,
  tileSource: {
    type: 'OSM',
    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attributions: '© OpenStreetMap contributors',
  },
}
