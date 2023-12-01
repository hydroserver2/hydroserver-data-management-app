<template>
  <v-container>
    <h5 class="text-h5 mb-4">Manage Metadata</h5>

    <v-tabs v-model="tab" bg-color="brown" color="white" scrollable>
      <v-tab v-for="metadata in metaMap">{{ metadata.name }}</v-tab>
      <v-spacer></v-spacer>
      <div class="d-flex align-center pr-4">
        <v-btn-add
          prependIcon="mdi-plus"
          color="white"
          @click="metaMap[tab]?.openDialog()"
          >Add New {{ metaMap[tab]?.singularName }}</v-btn-add
        >
      </div>
    </v-tabs>

    <v-window v-model="tab" class="elevation-3">
      <v-window-item value="0">
        <!--    Sensor Table and Modal-->
        <v-data-table
          :headers="sensorHeaders"
          :items="sensorStore.sensors"
          class="elevation-3"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="openSensorDialog(item.raw)"> mdi-pencil </v-icon>
            <v-icon @click="openSensorDeleteDialog(item.raw)">
              mdi-delete
            </v-icon>
          </template></v-data-table
        >
        <v-dialog v-model="isSensorCEModalOpen" width="60rem">
          <SensorModal
            :id="isSensorSelected ? selectedSensor.id : undefined"
            @close="isSensorCEModalOpen = false"
          ></SensorModal>
        </v-dialog>
        <v-dialog v-model="isSensorDModalOpen" width="40rem">
          <DeleteMetadataCard
            itemName="sensor"
            :itemID="selectedSensor.id"
            parameter-name="sensorId"
            @delete="deleteSensor"
            @close="isSensorDModalOpen = false"
          />
        </v-dialog>
      </v-window-item>

      <v-window-item value="1">
        <ObservedPropertyTable :key="OPKey" />
      </v-window-item>

      <v-window-item value="2">
        <ProcessingLevelTable :key="PLKey" />
      </v-window-item>

      <v-window-item value="3">
        <UnitTable :key="unitKey" />
      </v-window-item>

      <v-window-item value="4">
        <ResultQualifierTable :key="qualifierKey" />
      </v-window-item>
    </v-window>
  </v-container>

  <v-dialog v-model="openUnitCreate" width="60rem">
    <UnitFormCard @close="openUnitCreate = false" @created="refreshUnitTable" />
  </v-dialog>

  <v-dialog v-model="openRQCreate" width="60rem">
    <ResultQualifierFormCard
      @close="openRQCreate = false"
      @created="refreshRQTable"
    />
  </v-dialog>

  <v-dialog v-model="openOPCreate" width="60rem">
    <ObservedPropertyFormCard
      @close="openOPCreate = false"
      @created="refreshOPTable"
    />
  </v-dialog>

  <v-dialog v-model="openPLCreate" width="60rem">
    <ProcessingLevelFormCard
      @close="openPLCreate = false"
      @created="refreshPLTable"
    />
  </v-dialog>
</template>

<script lang="ts" setup>
import SensorModal from '@/components/Datastream/SensorModal.vue'
import { useSensorStore } from '@/store/sensors'
import DeleteMetadataCard from '@/components/Metadata/DeleteMetadataCard.vue'
import { ref } from 'vue'
import UnitTable from '@/components/Metadata/UnitTable.vue'
import ResultQualifierTable from '@/components/Metadata/ResultQualifierTable.vue'
import ProcessingLevelTable from '@/components/Metadata/ProcessingLevelTable.vue'
import ObservedPropertyTable from '@/components/Metadata/ObservedPropertyTable.vue'

import UnitFormCard from '@/components/Metadata/UnitFormCard.vue'
import ResultQualifierFormCard from '@/components/Metadata/ResultQualifierFormCard.vue'
import ProcessingLevelFormCard from '@/components/Metadata/ProcessingLevelFormCard.vue'
import ObservedPropertyFormCard from '@/components/Metadata/ObservedPropertyFormCard.vue'

import { useSensorModals } from '@/composables/useMetadataModals'

const sensorStore = useSensorStore()

const {
  isEntitySelected: isSensorSelected,
  selectedEntity: selectedSensor,
  deleteSelectedEntity: deleteSensor,
  isCreateEditModalOpen: isSensorCEModalOpen,
  isDeleteModalOpen: isSensorDModalOpen,
  openDialog: openSensorDialog,
  openDeleteDialog: openSensorDeleteDialog,
} = useSensorModals()

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

const metaMap: Record<string, any> = {
  0: {
    name: 'Sensors',
    openDialog: openSensorDialog,
    singularName: 'sensor',
  },
  1: {
    name: 'Observed Properties',
    openDialog: () => (openOPCreate.value = true),
    singularName: 'observed property',
  },
  2: {
    name: 'Processing Levels',
    openDialog: () => (openPLCreate.value = true),
    singularName: 'processing level',
  },
  3: {
    name: 'Units',
    openDialog: () => (openUnitCreate.value = true),
    singularName: 'unit',
  },
  4: {
    name: 'Result Qualifiers',
    openDialog: () => (openRQCreate.value = true),
    singularName: 'result qualifier',
  },
}
const tab = ref(0)

const sensorHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Method Type', key: 'methodType' },
  { title: 'Method Code', key: 'methodCode' },
  { title: 'UUID', key: 'id' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>

<style scoped>
.v-icon {
  color: rgb(var(--v-theme-cancel));
}
</style>
