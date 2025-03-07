<template>
  <h5 class="text-h5 mt-8 mb-6">Payloads for this data source</h5>

  <v-card>
    <v-toolbar title="Payloads" flat color="secondary">
      <v-spacer />
      <v-text-field
        :disabled="!payloads?.length"
        class="mx-2"
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
      />

      <v-btn-add class="mr-2" @click="openCreate = true" color="white">
        Add new payload
      </v-btn-add>
    </v-toolbar>
    <v-data-table-virtual
      :headers="payloadHeaders"
      :items="payloads"
      :sort-by="sortBy"
      :search="search"
      :style="{ 'max-height': `100vh` }"
      fixed-header
    >
      <template v-slot:item.info="{ item }">
        <v-col>
          <v-row
            v-for="{
              sourceIdentifier,
              targetIdentifier,
            } in item.sourceTargetMap"
            style="font-size: 1.2em"
          >
            <p>
              <strong>{{ sourceIdentifier }}: </strong> {{ targetIdentifier }}
            </p>
          </v-row>
        </v-col>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
        <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" width="40rem">
    <PayloadForm @close="openCreate = false" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="40rem">
    <PayloadForm :payload="selectedPayload" @close="openEdit = false" />
  </v-dialog>
</template>

<script setup lang="ts">
import PayloadForm from '@/components/DataSource/PayloadForm.vue'
import { Payload } from '@/types'
import { ref } from 'vue'

const selectedPayload = ref<Payload>()
const search = ref()
const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)

const sortBy = [{ key: 'name' }]

const payloadHeaders = [
  { title: 'Name', key: 'name' },
  {
    title: 'Source to target mapping',
    key: 'info',
    sortable: false,
  },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const payloads = [
  {
    name: 'Example payload 1',
    sourceTargetMap: [
      {
        sourceIdentifier: 'water_level_ft',
        targetIdentifier: '1928-125-3484-8348',
      },
      {
        sourceIdentifier: 'temperature_f',
        targetIdentifier: '0985-157-3486-3257',
      },
    ],
  },
  {
    name: 'Example payload 2',
    sourceTargetMap: [
      {
        sourceIdentifier: 'water_level_ft',
        targetIdentifier: '1928-125-3484-8348',
      },
      {
        sourceIdentifier: 'temperature_f',
        targetIdentifier: '0985-157-3486-3257',
      },
    ],
  },
] as Payload[]

function openDialog(selectedItem: Payload, dialog: string) {
  selectedPayload.value = selectedItem
  if (dialog === 'edit') openEdit.value = true
  else if (dialog === 'delete') openDelete.value = true
}
</script>
