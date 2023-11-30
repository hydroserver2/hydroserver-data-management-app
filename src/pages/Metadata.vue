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
        <!--    Observed Properties Table and Modal-->
        <v-data-table
          :headers="OPHeaders"
          :items="opStore.ownedOP"
          class="elevation-3"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="openOPDialog(item.raw)"> mdi-pencil </v-icon>
            <v-icon @click="openOPDeleteDialog(item.raw)"> mdi-delete </v-icon>
          </template></v-data-table
        >
        <v-dialog v-model="isOPCEModalOpen" width="60rem">
          <ObservedPropertyModal
            :id="isOPSelected ? selectedOP.id : null"
            @close="isOPCEModalOpen = false"
          ></ObservedPropertyModal>
        </v-dialog>
        <v-dialog v-model="isOPDModalOpen" width="40rem">
          <DeleteMetadataCard
            itemName="Observed Property"
            :itemID="selectedOP.id"
            parameter-name="observedPropertyId"
            @delete="deleteOP"
            @close="isOPDModalOpen = false"
          />
        </v-dialog>
      </v-window-item>

      <v-window-item value="2">
        <!--    Processing Levels Table and Modal-->
        <v-data-table
          :headers="ProcLevelHeaders"
          :items="plStore.ownedProcessingLevels"
          class="elevation-3"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="openPLDialog(item.raw)"> mdi-pencil </v-icon>
            <v-icon @click="openPLDeleteDialog(item.raw)"> mdi-delete </v-icon>
          </template></v-data-table
        >
        <v-dialog v-model="isPLCEModalOpen" width="60rem">
          <ProcessingLevelModal
            :id="isPLSelected ? selectedPL.id : undefined"
            @close="isPLCEModalOpen = false"
          ></ProcessingLevelModal>
        </v-dialog>
        <v-dialog v-model="isPLDModalOpen" width="40rem">
          <DeleteMetadataCard
            itemName="processing level"
            :itemID="selectedPL.id"
            parameter-name="processingLevelId"
            @delete="deletePL"
            @close="isPLDModalOpen = false"
          />
        </v-dialog>
      </v-window-item>

      <v-window-item value="3">
        <UnitTable :key="unitKey" />
      </v-window-item>

      <v-window-item value="4">
        <!--    Result Qualifiers Table and Modal-->
        <v-data-table
          :headers="ResultQualifierHeaders"
          :items="rqStore.ownedResultQualifiers"
          class="elevation-3"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon @click="openRQDialog(item.raw)"> mdi-pencil </v-icon>
            <v-icon @click="openRQDeleteDialog(item.raw)"> mdi-delete </v-icon>
          </template></v-data-table
        >
        <v-dialog v-model="isRQCEModalOpen" width="60rem">
          <ResultQualifierModal
            :id="isRQSelected ? selectedRq.id : undefined"
            @close="isRQCEModalOpen = false"
          ></ResultQualifierModal>
        </v-dialog>
        <v-dialog v-model="isRQDModalOpen" width="40rem">
          <DeleteMetadataCard
            itemName="result qualifier"
            :itemID="selectedRq.id"
            parameter-name="resultQualifierId"
            @delete="deleteRQ"
            @close="isRQDModalOpen = false"
          />
        </v-dialog>
      </v-window-item>
    </v-window>
  </v-container>

  <v-dialog v-model="openUnitCreate" width="60rem">
    <UnitFormCard @close="openUnitCreate = false" @created="refreshUnitTable" />
  </v-dialog>
</template>

<script lang="ts" setup>
import SensorModal from '@/components/Datastream/SensorModal.vue'
import ObservedPropertyModal from '@/components/Datastream/ObservedPropertyModal.vue'
import ProcessingLevelModal from '@/components/Datastream/ProcessingLevelModal.vue'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useSensorStore } from '@/store/sensors'
import { useObservedPropertyStore } from '@/store/observedProperties'
import { useResultQualifierStore } from '@/store/resultQualifiers'
import DeleteMetadataCard from '@/components/Metadata/DeleteMetadataCard.vue'
import { ref } from 'vue'
import UnitFormCard from '@/components/Metadata/UnitFormCard.vue'
import UnitTable from '@/components/Metadata/UnitTable.vue'

import {
  useSensorModals,
  useProcessingLevelModals,
  useObservedPropertyModals,
  useResultQualifierModals,
} from '@/composables/useMetadataModals'

import ResultQualifierModal from '@/components/Datastream/ResultQualifierModal.vue'

const sensorStore = useSensorStore()
const opStore = useObservedPropertyStore()
const plStore = useProcessingLevelStore()
const rqStore = useResultQualifierStore()

const {
  isEntitySelected: isSensorSelected,
  selectedEntity: selectedSensor,
  deleteSelectedEntity: deleteSensor,
  isCreateEditModalOpen: isSensorCEModalOpen,
  isDeleteModalOpen: isSensorDModalOpen,
  openDialog: openSensorDialog,
  openDeleteDialog: openSensorDeleteDialog,
} = useSensorModals()

const {
  isEntitySelected: isPLSelected,
  selectedEntity: selectedPL,
  deleteSelectedEntity: deletePL,
  isCreateEditModalOpen: isPLCEModalOpen,
  isDeleteModalOpen: isPLDModalOpen,
  openDialog: openPLDialog,
  openDeleteDialog: openPLDeleteDialog,
} = useProcessingLevelModals()

const {
  isEntitySelected: isRQSelected,
  selectedEntity: selectedRq,
  deleteSelectedEntity: deleteRQ,
  isCreateEditModalOpen: isRQCEModalOpen,
  isDeleteModalOpen: isRQDModalOpen,
  openDialog: openRQDialog,
  openDeleteDialog: openRQDeleteDialog,
} = useResultQualifierModals()

const {
  isEntitySelected: isOPSelected,
  selectedEntity: selectedOP,
  deleteSelectedEntity: deleteOP,
  isCreateEditModalOpen: isOPCEModalOpen,
  isDeleteModalOpen: isOPDModalOpen,
  openDialog: openOPDialog,
  openDeleteDialog: openOPDeleteDialog,
} = useObservedPropertyModals()

const openUnitCreate = ref(false)
const unitKey = ref(0)
const refreshUnitTable = () => (unitKey.value += 1)

const metaMap: Record<string, any> = {
  0: {
    name: 'Sensors',
    openDialog: openSensorDialog,
    singularName: 'sensor',
  },
  1: {
    name: 'Observed Properties',
    openDialog: openOPDialog,
    singularName: 'observed property',
  },
  2: {
    name: 'Processing Levels',
    openDialog: openPLDialog,
    singularName: 'processing level',
  },
  3: {
    name: 'Units',
    openDialog: () => (openUnitCreate.value = true),
    singularName: 'unit',
  },
  4: {
    name: 'Result Qualifiers',
    openDialog: openRQDialog,
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

const OPHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Code', key: 'code' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const ProcLevelHeaders = [
  { title: 'Code', key: 'code' },
  { title: 'Definition', key: 'definition' },
  { title: 'Explanation', key: 'explanation' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const ResultQualifierHeaders = [
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>

<style scoped>
.v-icon {
  color: rgb(var(--v-theme-cancel));
}
</style>
