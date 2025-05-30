<template>
  <div ref="mapContainer" class="fill-width fill-height"></div>

  <div id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer"></a>
    <div id="popup-content"></div>
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
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { Thing, ThingWithColor } from '@/types'
import {
  addColorToMarkers,
  generateMarkerContent,
} from '@/utils/googleMaps/markers'
import { useSingleMarkerMode } from '@/utils/googleMaps/mapUtils'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import Cluster from 'ol/source/Cluster'
import { Feature, Overlay } from 'ol'
import Point from 'ol/geom/Point'
import { Style, Fill, Stroke } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { defaultOpenLayersMapOptions } from '@/config/openLayersMapConfig'
import { Extent, isEmpty as extentIsEmpty } from 'ol/extent'
import CircleStyle from 'ol/style/Circle'
import { defaults as defaultControls } from 'ol/control'

const props = defineProps({
  things: { type: Array<Thing>, default: [] },
  mapOptions: {
    type: Object,
    default: defaultOpenLayersMapOptions,
  },
  colorKey: { type: String, default: '' },
  useBounds: Boolean,
  singleMarkerMode: Boolean,
  useMarkerClusterer: Boolean,
})
const emit = defineEmits(['location-clicked'])

const mapContainer = ref<HTMLElement>()
const coloredThings = ref<ThingWithColor[]>([])

let map: OlMap
const vectorSource = new VectorSource<Feature>()
const clusterSource = new Cluster({
  distance: 40,
  source: vectorSource,
})
const markerLayer = ref<VectorLayer>()

const defaultMarkerStyle = new Style({
  image: new CircleStyle({
    radius: 8,
    fill: new Fill({ color: '#2196F3' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
  }),
})

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

const createFeature = (thing: ThingWithColor) => {
  if (!thing.latitude || !thing.longitude) return null
  const feature = new Feature({
    geometry: new Point(fromLonLat([thing.longitude, thing.latitude])),
    thing,
  })
  feature.setStyle(defaultMarkerStyle)
  return feature
}

function updateFeatures() {
  // 1) Rebuild features
  coloredThings.value = props.colorKey
    ? addColorToMarkers(props.things, props.colorKey)
    : props.things

  const features = coloredThings.value
    .map(createFeature)
    .filter((feature) => feature !== null)

  // 2) clear & add
  if (props.useMarkerClusterer) {
    const src = clusterSource.getSource()
    if (!src) return
    src.clear()
    src.addFeatures(features)
  } else {
    vectorSource.clear()
    vectorSource.addFeatures(features)
  }

  // 3) zoom to the extent of whatever source we used

  const extent = vectorSource.getExtent() as Extent
  if (extentIsEmpty(extent)) return
  map.getView().fit(extent, {
    padding: [100, 100, 100, 100],
    maxZoom: 14,
    duration: 300,
  })
}

const initializeMap = () => {
  const rasterLayer = new TileLayer({ source: new OSM() })

  markerLayer.value = new VectorLayer({
    source: props.useMarkerClusterer
      ? new Cluster({
          distance: 40,
          source: vectorSource,
        })
      : vectorSource,
  })

  const container = document.getElementById('popup')!
  const content = document.getElementById('popup-content')!
  const closer = document.getElementById('popup-closer')!

  const overlay = new Overlay({
    element: container,
    autoPan: { animation: { duration: 250 } },
  })

  closer.onclick = () => {
    overlay.setPosition(undefined)
  }

  map = new OlMap({
    target: mapContainer.value,
    controls: defaultControls({
      attribution: false,
      zoom: false,
      rotate: false,
    }),
    layers: [rasterLayer, markerLayer.value],
    overlays: [overlay],
    view: new View({
      ...props.mapOptions,
      center: fromLonLat(props.mapOptions.center),
    }),
  })

  map.on('click', function (evt) {
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
    content.innerHTML = generateMarkerContent(thing)
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
</script>

<style scoped>
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
