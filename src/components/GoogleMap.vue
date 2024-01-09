<template>
  <div ref="mapContainer" class="fill-width fill-height" />

  <div v-if="uniqueColoredThings.length" class="legend">
    <h3>Legend</h3>
    <ul>
      <li v-for="thing in uniqueColoredThings" :key="thing.tagValue">
        <i
          class="fa fa-map-marker"
          :style="{ color: thing.color?.background }"
        ></i>
        {{ thing?.tagValue }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, PropType, computed } from 'vue'
import { Thing } from '@/types'
import { loadMap } from '@/utils/googleMaps/loadMap'
import { loadMarkers, addColorToMarkers } from '@/utils/googleMaps/markers'
import { useSingleMarkerMode, clearMarkers } from '@/utils/googleMaps/mapUtils'
import { ThingWithColor } from '@/types'

interface FilterCriteria {
  key: string
  value: string
}

const props = defineProps({
  things: { type: Array<Thing>, default: [] },
  mapOptions: {
    type: Object,
    default: { center: { lat: 39, lng: -100 }, zoom: 4 },
  },
  useColors: Boolean,
  filterCriteria: {
    type: Object as PropType<FilterCriteria>,
    default: () => ({ key: '', value: '' }),
  },
  singleMarkerMode: Boolean,
})
const emit = defineEmits(['location-clicked'])

let map: google.maps.Map | null = null
let markers: google.maps.marker.AdvancedMarkerElement[] = []
const mapContainer = ref<HTMLElement>()
const coloredThings = ref<ThingWithColor[]>([])

watch(
  () => props.things,
  (newThings) => {
    if (props.singleMarkerMode) return
    clearMarkers(markers)
    coloredThings.value = []
    if (props.useColors)
      coloredThings.value = addColorToMarkers(newThings, props.filterCriteria)
    markers = loadMarkers(
      coloredThings.value.length ? coloredThings.value : newThings,
      map
    )
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

  return Array.from(firstOccurrenceMap.values())
})

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
