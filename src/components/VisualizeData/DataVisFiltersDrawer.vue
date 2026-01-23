<template>
  <v-navigation-drawer
    v-model="sidebar.isOpen"
    width="400"
    color="navbar"
    theme="dark"
    class="data-vis-drawer"
  >
    <v-list class="pb-2">
      <v-list-subheader class="text-uppercase">Layout</v-list-subheader>
      <div class="layout-toggle-item">
        <v-switch
          v-model="showPlot"
          class="layout-toggle-switch"
          color="primary"
          density="compact"
          label="Show plot"
          hide-details
          @update:model-value="(value) => handleToggle('plot', value)"
        />
      </div>
      <div class="layout-toggle-item">
        <v-switch
          v-model="showTable"
          class="layout-toggle-switch"
          color="primary"
          density="compact"
          label="Show table"
          hide-details
          @update:model-value="(value) => handleToggle('table', value)"
        />
      </div>
    </v-list>

    <v-divider class="drawer-divider" />

    <v-list-subheader class="text-uppercase"
      >Datastream Filters</v-list-subheader
    >

    <div class="mx-4 d-flex justify-end">
      <v-btn
        color="primary-lighten-2"
        variant="outlined"
        rounded
        :append-icon="mdiClose"
        class="mb-4"
        @click="clearFilters"
      >
        Clear filters
      </v-btn>
    </div>

    <v-expansion-panels color="blue-grey-darken-2" multiple v-model="panels">
      <v-expansion-panel title="Sites">
        <v-expansion-panel-text class="bg-blue-grey-darken-4">
          <v-text-field
            class="my-4"
            clearable
            @click:clear="searchThing = ''"
            v-model="searchThing"
            :prepend-inner-icon="mdiMagnify"
            label="Search"
            density="compact"
            hide-details
          />

          <v-virtual-scroll
            :items="sortedThings"
            :height="sortedThings.length < 6 ? 'auto' : 250"
          >
            <template #default="{ item, index }">
              <v-checkbox
                :key="item.id"
                v-model="selectedThings"
                :label="item.name"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Observed Properties">
        <v-expansion-panel-text class="bg-blue-grey-darken-4">
          <v-text-field
            class="my-4"
            clearable
            @click:clear="searchObservedProperty = ''"
            v-model="searchObservedProperty"
            :prepend-inner-icon="mdiMagnify"
            label="Search"
            density="compact"
            hide-details
          />

          <v-virtual-scroll
            :items="sortedObservedPropertyNames"
            :height="sortedObservedPropertyNames.length < 6 ? 'auto' : 250"
          >
            <template #default="{ item }">
              <v-checkbox
                v-model="selectedObservedPropertyNames"
                :label="item"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <v-expansion-panel title="Processing Levels">
        <v-expansion-panel-text class="bg-blue-grey-darken-4">
          <v-text-field
            class="my-4"
            clearable
            @click:clear="searchProcessingLevel = ''"
            v-model="searchProcessingLevel"
            :prepend-inner-icon="mdiMagnify"
            label="Search"
            density="compact"
            hide-details
          />

          <v-virtual-scroll
            :items="sortedProcessingLevelNames"
            :height="sortedProcessingLevelNames.length < 6 ? 'auto' : 250"
          >
            <template #default="{ item }">
              <v-checkbox
                v-model="selectedProcessingLevelNames"
                :label="item"
                :value="item"
                hide-details
                density="compact"
              />
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { useDataVisStore } from '@/store/dataVisualization'
import { storeToRefs } from 'pinia'
import { useSidebarStore } from '@/store/useSidebar'
import { mdiMagnify, mdiClose } from '@mdi/js'

const {
  matchesSelectedObservedProperty,
  matchesSelectedProcessingLevel,
  matchesSelectedThing,
} = useDataVisStore()
const {
  things,
  datastreams,
  processingLevels,
  observedProperties,
  selectedThings,
  selectedObservedPropertyNames,
  selectedProcessingLevelNames,
  showPlot,
  showTable,
} = storeToRefs(useDataVisStore())

const searchThing = ref('')
const searchObservedProperty = ref('')
const searchProcessingLevel = ref('')

