<template>
  <div class="d-flex fill-height">
    <v-navigation-drawer v-model="drawer" width="370">
      <v-card v-if="drawer" flat>
        <v-card-title class="d-flex justify-space-between align-start">
          <div>Browse Data Collection Sites</div>

          <v-btn v-if="drawer" icon @click="drawer = !drawer">
            <v-icon>mdi-menu-open</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <div class="d-flex justify-end">
            <v-btn class="mb-2" @click="clearFilters">Clear Filters</v-btn>
          </div>
          <v-card>
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
              <p v-if="!validFilter" class="text-error mt-2">
                No results found
              </p>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn-primary
                :disabled="!searchInput"
                @click="filterOrganizations"
                >Filter</v-btn-primary
              >
            </v-card-actions>
          </v-card>
          <div v-for="organizationName in filteredOrganizations">
            <p>{{ organizationName }}</p>
          </div>
          <v-expansion-panels class="mt-4">
            <v-expansion-panel title="Site Types">
              <v-expansion-panel-text>
                <template v-for="type in siteTypes" :key="type">
                  <v-checkbox
                    v-model="selectedSiteTypes"
                    :label="type"
                    :value="type"
                    hide-details
                    density="compact"
                  />
                </template>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>

    <div class="pa-2" v-if="!drawer">
      <v-btn icon @click="drawer = !drawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </div>

    <GoogleMap
      :key="filteredThings"
      :things="filteredThings"
      :mapOptions="{ center: { lat: 39, lng: -100 }, zoom: 4 }"
    />
  </div>
</template>

<script setup lang="ts">
import GoogleMap from '@/components/GoogleMap.vue'
import { computed, onMounted, ref } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { useThingStore } from '@/store/things'
import { siteTypes } from '@/vocabularies'

const drawer = ref(true)
const thingStore = useThingStore()
const selectedSiteTypes: Ref<string[]> = ref([])
const filteredOrganizations = ref(new Set())
const searchInput = ref('')
const validFilter = ref(true)

const organizations = computed(() => {
  const allOrgs = new Set()
  Object.values(thingStore.things).forEach((thing) => {
    thing.owners.forEach((owner) => {
      if (owner.organizationName) {
        allOrgs.add(owner.organizationName)
      }
    })
  })
  return Array.from(allOrgs)
})

const filterOrganizations = () => {
  if (!searchInput || !searchInput.value) {
    filteredOrganizations.value = new Set([...organizations.value])
  } else {
    const lowerCase = searchInput.value.toLowerCase()
    filteredOrganizations.value = new Set([
      ...organizations.value.filter((org: any) =>
        org.toLowerCase().includes(lowerCase)
      ),
    ])
  }
  validFilter.value = filteredOrganizations.value.size === 0 ? false : true
}

const filteredThings: any = computed(() => {
  if (typeof thingStore.things !== 'object' || !thingStore.things) return []
  return Object.values(thingStore.things).filter(isThingValid)
})

function isThingValid(thing: Thing) {
  const orgValid =
    filteredOrganizations.value.size === 0 ||
    thing.owners.some((owner) =>
      owner.organizationName
        ? filteredOrganizations.value.has(owner.organizationName)
        : false
    )
  const siteTypeValid =
    selectedSiteTypes.value.length === 0 ||
    selectedSiteTypes.value.includes(thing.siteType)

  return orgValid && siteTypeValid
}

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
  await thingStore.fetchThings()
})
</script>
