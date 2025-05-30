<template>
  <div ref="mapContainer" class="fill-width fill-height" />

  <div v-if="uniqueColoredThings.length" class="legend">
    <h3>Legend</h3>
    <ul>
      <li v-for="thing in uniqueColoredThings" :key="thing.tagValue">
        <v-icon
          icon="mdi-map-marker"
          :style="{ color: thing.color?.background }"
        ></v-icon>
        {{ thing?.tagValue }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Thing } from '@/types'
import { loadMap, zoomAndCenterMap } from '@/utils/googleMaps/loadMap'
import { loadMarkers, addColorToMarkers } from '@/utils/googleMaps/markers'
import { useSingleMarkerMode, clearMarkers } from '@/utils/googleMaps/mapUtils'
import { ThingWithColor } from '@/types'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { defaultMapOptions } from '@/config/googleMapsConfig'

const props = defineProps({
  things: { type: Array<Thing>, default: [] },
  mapOptions: {
    type: Object,
    default: defaultMapOptions,
  },
  colorKey: { type: String, default: '' },
  useBounds: Boolean,
  singleMarkerMode: Boolean,
  useMarkerClusterer: Boolean,
})
const emit = defineEmits(['location-clicked'])

let map: google.maps.Map | null = null
let markers: google.maps.marker.AdvancedMarkerElement[] = []
let markerClusterer: MarkerClusterer | null = null
const mapContainer = ref<HTMLElement>()
const coloredThings = ref<ThingWithColor[]>([])

watch(
  () => props.things,
  (newThings) => {
    if (props.singleMarkerMode) return

    clearMarkers(markers)
    if (markerClusterer) markerClusterer.clearMarkers()

    coloredThings.value = props.colorKey
      ? addColorToMarkers(newThings, props.colorKey)
      : newThings
    markers = loadMarkers(coloredThings.value, map, markerClusterer)

    if (props.useBounds)
      zoomAndCenterMap(map, mapContainer.value!, props.things, props.mapOptions)

    if (props.useMarkerClusterer) {
      if (!markerClusterer)
        markerClusterer = new MarkerClusterer({ markers, map })
      else markerClusterer.addMarkers(markers)
    }
  },
  { deep: true }
)

const uniqueColoredThings = computed(() => {
  const firstOccurrenceMap = new Map()

  coloredThings.value.forEach((thing) => {
    if (thing.tagValue && !firstOccurrenceMap.has(thing.tagValue)) {
      firstOccurrenceMap.set(thing.tagValue, thing)
    }
  })

  return Array.from(firstOccurrenceMap.values()).sort((a, b) => {
    return a.tagValue.localeCompare(b.tagValue)
  })
})

onMounted(async () => {
  if (mapContainer && mapContainer.value) {
    map = await loadMap(
      mapContainer.value,
      props.mapOptions,
      props.useBounds,
      props.things
    )
    markers = loadMarkers(props.things, map, markerClusterer)

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

.gm-style-iw-chr button[title='Close'] {
  position: absolute !important;
  top: 0rem !important;
  right: 0rem !important;
}
</style>

<style scoped>
.fill-width {
  width: 100%;
}
.legend {
  position: absolute;
  bottom: 10px; /* Adjust as needed */
  left: 10px;
  background: rgba(255, 255, 255, 0.8); /* Semi-transparent background */
  padding: 10px;
  border: 1px solid #000;
  z-index: 1; /* Ensure the legend is above the map */
  max-height: 200px; /* Adjust based on parent height */
  overflow-y: auto; /* Scroll if too many items */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Optional: for better visibility */
}
</style>
