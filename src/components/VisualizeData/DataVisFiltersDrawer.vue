<template>
  <v-navigation-drawer
    v-model="sidebar.isOpen"
    width="400"
    class="border-r border-slate-200 bg-slate-50 text-slate-900"
  >
    <div class="flex h-full flex-col gap-4 px-4 py-4">
      <div>
        <div class="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Layout
        </div>
        <div class="mt-2 space-y-1">
          <v-switch
            v-model="showPlot"
            class="w-full [&_.v-input__control]:w-full [&_.v-label]:whitespace-nowrap [&_.v-label]:text-slate-700"
            color="primary"
            density="compact"
            label="Show plot"
            hide-details
            @update:model-value="(value) => handleToggle('plot', value)"
          />
          <v-switch
            v-model="showTable"
            class="w-full [&_.v-input__control]:w-full [&_.v-label]:whitespace-nowrap [&_.v-label]:text-slate-700"
            color="primary"
            density="compact"
            label="Show table"
            hide-details
            @update:model-value="(value) => handleToggle('table', value)"
          />
        </div>
      </div>

      <div class="flex items-center justify-between px-1">
        <div class="text-[11px] uppercase tracking-[0.25em] text-slate-500">
          Datastream Filters
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          rounded
          :append-icon="mdiClose"
          class="text-xs"
          @click="clearFilters"
        >
          Clear filters
        </v-btn>
      </div>

      <div class="flex flex-1 flex-col gap-3 overflow-auto pr-1">
        <div>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Sites</span>
            <span>{{ sortedThings.length }}/{{ totalThingsCount }}</span>
          </div>
          <div class="pt-2">
            <v-autocomplete
              v-model="selectedThings"
              v-model:search="searchThing"
              :items="sortedThings"
              item-title="name"
              return-object
              multiple
              clearable
              :prepend-inner-icon="mdiMagnify"
              label="Search sites"
              density="compact"
              variant="outlined"
              hide-details
              class="mt-2 [&_.v-field]:rounded-md [&_.v-field]:border [&_.v-field]:border-slate-200 [&_.v-field]:bg-white [&_.v-field]:text-slate-700 [&_.v-field-label]:text-slate-500"
            >
              <template #selection="{ item, index }">
                <v-chip
                  size="small"
                  closable
                  class="mr-1 mb-1 max-w-full"
                  @click:close="selectedThings.splice(index, 1)"
                >
                  <span class="whitespace-normal break-words">
                    {{ item.title }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Observed Properties</span>
            <span>
              {{ sortedObservedPropertyNames.length }}/{{
                totalObservedPropertyNamesCount
              }}
            </span>
          </div>
          <div class="pt-2">
            <v-autocomplete
              v-model="selectedObservedPropertyNames"
              v-model:search="searchObservedProperty"
              :items="sortedObservedPropertyNames"
              multiple
              clearable
              :prepend-inner-icon="mdiMagnify"
              label="Search observed properties"
              density="compact"
              variant="outlined"
              hide-details
              class="mt-2 [&_.v-field]:rounded-md [&_.v-field]:border [&_.v-field]:border-slate-200 [&_.v-field]:bg-white [&_.v-field]:text-slate-700 [&_.v-field-label]:text-slate-500"
            >
              <template #selection="{ item, index }">
                <v-chip
                  size="small"
                  closable
                  class="mr-1 mb-1 max-w-full"
                  @click:close="selectedObservedPropertyNames.splice(index, 1)"
                >
                  <span class="whitespace-normal break-words">
                    {{ item.title }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between text-xs text-slate-400">
            <span>Processing Levels</span>
            <span>
              {{ sortedProcessingLevelNames.length }}/{{
                totalProcessingLevelNamesCount
              }}
            </span>
          </div>
          <div class="pt-2">
            <v-autocomplete
              v-model="selectedProcessingLevelNames"
              v-model:search="searchProcessingLevel"
              :items="sortedProcessingLevelNames"
              multiple
              clearable
              :prepend-inner-icon="mdiMagnify"
              label="Search processing levels"
              density="compact"
              variant="outlined"
              hide-details
              class="mt-2 [&_.v-field]:rounded-md [&_.v-field]:border [&_.v-field]:border-slate-200 [&_.v-field]:bg-white [&_.v-field]:text-slate-700 [&_.v-field-label]:text-slate-500"
            >
              <template #selection="{ item, index }">
                <v-chip
                  size="small"
                  closable
                  class="mr-1 mb-1 max-w-full"
                  @click:close="selectedProcessingLevelNames.splice(index, 1)"
                >
                  <span class="whitespace-normal break-words">
                    {{ item.title }}
                  </span>
                </v-chip>
              </template>
            </v-autocomplete>
          </div>
        </div>
      </div>
    </div>
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
const totalThingsCount = computed(() => {
  const ids = new Set<string>()
  datastreams.value.forEach((ds) => {
    if (ds.thingId) ids.add(ds.thingId)
  })
  return things.value.filter((thing) => ids.has(thing.id)).length
})

const totalObservedPropertyNamesCount = computed(() => {
  const ids = new Set<string>()
  datastreams.value.forEach((ds) => {
    if (ds.observedPropertyId) ids.add(ds.observedPropertyId)
  })
  const names = new Set<string>()
  observedProperties.value.forEach((op) => {
    if (ids.has(op.id) && op.name) names.add(op.name)
  })
  return names.size
})

const totalProcessingLevelNamesCount = computed(() => {
  const ids = new Set<string>()
  datastreams.value.forEach((ds) => {
    if (ds.processingLevelId) ids.add(ds.processingLevelId)
  })
  const names = new Set<string>()
  processingLevels.value.forEach((pl) => {
    if (ids.has(pl.id) && pl.definition) names.add(pl.definition)
  })
  return names.size
})

// Only show list items that are referenced by at least one datastream
// Then mutually filter the lists by selected filters.
const sortedProcessingLevelNames = computed(() => {
  const filteredPLs = processingLevels.value.filter((pl) => {
    const definition = pl.definition ?? ''
    return datastreams.value.some(
      (ds) =>
        ds.processingLevelId === pl.id &&
        matchesSelectedThing(ds) &&
        matchesSelectedObservedProperty(ds)
    )
  })
  const names = filteredPLs.map((pl) => pl.definition)
  return [...new Set(names)].sort()
})

const sortedThings = computed(() => {
  return things.value
    .filter((thing) =>
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
  const filteredProperties = observedProperties.value.filter((op) =>
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
