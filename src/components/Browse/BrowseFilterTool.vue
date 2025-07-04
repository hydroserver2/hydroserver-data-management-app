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
          :item-props="(ws) => ({ subtitle: `Owned by: ${ws?.owner?.name}` })"
          item-title="name"
          return-object
          clearable
          prepend-inner-icon="mdi-domain"
          label="Workspaces"
          multiple
          hide-details
          color="primary"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              color="primary-darken-2"
              rounded
              closable
              density="comfortable"
              @click:close="selectedWorkspaces.splice(index, 1)"
            >
              <span>{{ item.title }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>

      <v-list-item>
        <v-autocomplete
          class="pt-2"
          label="Site types"
          v-model="selectedSiteTypes"
          :items="vocabularyStore.siteTypes"
          clearable
          prepend-inner-icon="mdi-water-pump"
          multiple
          hide-details
          color="primary"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip
              color="primary-darken-2"
              rounded
              density="comfortable"
              closable
              @click:close="selectedSiteTypes.splice(index, 1)"
            >
              <span>{{ item.title }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Thing, Workspace } from '@/types'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useSidebarStore } from '@/store/useSidebar'
import { api } from '@/services/api'
import { useVocabularyStore } from '@/composables/useVocabulary'

const { smAndDown } = useDisplay()
const vocabularyStore = useVocabularyStore()

const selectedSiteTypes = ref<string[]>([])
const selectedWorkspaces = ref<Workspace[]>([])
const panelOpen = ref([0])
const workspaces = ref<Workspace[]>([])

const emit = defineEmits(['filter'])
const props = defineProps({
  things: {
    type: Array as () => Thing[],
    required: true,
  },
})

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

onMounted(async () => {
  try {
    workspaces.value = await api.fetchWorkspaces()
    workspaces.value.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching workspaces')
  }
})

watch([selectedSiteTypes, selectedWorkspaces], emitFilteredThings, {
  deep: true,
})
</script>
