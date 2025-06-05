<template>
  <div class="map-wrapper">
    <!-- 2) Dropdown, absolutely positioned -->
    <div class="tile-select-container" v-if="tileSources.length > 1">
      <v-select
        v-model="selectedTileSourceName"
        :items="tileSources"
        item-title="name"
        item-value="name"
        label="Map Options"
        dense
        hide-details
        variant="solo-filled"
        style="width: 180px"
      />
    </div>
    <div ref="mapContainer" class="fill-width fill-height"></div>

    <div ref="popupContainer" class="ol-popup">
      <a href="#" ref="popupCloser" class="ol-popup-closer" />
      <div ref="popupContent" />
    </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Thing, ThingWithColor } from '@/types'
import { addColorToMarkers } from '@/utils/googleMaps/markers'
import {
  generateMarkerContent,
  getMarkerLayerStyles,
} from '@/utils/maps/markers'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Cluster from 'ol/source/Cluster'
import { Feature, Overlay } from 'ol'
import Point from 'ol/geom/Point'
import { fromLonLat, toLonLat } from 'ol/proj'
import {
  ConfigTileSource,
  defaultView,
  tileSources,
} from '@/config/openLayersMapConfig'
import { Extent, isEmpty as extentIsEmpty } from 'ol/extent'
import { fetchLocationData } from '@/utils/maps/location'

const props = defineProps({
  things: { type: Array<Thing>, default: [] },
  colorKey: { type: String, default: '' },
  startInSatellite: Boolean,
  singleMarkerMode: Boolean,
})
const emit = defineEmits(['location-clicked'])

const mapContainer = ref<HTMLElement>()
const popupContainer = ref<HTMLElement>()
const popupContent = ref<HTMLElement>()
const popupCloser = ref<HTMLElement>()

const coloredThings = ref<ThingWithColor[]>([])
const selectedTileSourceName = ref<string>(tileSources[0].name)

let map: OlMap
let rasterLayer: TileLayer
const clusterSource = new Cluster({
  distance: 18,
  source: new VectorSource<Feature>(),
})
const markerLayer = ref<VectorLayer>()

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

const createFeature = (thing: ThingWithColor) =>
  !thing.latitude || !thing.longitude
    ? null
    : new Feature({
        geometry: new Point(fromLonLat([thing.longitude, thing.latitude])),
        thing,
      })

function updateFeatures() {
  // 1) Rebuild features
  coloredThings.value = props.colorKey
    ? addColorToMarkers(props.things, props.colorKey)
    : props.things

  const features = coloredThings.value
    .map(createFeature)
    .filter((feature) => feature !== null)

  // 2) clear & add
  const src = clusterSource.getSource()
  if (!src) return
  src.clear()
  src.addFeatures(features)

  // 3) zoom to the extent of whatever source we used
  const extent = src.getExtent() as Extent
  if (extentIsEmpty(extent)) return
  map.getView().fit(extent, {
    padding: [100, 100, 100, 100],
    maxZoom: 14,
    duration: 0,
  })
}

const initializeMap = () => {
  if (!tileSources.length) {
    console.error(
      '[OpenLayersMap] No tile services available.' +
        ' Please check you openLayers Map Config file and make sure' +
        ' you have at least one valid tile source defined.'
    )
    return
  }

  const desiredType = props.startInSatellite ? 'satellite' : 'base'
  let chosenSource = tileSources.find((s) => s.type === desiredType)
  if (!chosenSource) chosenSource = tileSources[0]
  selectedTileSourceName.value = chosenSource.name

  rasterLayer = new TileLayer({ source: chosenSource.source })
  markerLayer.value = new VectorLayer({
    source: clusterSource,
    style: getMarkerLayerStyles,
  })

  const overlay = new Overlay({
    element: popupContainer.value,
    autoPan: { animation: { duration: 250 } },
  })

  popupCloser.value!.onclick = () => overlay.setPosition(undefined)

  map = new OlMap({
    target: mapContainer.value,
    layers: [rasterLayer, markerLayer.value],
    overlays: [overlay],
    view: new View(defaultView),
  })

  map.on('click', async (evt) => {
    if (props.singleMarkerMode) {
      // single‑marker placement
      const src = clusterSource.getSource()
      if (!src) return
      src.clear()
      const single = new Feature(new Point(evt.coordinate))
      src.addFeature(single)

      const [lon, lat] = toLonLat(evt.coordinate)
      const locationData = await fetchLocationData(lat, lon)
      emit('location-clicked', locationData)
      return
    }

    const rawFeatures = map.forEachFeatureAtPixel(
      evt.pixel,
      (feature) => feature
    )
    if (!rawFeatures) {
      overlay.setPosition(undefined)
      return
    }
    // if it’s a cluster, OL puts real features in a “features” array
    const clicked = Array.isArray(rawFeatures.get('features'))
      ? rawFeatures.get('features')[0]
      : rawFeatures

    const thing = clicked.get('thing')
    popupContent.value!.innerHTML = generateMarkerContent(thing)
    overlay.setPosition(evt.coordinate)
  })

  map.on('pointermove', function (e) {
    // change mouse cursor when over marker
    const hit = map.hasFeatureAtPixel(e.pixel)
    map.getTargetElement().style.cursor = hit ? 'pointer' : ''
  })

  updateFeatures()
}

onMounted(() => {
  if (!mapContainer.value) return
  initializeMap()
})

watch(() => [props.things] as const, updateFeatures, { deep: true })

function getConfigByName(name: string): ConfigTileSource {
  const found = tileSources.find((cfg) => cfg.name === name)
  return found || tileSources[0]
}
watch(
  () => selectedTileSourceName.value,
  (newName) => {
    const cfg = getConfigByName(newName)
    if (cfg && rasterLayer) {
      rasterLayer.setSource(cfg.source)
    }
  }
)
</script>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 2) Position the dropdown in the top-right corner */
.tile-select-container {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2; /* above the map tiles */
}

.fill-width {
  width: 100%;
}
.legend {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border: 1px solid #000;
  z-index: 1;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}
.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: ' ';
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}
.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}
.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}
.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}
.ol-popup-closer:after {
  content: '✖';
}
</style>
