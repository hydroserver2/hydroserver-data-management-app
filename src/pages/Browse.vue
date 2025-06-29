<template>
  <div class="d-flex fill-height">
    <BrowseFilterTool :things="things" @filter="updateFilteredThings" />
    <OpenLayersMap v-if="loaded" :things="filteredThings" />
    <FullScreenLoader v-else loading-text="Loading map..." />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/api'
import OpenLayersMap from '@/components/Maps/OpenLayersMap.vue'
import BrowseFilterTool from '@/components/Browse/BrowseFilterTool.vue'
import { Snackbar } from '@/utils/notifications'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'

const things = ref<Thing[]>([])
const filteredThings = ref<Thing[]>([])
const loaded = ref(false)

const updateFilteredThings = (updatedThings: Thing[]) => {
  filteredThings.value = updatedThings
}

onMounted(async () => {
  try {
    things.value = await api.fetchThings()
    filteredThings.value = things.value
  } catch (error) {
    Snackbar.error('Unable to fetch data from the API.')
    console.error('Unable to fetch data from the API:', error)
  } finally {
    // The BroseFilterTool changes the Canvas size of the Map, making it zoom too close.
    // Wait until we're sure the drawer has opened, then render map
    await new Promise((r) => setTimeout(r, 100))
    loaded.value = true
  }
})
</script>
