<template>
  <v-navigation-drawer v-model="sidebar.isOpen" width="400">
    <v-list>
      <v-list-subheader class="text-h6 mb-2 mt-1">
        Browse data collection sites
      </v-list-subheader>

      <v-divider />

      <v-list-item class="d-flex justify-end mt-2">
        <v-btn
          color="primary-darken-2"
          variant="outlined"
          rounded="xl"
          @click="onClearFilters"
          append-icon="mdi-close"
          >Clear filters</v-btn
        >
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          class="pt-2"
          v-model="selectedWorkspaces"
          :items="workspaces"
          item-title="name"
          return-object
          clearable
          prepend-inner-icon="mdi-domain"
          label="Workspaces"
          multiple
          hide-details
          color="primary"
          density="compact"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              color="primary"
              rounded
              closable
              @click:close="selectedWorkspaces.splice(index)"
            >
              <span>{{ item.title }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-expansion-panels class="pa-4" v-model="panelOpen">
        <v-expansion-panel title="Site types" color="secondary-darken-1">
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
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Thing, Workspace } from '@/types'
import { siteTypes } from '@/config/vocabularies'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { useSidebarStore } from '@/store/useSidebar'

const { smAndDown } = useDisplay()
const selectedSiteTypes = ref<string[]>([])
const selectedWorkspaces = ref<Workspace[]>([])
const panelOpen = ref([0])

const emit = defineEmits(['filter'])
const props = defineProps({
  things: {
    type: Array as () => Thing[],
    required: true,
  },
})

const { workspaces } = storeToRefs(useWorkspaceStore())
const sidebar = useSidebarStore()
sidebar.isOpen = !!smAndDown

const inSelectedWorkspaces = (thing: Thing) =>
  selectedWorkspaces.value.length === 0 ||
  selectedWorkspaces.value.find((ws) => ws.id === thing.workspaceId)

const isTypeValid = (thing: Thing) =>
  selectedSiteTypes.value.length === 0 ||
  selectedSiteTypes.value.includes(thing.siteType)

const emitFilteredThings = () => {
  const filteredThings = props.things.filter(
    (thing) => inSelectedWorkspaces(thing) && isTypeValid(thing)
  )
  emit('filter', filteredThings)
}

const onClearFilters = () => {
  selectedSiteTypes.value = []
  selectedWorkspaces.value = []
}

watch([selectedSiteTypes, selectedWorkspaces], emitFilteredThings)
</script>
