<template>
  <v-container>
    <h5 class="text-h4 font-weight-bold mb-6 mt-4">
      Browse Data Collection Sites
    </h5>

    <BrowseFilterTool :things="things" @filter="updateFilteredThings" />

    <v-card class="mt-6 map-container" elevation="3">
      <GoogleMap :things="filteredThings" useMarkerClusterer />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/api'
import GoogleMap from '@/components/GoogleMap.vue'
import BrowseFilterTool from '@/components/Browse/BrowseFilterTool.vue'

const things = ref<Thing[]>([])
const filteredThings = ref<Thing[]>([])

const updateFilteredThings = (updatedThings: Thing[]) => {
  filteredThings.value = updatedThings
}

onMounted(async () => {
  things.value = await api.fetchThings()
  filteredThings.value = things.value
})
</script>

<style>
.map-container {
  position: relative;
  height: 70rem;
}
</style>
