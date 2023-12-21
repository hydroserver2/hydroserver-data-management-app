import { Loader } from '@googlemaps/js-api-loader'

export const loadMap = async (
  container: HTMLElement,
  mapOptions: google.maps.MapOptions = {}
) => {
  const loader = new Loader({
    apiKey: import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY,
    version: 'beta',
    libraries: ['marker'],
  })
  const google = await loader.load()

  return new google.maps.Map(container, {
    ...mapOptions,
    // mapId: import.meta.env.VITE_APP_GOOGLE_MAPS_MAP_ID,
    mapId: 'DEMO_MAP_ID ',
  })
}
