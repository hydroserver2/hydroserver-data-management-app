<template>
  <div class="mb-4 flex-shrink-0" style="height: 25rem">
    <GoogleMap v-if="ownedThings" :things="filteredThings" />
  </div>

  <v-container>
    <v-row class="mb-2">
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
      <v-card v-if="showFilter" class="mb-6" elevation="2">
        <v-card-text>
          <v-row>
            <SiteFilterTool @filter="handleFilter" />
          </v-row>
        </v-card-text>
      </v-card>
    </KeepAlive>

    <v-data-table
      v-if="ownedThings?.length"
      :headers="headers"
      :items="filteredThings"
      hover
      item-value="id"
      class="elevation-3 owned-sites-table"
      @click:row="onRowClick"
    />

    <h5 v-else class="text-h5">You have not registered any sites.</h5>
  </v-container>

  <v-dialog v-model="showSiteForm" width="60rem">
    <SiteForm @close="showSiteForm = false" @created="refreshThings" />
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

const things = ref<Thing[]>([])
const filterCriteria = ref({ key: '', value: '' })

const ownedThings = computed(() => things.value.filter((t) => t.ownsThing))

const filteredThings = computed(() => {
  const hasKey = !!filterCriteria.value.key
  const hasValue = !!filterCriteria.value.value
  if (!hasKey && !hasValue) return ownedThings.value

  const filterFunction = (thing: Thing) => {
    if (hasKey && hasValue) {
      return thing.tags.some(
        (tag) =>
          tag.key === filterCriteria.value.key &&
          tag.value === filterCriteria.value.value
      )
    } else if (hasKey) {
      return thing.tags.some((tag) => tag.key === filterCriteria.value.key)
    } else {
      return thing.tags.some((tag) => tag.value === filterCriteria.value.value)
    }
  }

  return ownedThings.value.filter(filterFunction)
})

const showSiteForm = ref(false)
const showFilter = ref(false)
const router = useRouter()

const headers = [
  {
    title: 'Site Code',
    key: 'samplingFeatureCode',
  },
  {
    title: 'Site Name',
    key: 'name',
  },
  {
    title: 'Site Type',
    key: 'siteType',
  },
] as const

const handleFilter = (criteria: { key: string; value: string }) => {
  filterCriteria.value = criteria
}

const onRowClick = (event: Event, item: any) => {
  const thing = item.item.raw
  router.push({ name: 'SiteDetails', params: { id: thing.id } })
}

const refreshThings = async () => (things.value = await api.fetchThings())

// TODO: Fetch owned things
onMounted(async () => refreshThings())
</script>
