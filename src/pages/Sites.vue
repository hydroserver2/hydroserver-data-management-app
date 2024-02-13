<template>
  <div class="map-container flex-shrink-0">
    <GoogleMap
      v-if="ownedThings"
      :useColors="useColors"
      :filter-criteria="filterCriteria"
      :things="filteredThings"
      useBounds
    />
  </div>

  <v-container>
    <v-row class="my-2">
      <v-col cols="auto">
        <h5 class="text-h5">My Registered Sites</h5>
      </v-col>

      <v-spacer />

      <v-col cols="auto">
        <v-btn-primary
          class="mr-2"
          @click="showFilter = !showFilter"
          prependIcon="mdi-filter"
          >Filter Sites</v-btn-primary
        >
        <v-btn-secondary @click="showSiteForm = true" prependIcon="mdi-plus"
          >Register a new site</v-btn-secondary
        >
      </v-col>
    </v-row>

    <KeepAlive>
      <SiteFilterTool
        v-if="showFilter"
        :useColors="useColors"
        @update:useColors="updateColors"
        @filter="handleFilter"
      />
    </KeepAlive>

    <v-data-table
      v-if="ownedThings?.length"
      :headers="headers"
      :items="coloredThings"
      hover
      item-value="id"
      class="elevation-3 owned-sites-table"
      @click:row="onRowClick"
    >
      <template v-slot:item.tagValue="{ item }">
        <template v-for="(tag, index) in item.tags">
          <v-chip
            :color="item.color?.background"
            v-if="tag.key === filterCriteria.key"
          >
            {{ item.tagValue }}
          </v-chip>
        </template>
      </template>
    </v-data-table>

    <h5 v-if="!sitesLoaded" class="text-h5">Loading sites...</h5>
    <h5 v-else-if="!ownedThings.length" class="text-h5">
      You have not registered any sites.
    </h5>
  </v-container>

  <v-dialog v-model="showSiteForm" width="60rem">
    <SiteForm @close="showSiteForm = false" @created="loadThings" />
  </v-dialog>
</template>

<script setup lang="ts">
import GoogleMap from '@/components/GoogleMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import SiteFilterTool from '@/components/Site/SiteFilterTool.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api'
import { Thing } from '@/types'
import { addColorToMarkers } from '@/utils/googleMaps/markers'
import { ThingWithColor } from '@/types'

const ownedThings = ref<Thing[]>([])
const useColors = ref(true)
const isFiltered = ref(false)
const filterCriteria = ref({ key: '', value: '' })
const sitesLoaded = ref(false)

const filteredThings = computed(() => {
  const hasKey = !!filterCriteria.value.key
  const hasValue = !!filterCriteria.value.value
  if (!hasKey && !hasValue) {
    isFiltered.value = false
    return ownedThings.value
  }

  const filterFunction = (thing: Thing) => {
    if (hasKey && hasValue) {
      return thing.tags.some(
        (tag) =>
          tag.key === filterCriteria.value.key &&
          tag.value === filterCriteria.value.value
      )
    } else if (hasKey) {
      isFiltered.value = true
      return thing.tags.some((tag) => tag.key === filterCriteria.value.key)
    } else {
      return thing.tags.some((tag) => tag.value === filterCriteria.value.value)
    }
  }

  return ownedThings.value.filter(filterFunction)
})

const coloredThings = computed<ThingWithColor[]>(() =>
  addColorToMarkers(filteredThings.value, filterCriteria.value)
)

const showSiteForm = ref(false)
const showFilter = ref(false)
const router = useRouter()

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Site Code', key: 'samplingFeatureCode' },
    { title: 'Site Name', key: 'name' },
    { title: 'Site Type', key: 'siteType' },
  ]

  if (isFiltered.value && useColors.value) {
    baseHeaders.push({ title: 'Additional Metadata', key: 'tagValue' })
  }

  return baseHeaders
})

const updateColors = (newColor: boolean) => {
  useColors.value = newColor
}

const handleFilter = (criteria: { key: string; value: string }) => {
  filterCriteria.value = criteria
}

const onRowClick = (event: Event, item: any) => {
  router.push({ name: 'SiteDetails', params: { id: item.item.id } })
}

const loadThings = async () => {
  ownedThings.value = await api.fetchOwnedThings()
  sitesLoaded.value = true
}

onMounted(async () => loadThings())
</script>

<style scoped>
.map-container {
  /* The legend won't appear without a relative position */
  position: relative;
  height: 25rem;
}
</style>
