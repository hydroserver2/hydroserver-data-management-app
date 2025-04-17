<template>
  <v-card>
    <v-toolbar flat color="secondary">
      <h6 class="text-h6 ml-4">Payloads for this data source</h6>
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

      <v-btn-add class="mx-4" @click="openCreate = true" color="white">
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
        <v-col class="my-1">
          <v-row
            v-for="{ sourceIdentifier, targetIdentifier } in item.mappings"
            style="font-size: 1.2em"
          >
            <span class="text-medium-emphasis">{{ sourceIdentifier }}</span>
            <v-icon color="green-lighten-2" small class="mx-2"
              >mdi-arrow-right</v-icon
            >
            <span>{{ targetIdentifier }}</span>
          </v-row>
        </v-col>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
        <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" width="80rem">
    <PayloadForm @close="openCreate = false" :old-payload-index="-1" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="80rem">
    <PayloadForm
      :oldPayload="selectedPayload"
      :old-payload-index="
        payloads.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(selectedPayload)
        )
      "
      @close="openEdit = false"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeletePayloadCard
      v-if="selectedPayload"
      :payload="selectedPayload"
      :payload-index="
        payloads.findIndex(
          (p) => JSON.stringify(p) === JSON.stringify(selectedPayload)
        )
      "
      @close="openDelete = false"
    ></DeletePayloadCard>
  </v-dialog>
</template>

<script setup lang="ts">
import PayloadForm from '@/components/DataSource/PayloadForm.vue'
import DeletePayloadCard from './Payload/DeletePayloadCard.vue'
import { Payload } from '@/models'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const { payloads } = storeToRefs(useETLStore())

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

function openDialog(selectedItem: Payload, dialog: string) {
  selectedPayload.value = new Payload(selectedItem)
  if (dialog === 'edit') openEdit.value = true
  else if (dialog === 'delete') openDelete.value = true
}
</script>
