import { fromLonLat } from 'ol/proj'
import { OSM, XYZ } from 'ol/source'

// Defaults determine how the map loads when no sites are loaded. If there are
// any sites, the map will automatically zoom in to fit the bounds.
const defaultLatitude = 39
const defaultLongitude = -100

// 0–4 shows a very broad area (continent or entire country).
// 5–10 focuses on regions, states, or large cities.
// 12–18 zooms in on neighborhoods, streets, or individual buildings.
const defaultZoom = 4

export const defaultView = {
  center: fromLonLat([defaultLongitude, defaultLatitude]),
  zoom: defaultZoom,
}

export interface ConfigTileSource {
  name: string
  type: 'base' | 'satellite'
  source: import('ol/source/Tile').default
}

// Your tile sources are the APIs where the actual map tiles are pulled from.
// Open Street Maps and Esri are selected by default. They're free and require no API key
// or additional configuration, but will throttle speeds at medium to heavy use.
// Optionally, any other tile source you'd like can be added to the list below.
// Just comment out the tile layers you don't want to see and add the layers you do.
// The first source in the list with type: 'base' will be the default for pages that load a 'base' style.
// Likewise, the first type: 'satellite' source will be the default for pages that load with a satellite style.

// Some paid tile services require an API key. In that case, add your key to your .env file and follow the
// commented out GoogleMaps examples below.
export const tileSources: ConfigTileSource[] = [
  {
    name: 'Default',
    type: 'base',
    source: new OSM(),
  },
  {
    name: 'Esri World Imagery',
    type: 'satellite',
    source: new XYZ({
      url:
        'https://services.arcgisonline.com/ArcGIS/rest/services/' +
        'World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attributions: 'Tiles © Esri',
    }),
  },
  // {
  //   name: 'Google Default',
  //   type: 'base',
  //   source: new XYZ({
  //     url: `https://mt1.googleapis.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${
  //       import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
  //     }`,
  //     attributions: 'Map data © Google',
  //   }),
  // },
  // {
  //   name: 'Google Satellite',
  //   type: 'satellite',
  //   source: new XYZ({
  //     url: `https://mt1.googleapis.com/vt/lyrs=s&x={x}&y={y}&z={z}&key=${
  //       import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY
  //     }`,
  //     attributions: 'Map data © Google',
  //   }),
  // },

  // You can add more here (e.g. MapTiler, EOX, etc.)
]

export enum ElevationServices {
  OpenElevation = 'OpenElevation',
  Google = 'Google',
}
export enum GeoServices {
  Nominatim = 'Nominatim',
  Google = 'Google',
}

// When you click on the map on the create/edit site form, the location, the form fields will
// be automatically populated. To do this, we need an elevation service to return a location's elevation given
// a latitude and longitude and a geo service to return the address information.

// open-elevation.com is the default elevation service. If you'd like to use
// Google instead, comment out OpenElevation and uncomment Google. You'll also need to
// go to the Google Maps admin panel and enable the elevation API.
export const elevationService = ElevationServices.OpenElevation
// export const elevationService: ElevationServices = ElevationServices.Google

export const geoService = GeoServices.Nominatim
// export const geoService: GeoServices = GeoServices.Google
