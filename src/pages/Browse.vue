<template>
  <div class="d-flex fill-height">
    <v-navigation-drawer v-model="drawer" width="400">
      <v-card-title class="d-flex justify-space-between align-start">
        Browse Data Collection Sites
        <v-icon v-if="drawer" @click="drawer = !drawer">mdi-menu-open</v-icon>
      </v-card-title>

      <v-divider></v-divider>

      <div class="d-flex justify-end my-4 mx-2">
        <v-btn-cancel elevation="3" @click="clearFilters"
          >Clear Filters</v-btn-cancel
        >
      </div>

      <v-card elevation="3" class="mx-4">
        <v-card-text>
          <form @submit.prevent="filterOrganizations">
            <v-text-field
              placeholder="Filter by Organizations"
              prepend-inner-icon="mdi-magnify"
              v-model="searchInput"
              clearable
              hide-details="auto"
              @click:clear="clearOrganizations"
            />
          </form>
        </v-card-text>

        <v-card-text v-if="!validFilter" class="text-error py-0">
          No results found
        </v-card-text>
        <v-card-text class="py-0" v-for="orgName in filteredOrganizations">
          {{ orgName }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn-primary :disabled="!searchInput" @click="filterOrganizations"
            >Filter</v-btn-primary
          >
        </v-card-actions>
      </v-card>

      <v-expansion-panels class="pa-4">
        <v-expansion-panel title="Site Types">
          <v-expansion-panel-text>
            <v-checkbox
              v-for="type in siteTypes"
              v-model="selectedSiteTypes"
              :label="type"
              :value="type"
              hide-details
              density="compact"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-navigation-drawer>

    <div class="pa-2" v-if="!drawer">
      <v-icon @click="drawer = !drawer">mdi-menu</v-icon>
    </div>

    <GoogleMap :things="filteredThings" useMarkerClusterer />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { siteTypes } from '@/vocabularies'
import { api } from '@/services/api'
import GoogleMap from '@/components/GoogleMap.vue'

const drawer = ref(true)
const selectedSiteTypes: Ref<string[]> = ref([])
const filteredOrganizations = ref(new Set())
const searchInput = ref('')
const validFilter = ref(true)

const things = ref<Thing[]>([])
const filteredThings = computed(() => things.value.filter(isThingValid))

const organizations = computed(
  () =>
    new Set(
      things.value
        .flatMap((t) => t.owners.map((owner) => owner.organizationName))
        .filter((name): name is string => Boolean(name))
    )
)

const filterOrganizations = () => {
  const searchLower = searchInput.value.toLowerCase()
  filteredOrganizations.value = new Set(
    Array.from(organizations.value).filter((org) =>
      org.toLowerCase().includes(searchLower)
    )
  )
  validFilter.value = filteredOrganizations.value.size > 0
}

function isOrgValid(thing: Thing) {
  if (filteredOrganizations.value.size === 0) return true
  return thing.owners.some(
    (o) =>
      o.isPrimaryOwner &&
      o.organizationName &&
      filteredOrganizations.value.has(o.organizationName)
  )
}

const isTypeValid = (thing: Thing) =>
  selectedSiteTypes.value.length === 0 ||
  selectedSiteTypes.value.includes(thing.siteType)

const isThingValid = (thing: Thing) => isOrgValid(thing) && isTypeValid(thing)

const clearOrganizations = () => {
  filteredOrganizations.value = new Set()
  validFilter.value = true
  searchInput.value = ''
}

function clearFilters() {
  selectedSiteTypes.value = []
  clearOrganizations()
}

onMounted(async () => {
  things.value = await api.fetchThings()
})
</script>
