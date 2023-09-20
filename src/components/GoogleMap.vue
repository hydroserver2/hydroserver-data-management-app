<template>
  <div ref="mapContainer" class="fill-width fill-height" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Thing } from '@/types'
import { loadMap } from '@/utils/googleMaps/loadMap'
import { loadMarkers } from '@/utils/googleMaps/markers'
import { useSingleMarkerMode } from '@/utils/googleMaps/mapUtils'

const props = defineProps({
  things: { type: Array<Thing>, default: [] },
  mapOptions: {
    type: Object,
    default: { center: { lat: 39, lng: -100 }, zoom: 4 },
  },
  singleMarkerMode: Boolean,
})
const emit = defineEmits(['location-clicked'])

let map: google.maps.Map | null = null
let markers: google.maps.Marker[] = []
const mapContainer = ref<HTMLElement>()

onMounted(async () => {
  if (mapContainer && mapContainer.value) {
    map = await loadMap(mapContainer.value, props.mapOptions)
    markers = loadMarkers(props.things, map)

    if (props.singleMarkerMode && map) {
      useSingleMarkerMode(map, markers, (locationData) =>
        emit('location-clicked', locationData)
      )
    }
  }
})
</script>

<style>
a {
  text-decoration: none;
  color: #1565c0;
  text-transform: uppercase;
}

a:hover {
  color: #0d47a1;
}
</style>
