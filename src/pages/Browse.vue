<template>
  <div class="d-flex fill-height">
    <BrowseFilterTool :things="things" @filter="updateFilteredThings" />
    <GoogleMap :things="filteredThings" useMarkerClusterer useBounds />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Thing } from '@/types'
import { api } from '@/services/api'
import GoogleMap from '@/components/GoogleMap.vue'
import BrowseFilterTool from '@/components/Browse/BrowseFilterTool.vue'
import { Snackbar } from '@/utils/notifications'

const things = ref<Thing[]>([])
const filteredThings = ref<Thing[]>([])

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
  }
})
</script>
