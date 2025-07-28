<template>
  <v-container v-if="isPageLoaded">
    <v-row class="mt-2" align="center">
      <v-col cols="auto" class="pb-0">
        <h5 class="text-h5">Manage metadata</h5>
      </v-col>
    </v-row>
    <WorkspaceToolbar />

    <v-card>
      <v-toolbar color="brown" title="Workspace metadata">
        <v-spacer />
        <v-text-field
          class="mx-2"
          clearable
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          hide-details
          density="compact"
          variant="underlined"
          rounded="xl"
          maxWidth="300"
        />

        <template v-slot:extension>
          <v-tabs
            v-model="tab"
            color="secondary-lighten-5"
            scrollable
            class="my-2"
          >
            <v-tab v-for="item in metaMap">{{ item.name }}</v-tab>
          </v-tabs>
        </template>

        <v-btn-add
          prependIcon="mdi-plus"
          color="white"
          class="mx-2"
          @click="metaMap[tab]?.openDialog()"
          >Add new {{ metaMap[tab]?.singularName }}</v-btn-add
        >
      </v-toolbar>

      <v-toolbar color="brown" height="5"></v-toolbar>

      <v-window v-model="tab" class="elevation-3" v-if="selectedWorkspace">
        <v-window-item :value="0">
          <SensorTable
            :key="sensorKey"
            :search="search"
            :workspace-id="selectedWorkspace.id"
          />
        </v-window-item>

        <v-window-item :value="1">
          <ObservedPropertyTable
            :key="OPKey"
            :search="search"
            :workspace-id="selectedWorkspace.id"
          />
        </v-window-item>

        <v-window-item :value="2">
          <ProcessingLevelTable
            :key="PLKey"
            :search="search"
            :workspace-id="selectedWorkspace.id"
          />
        </v-window-item>

        <v-window-item :value="3">
          <UnitTable
            :key="unitKey"
            :search="search"
            :workspace-id="selectedWorkspace.id"
          />
        </v-window-item>

        <v-window-item :value="4">
          <ResultQualifierTable
            :key="qualifierKey"
            :search="search"
            :workspace-id="selectedWorkspace.id"
          />
        </v-window-item>
      </v-window>

      <v-dialog v-model="openUnitCreate" width="60rem">
        <UnitFormCard
          @close="openUnitCreate = false"
          @created="refreshUnitTable"
          :workspace-id="selectedWorkspace!.id"
        />
      </v-dialog>

      <v-dialog v-model="openSensorCreate" width="60rem">
        <SensorFormCard
          @close="openSensorCreate = false"
          @created="refreshSensorTable"
          :workspace-id="selectedWorkspace!.id"
        />
      </v-dialog>

      <v-dialog v-model="openRQCreate" width="60rem">
        <ResultQualifierFormCard
          @close="openRQCreate = false"
          @created="refreshRQTable"
          :workspace-id="selectedWorkspace!.id"
        />
      </v-dialog>

      <v-dialog v-model="openOPCreate" width="60rem">
        <ObservedPropertyFormCard
          @close="openOPCreate = false"
          @created="refreshOPTable"
          :workspace-id="selectedWorkspace!.id"
        />
      </v-dialog>

      <v-dialog v-model="openPLCreate" width="60rem">
        <ProcessingLevelFormCard
          @close="openPLCreate = false"
          @created="refreshPLTable"
          :workspace-id="selectedWorkspace!.id"
        />
      </v-dialog>
    </v-card>

    <v-card class="mt-6">
      <v-toolbar color="deep-orange-darken-4" title="System metadata">
        <v-spacer />

        <template v-slot:extension>
          <v-tabs
            v-model="tab"
            color="secondary-lighten-5"
            scrollable
            class="my-2"
          >
            <v-tab v-for="item in metaMap">{{ item.name }}</v-tab>
          </v-tabs>
        </template>
      </v-toolbar>

      <v-toolbar color="deep-orange-darken-4" height="5"></v-toolbar>

      <v-window v-model="tab" class="elevation-3">
        <v-window-item :value="0">
          <v-data-table-virtual
            :headers="sensorHeaders"
            :items="sensors"
            :search="search"
            fixed-header
          >
          </v-data-table-virtual>
        </v-window-item>

        <v-window-item :value="1">
          <v-data-table-virtual
            :headers="OPheaders"
            :items="observedProperties"
            :search="search"
            fixed-header
          >
          </v-data-table-virtual>
        </v-window-item>

        <v-window-item :value="2">
          <v-data-table-virtual
            :headers="procLevelHeaders"
            :items="processingLevels"
            :search="search"
            fixed-header
          >
          </v-data-table-virtual>
        </v-window-item>

        <v-window-item :value="3">
          <v-data-table-virtual
            :headers="unitHeaders"
            :items="units"
            :search="search"
            fixed-header
          >
          </v-data-table-virtual>
        </v-window-item>

        <v-window-item :value="4">
          <v-data-table-virtual
            :headers="resultQualifierHeaders"
            :items="resultQualifiers"
            :search="search"
            fixed-header
          >
          </v-data-table-virtual>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
  <FullScreenLoader v-else />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import UnitTable from '@/components/Metadata/UnitTable.vue'
