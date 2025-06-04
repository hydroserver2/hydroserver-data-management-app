import { fromLonLat } from 'ol/proj'
import { OSM, XYZ } from 'ol/source'

const defaultLatitude = 39
const defaultLongitude = -100
const defaultZoom = 4

export const defaultView = {
  center: fromLonLat([defaultLongitude, defaultLatitude]),
  zoom: defaultZoom,
}

// export const tileSource = new OSM()
export const tileSource = new XYZ({
  url: `https://mt1.googleapis.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${
    import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
  }`,
  attributions: 'Map data © Google',
})
