<template>
  <v-navigation-drawer v-model="drawer" width="400">
    <v-card-title class="d-flex justify-space-between align-start">
      Filters
      <v-icon v-if="drawer" @click="drawer = !drawer">mdi-menu-open</v-icon>
    </v-card-title>

    <v-divider />

    <div class="d-flex justify-end my-4 mx-2">
      <v-btn color="blue-grey-lighten-4" elevation="3" @click="onClearFilters"
        >Clear Filters</v-btn
      >
    </div>

    <v-expansion-panels multiple v-model="panels">
      <v-expansion-panel title="Sites">
        <v-expansion-panel-text>
          <v-checkbox
            v-for="thing in things"
            v-model="selectedThings"
            :label="thing.name"
            :value="thing"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Time">
        <v-expansion-panel-text>
          <div class="d-flex justify-center mb-3">
            <v-btn color="blue-grey-lighten-4">All</v-btn>
            <v-btn color="blue-grey-lighten-4" class="mx-1">Last Month</v-btn>
            <v-btn color="blue-grey-lighten-4">Last Week</v-btn>
          </div>

          <v-text-field
            density="compact"
            class="mb-2"
            hide-details
            append-inner-icon="mdi-calendar"
          >
            Begin Date
          </v-text-field>

          <v-text-field
            density="compact"
            hide-details
            append-inner-icon="mdi-calendar"
          >
            End Date
          </v-text-field>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Observed Properties">
        <v-expansion-panel-text>
          <v-checkbox
            label="Nitrate-N, Nitrogen, dissolved nitrate (NO3)"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="fDOM, Colored Dissolved Organic Matter"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="Chlorophyll, Chlorophyll Fluorescence"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Quality Control Level">
        <v-expansion-panel-text>
          <v-checkbox label="Raw Data" hide-details density="compact" />
          <v-checkbox
            label="Quality Controlled Data"
            hide-details
            density="compact"
          />
          <v-checkbox
            label="Double Quality Controlled Data"
            hide-details
            density="compact"
          />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>

  <div class="mt-4 mx-4" v-if="!drawer">
    <v-icon @click="drawer = !drawer">mdi-menu</v-icon>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { onMounted } from 'vue'
import { api } from '@/services/api'

const { smAndDown } = useDisplay()
const panels = ref([0, 1, 2, 3])
const drawer = ref(!!smAndDown)

const selectedThings: Ref<string[]> = ref([])
const things = ref<Thing[]>([])

const onClearFilters = () => {}

onMounted(async () => {
  things.value = await api.fetchOwnedThings()
})
</script>
