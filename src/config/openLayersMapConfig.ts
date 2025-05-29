export const defaultOpenLayersMapOptions = {
  /**
   * Center of the map in [longitude, latitude] (EPSG:4326).
   * Will be converted to EPSG:3857 automatically in the map component.
   */
  center: [-100, 39],

  /**
   * Default zoom level (0 = world, ~18 = building).
   */
  zoom: 4,

  /**
   * Minimum allowed zoom level.
   */
  //   minZoom: 2,

  /**
   * Maximum allowed zoom level.
   */
  //   maxZoom: 18,

  /**
   * Whether the map should automatically adjust view to fit all markers.
   * If true, overrides the center/zoom on load.
   */
  autoFitToMarkers: true,

  /**
   * Tile source configuration (OpenStreetMap by default).
   * Users can replace this with another XYZ or WMTS source if needed.
   */
  tileSource: {
    type: 'OSM',
    url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attributions: '© OpenStreetMap contributors',
  },

  /**
   * Clustering options for large datasets.
   */
  clustering: {
    enabled: true,
    distance: 20, // in pixels
  },
}
