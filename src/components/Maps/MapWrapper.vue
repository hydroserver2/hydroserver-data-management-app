<template>
  <GoogleMap
    v-if="useGoogleMaps"
    v-bind="passThroughProps"
    @location-clicked="emit('location-clicked', $event)"
  />
  <OpenLayersMap
    v-else
    v-bind="passThroughProps"
    @location-clicked="emit('location-clicked', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Thing } from '@/types'
import GoogleMap from './GoogleMap.vue'
import OpenLayersMap from './OpenLayersMap.vue'
import { defaultOpenLayersMapOptions } from '@/config/openLayersMapConfig'
import { defaultMapOptions } from '@/config/googleMapsConfig'

const useGoogleMaps = !!import.meta.env.VITE_APP_GOOGLE_MAPS_API_KEY

const props = defineProps({
  things: { type: Array as () => Thing[], default: () => [] },
  mapOptions: Object,
  colorKey: { type: String, default: '' },
  useBounds: Boolean,
  singleMarkerMode: Boolean,
  useMarkerClusterer: Boolean,
})

const emit = defineEmits(['location-clicked'])

const passThroughProps = computed(() => ({
  things: props.things,
  mapOptions:
    props.mapOptions ??
    (useGoogleMaps ? defaultMapOptions : defaultOpenLayersMapOptions),
  colorKey: props.colorKey,
  useBounds: props.useBounds,
  singleMarkerMode: props.singleMarkerMode,
  useMarkerClusterer: props.useMarkerClusterer,
}))
</script>
