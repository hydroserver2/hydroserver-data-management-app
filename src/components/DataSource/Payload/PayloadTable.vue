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

    <v-data-table
      :headers="payloadHeaders"
      :items="payloads"
      :sort-by="sortBy"
      :search="search"
      :group-by="groupBy"
      :style="{ 'max-height': '100vh' }"
      fixed-header
      density="compact"
      hide-default-footer
    >
      <template
        v-slot:group-header="{ item, columns, toggleGroup, isGroupOpen }"
      >
        <tr class="bg-blue-grey-lighten-5" @click="toggleGroup(item)">
          <td :colspan="columns.length">
            <div class="d-flex align-center">
              <v-btn
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                color="medium-emphasis"
                density="comfortable"
                size="small"
                variant="outlined"
                @click.stop="toggleGroup(item)"
              />
              <span class="ms-4">{{ item.value }}</span>
              <v-spacer />

              <v-chip
                v-if="item.items?.length"
                prepend-icon="mdi-source-branch"
                variant="text"
                rounded="xl"
              >
                {{ item.items[0]?.raw?.mappings?.length ?? 0 }} source{{
                  (item.items[0]?.raw?.mappings?.length ?? 0) === 1 ? '' : 's'
                }}
              </v-chip>

              <v-btn
                class="ms-2"
                variant="text"
                color="green"
                icon="mdi-pencil"
                @click.stop="openDialog(item.items[0].raw, 'edit')"
              />
              <v-btn
                class="ms-1"
                variant="text"
                color="red-darken-3"
                icon="mdi-delete"
                @click.stop="openDialog(item.items[0].raw, 'delete')"
              />
            </div>
          </td>
        </tr>
      </template>

      <template #item.overview="{ item }">
        <Swimlanes :payload="item" />
      </template>
    </v-data-table>
  </v-card>

  <v-dialog v-model="openCreate" width="95rem">
    <PayloadForm @close="openCreate = false" :old-payload-index="-1" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="95rem">
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
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import PayloadForm from '@/components/DataSource/Payload/PayloadForm.vue'
import DeletePayloadCard from './DeletePayloadCard.vue'
import Swimlanes from './Swimlanes.vue'
import { useDataSourceStore } from '@/store/datasource'

import { Payload } from '@/models'

const { payloads } = storeToRefs(useDataSourceStore())

const selectedPayload = ref<Payload>()
const search = ref<string | undefined>()
const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)

const sortBy = [{ key: 'name' as const }]
const groupBy = [{ key: 'name', order: 'asc' }] as const

const payloadHeaders = [
  {
    title:
      'Source to targets mappings (source → data transformations → target)',
    key: 'overview',
    sortable: false,
  },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

function openDialog(selectedItem: Payload, dialog: 'edit' | 'delete') {
  selectedPayload.value = new Payload(selectedItem)
  if (dialog === 'edit') openEdit.value = true
  else openDelete.value = true
}
</script>
