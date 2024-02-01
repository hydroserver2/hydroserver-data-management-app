<template>
  <v-container>
    <h5 class="text-h5 mb-4">Browse Data Collection Sites</h5>

    <BrowseFilterTool :things="things" @filter="updateFilteredThings" />
  </v-container>

  <div class="d-flex fill-height">
    <GoogleMap :things="filteredThings" useMarkerClusterer />
  </div>
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