// Only show list items that are referenced by at least one datastream
// Then mutually filter the lists by selected filters.
const sortedProcessingLevelNames = computed(() => {
  const searchQuery = (searchProcessingLevel.value ?? '').toLowerCase()
  const filteredPLs = processingLevels.value.filter((pl) => {
    const definition = pl.definition ?? ''
    return (
      definition.toLowerCase().includes(searchQuery) &&
      datastreams.value.some(
        (ds) =>
          ds.processingLevelId === pl.id &&
          matchesSelectedThing(ds) &&
          matchesSelectedObservedProperty(ds)
      )
    )
  })
  const names = filteredPLs.map((pl) => pl.definition)
  return [...new Set(names)].sort()
})

const sortedThings = computed(() => {
  return things.value
    .filter(
      (thing) =>
        thing.name.toLowerCase().includes(searchThing.value.toLowerCase()) &&
        datastreams.value.some(
          (ds) =>
            ds.thingId === thing.id &&
            matchesSelectedObservedProperty(ds) &&
            matchesSelectedProcessingLevel(ds)
        )
    )
    .sort((a, b) => a.name.localeCompare(b.name))
})

const sortedObservedPropertyNames = computed(() => {
  const filteredProperties = observedProperties.value.filter(
    (op) =>
      op.name
        .toLowerCase()
        .includes(searchObservedProperty.value.toLowerCase()) &&
      datastreams.value.some(
        (ds) =>
          ds.observedPropertyId === op.id &&
          matchesSelectedThing(ds) &&
          matchesSelectedProcessingLevel(ds)
      )
  )

  const names = filteredProperties.map((pl) => pl.name)
  return [...new Set(names)].sort()
})

// Watchers to handle deselection of hidden items
watch(sortedThings, (newVal, oldVal) => {
  if (newVal.length < oldVal.length) {
    selectedThings.value = selectedThings.value.filter((selectedThing) =>
      newVal.some((thing) => thing.id === selectedThing.id)
    )
  }
})

watch(sortedObservedPropertyNames, (newVal, oldVal) => {
  if (newVal.length < oldVal.length) {
    selectedObservedPropertyNames.value =
      selectedObservedPropertyNames.value.filter((name) =>
        newVal.includes(name)
      )
  }
})

watch(sortedProcessingLevelNames, (newVal, oldVal) => {
  if (newVal.length < oldVal.length) {
    selectedProcessingLevelNames.value =
      selectedProcessingLevelNames.value.filter((name) => newVal.includes(name))
  }
})

const emit = defineEmits<{
  (e: 'drawer-change', value: boolean): void
}>()

const clearFilters = () => {
  selectedThings.value = []
  selectedObservedPropertyNames.value = []
  selectedProcessingLevelNames.value = []

  searchThing.value = ''
  searchObservedProperty.value = ''
  searchProcessingLevel.value = ''
}

const handleToggle = (toggled: 'plot' | 'table', value: boolean) => {
  if (value) return

  if (toggled === 'plot') {
    showTable.value = true
  } else {
    showPlot.value = true
  }
}

const { smAndDown } = useDisplay()
const panels = ref([0, 1, 2])
const sidebar = useSidebarStore()

onMounted(() => {
  sidebar.isOpen = !smAndDown.value
})

watch(smAndDown, (isMobile) => {
  if (isMobile) sidebar.isOpen = false
})

watch(
  () => sidebar.isOpen,
  (value) => {
    emit('drawer-change', value)
  }
)
</script>

<style scoped>
:deep(.v-selection-control),
:deep(.v-label) {
  align-items: start;
}

.data-vis-drawer :deep(.v-list-item),
.data-vis-drawer :deep(.v-list-subheader) {
  padding-inline-start: 16px;
  padding-inline-end: 16px;
}

.layout-toggle-item {
  padding: 4px 20px;
}

.layout-toggle-switch {
  width: 100%;
}

.layout-toggle-switch :deep(.v-input__control) {
  width: 100%;
}

.layout-toggle-switch :deep(.v-label) {
  white-space: nowrap;
}

.drawer-divider {
  border-top-width: 2px;
}
</style>
