<template>
  <div class="map-container flex-shrink-0">
    <GoogleMap
      v-if="ownedThings"
      :colorKey="useColors ? filterCriteria.key : ''"
      :things="filteredThings"
      useBounds
    />
  </div>

  <div class="my-4 mx-6">
    <v-row class="my-2">
      <v-col cols="auto">
        <h5 class="text-h5">My registered sites</h5>
      </v-col>

      <v-spacer />

      <v-col cols="auto">
        <v-btn
          class="mr-2"
          @click="showFilter = !showFilter"
          prependIcon="mdi-filter"
          variant="outlined"
          rounded="xl"
          >Filter Sites</v-btn
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
      :sort-by="[{ key: 'samplingFeatureCode' }]"
      multi-sort
      item-value="id"
      class="elevation-3 owned-sites-table"
      @click:row="onRowClick"
      color="secondary"
      hover
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
  </div>

  <v-dialog v-model="showSiteForm" width="60rem">
    <SiteForm @close="showSiteForm = false" @created="loadThings" />
  </v-dialog>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import GoogleMap from '@/components/GoogleMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import SiteFilterTool from '@/components/Site/SiteFilterTool.vue'
import { api } from '@/services/api'
import { Thing } from '@/types'
import { addColorToMarkers } from '@/utils/googleMaps/markers'
import { ThingWithColor } from '@/types'

const ownedThings = ref<Thing[]>([])
const useColors = ref(true)
const isFiltered = ref(false)
const sitesLoaded = ref(false)
const filterCriteria = ref({ key: '', values: [] as string[] })

const filteredThings = computed(() => {
  const hasKey = !!filterCriteria.value.key
  const hasValues = filterCriteria.value.values.length > 0
  if (!hasKey && !hasValues) {
    isFiltered.value = false
    return ownedThings.value
  }

  const filterFunction = (thing: Thing) => {
    if (hasKey && hasValues) {
      return thing.tags.some(
        (tag) =>
          tag.key === filterCriteria.value.key &&
          filterCriteria.value.values.includes(tag.value)
      )
    } else if (hasKey) {
      isFiltered.value = true
      return thing.tags.some((tag) => tag.key === filterCriteria.value.key)
    }
  }

  return ownedThings.value.filter(filterFunction)
})

const coloredThings = computed<ThingWithColor[]>(() =>
  addColorToMarkers(filteredThings.value, filterCriteria.value.key)
)

const showSiteForm = ref(false)
const showFilter = ref(false)
const router = useRouter()

const headers = computed(() => {
  const baseHeaders = [
    { title: 'Site code', key: 'samplingFeatureCode' },
    { title: 'Site name', key: 'name' },
    { title: 'Site type', key: 'siteType' },
  ]

  if (isFiltered.value && useColors.value) {
    baseHeaders.push({ title: 'Additional Metadata', key: 'tagValue' })
  }

  return baseHeaders
})

const updateColors = (newColor: boolean) => {
  useColors.value = newColor
}

const handleFilter = (criteria: { key: string; values: string[] }) => {
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
  height: 33rem;
}
</style>
