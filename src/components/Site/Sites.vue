<template>
  <div class="mb-8 flex-shrink-0" style="height: 25rem">
    <GoogleMap
      v-if="thingStore.ownedThings"
      :key="thingStore.ownedThings"
      :things="thingStore.ownedThings"
    ></GoogleMap>
  </div>

  <v-container>
    <v-row class="mb-4">
      <v-col cols="auto">
        <h5 class="text-h5">My Registered Sites</h5>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="auto">
        <v-btn-secondary @click="showSiteForm = true" prependIcon="mdi-plus"
          >Register a new site</v-btn-secondary
        >
        <v-dialog v-model="showSiteForm" width="60rem">
          <SiteForm @close="showSiteForm = false"></SiteForm>
        </v-dialog>
      </v-col>
    </v-row>

    <v-data-table
      v-if="thingStore.ownedThings && thingStore.ownedThings.length"
      :headers="headers"
      :items="thingStore.ownedThings"
      hover
      item-value="id"
      class="elevation-3 owned-sites-table"
      @click:row="onRowClick"
    >
    </v-data-table>

    <p v-else class="text-body-1 text-medium-emphasis">
      You have not registered any sites.
    </p>
  </v-container>
</template>

<script setup lang="ts">
import GoogleMap from '@/components/GoogleMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { useThingStore } from '@/store/things'

const thingStore = useThingStore()
const showSiteForm = ref(false)
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

const onRowClick = (event: Event, item: any) => {
  const thing = item.item.raw
  router.push({ name: 'SiteDetails', params: { id: thing.id } })
}

onMounted(async () => thingStore.fetchThings())
</script>