import SensorTable from '@/components/Metadata/SensorTable.vue'
import ResultQualifierTable from '@/components/Metadata/ResultQualifierTable.vue'
import ProcessingLevelTable from '@/components/Metadata/ProcessingLevelTable.vue'
import ObservedPropertyTable from '@/components/Metadata/ObservedPropertyTable.vue'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'
import UnitFormCard from '@/components/Metadata/UnitFormCard.vue'
import SensorFormCard from '@/components/Metadata/SensorFormCard.vue'
import ResultQualifierFormCard from '@/components/Metadata/ResultQualifierFormCard.vue'
import ProcessingLevelFormCard from '@/components/Metadata/ProcessingLevelFormCard.vue'
import ObservedPropertyFormCard from '@/components/Metadata/ObservedPropertyFormCard.vue'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { api } from '@/services/api'
import { Workspace } from '@/types'
import { useMetadata } from '@/composables/useMetadata'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()
const isPageLoaded = ref(false)

const tab = ref(0)

const openUnitCreate = ref(false)
const unitKey = ref(0)
const refreshUnitTable = () => (unitKey.value += 1)

const openRQCreate = ref(false)
const qualifierKey = ref(0)
const refreshRQTable = () => (qualifierKey.value += 1)

const openPLCreate = ref(false)
const PLKey = ref(0)
const refreshPLTable = () => (PLKey.value += 1)

const openOPCreate = ref(false)
const OPKey = ref(0)
const refreshOPTable = () => (OPKey.value += 1)

const openSensorCreate = ref(false)
const sensorKey = ref(0)
const refreshSensorTable = () => (sensorKey.value += 1)

const search = ref()
const systemSearch = ref()

const metaMap: Record<string, any> = {
  0: {
    name: 'Sensors',
    openDialog: () => (openSensorCreate.value = true),
    singularName: 'sensor',
  },
  1: {
    name: 'Observed properties',
    openDialog: () => (openOPCreate.value = true),
    singularName: 'observed property',
  },
  2: {
    name: 'Processing levels',
    openDialog: () => (openPLCreate.value = true),
    singularName: 'processing level',
  },
  3: {
    name: 'Units',
    openDialog: () => (openUnitCreate.value = true),
    singularName: 'unit',
  },
  4: {
    name: 'Result qualifiers',
    openDialog: () => (openRQCreate.value = true),
    singularName: 'result qualifier',
  },
}

const unitHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Symbol', key: 'symbol' },
] as const

const sensorHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Method Type', key: 'methodType' },
  { title: 'Method Code', key: 'methodCode' },
  { title: 'UUID', key: 'id' },
] as const

const OPheaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Code', key: 'code' },
] as const

const procLevelHeaders = [
  { title: 'Code', key: 'code' },
  { title: 'Definition', key: 'definition' },
  { title: 'Explanation', key: 'explanation' },
] as const

const resultQualifierHeaders = [
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
] as const

// workspace.id will be null
const systemWorkspace = ref(new Workspace())

const {
  sensors,
  units,
  observedProperties,
  processingLevels,
  resultQualifiers,
} = useMetadata(systemWorkspace)

onMounted(async () => {
  try {
    const workspacesResponse = await api.fetchAssociatedWorkspaces()
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  } finally {
    isPageLoaded.value = true
  }
})
</script>
