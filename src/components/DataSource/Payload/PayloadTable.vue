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
        :prepend-inner-icon="mdiMagnify"
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
      :items="filteredPayloads"
      :sort-by="sortBy"
      :search="search"
      :style="{ 'max-height': '100vh' }"
      :virtual-scroll-props="{ itemHeight: 0, bench: 12 }"
      density="compact"
    >
      <template #item.overview="{ item }">
        <Swimlanes
          :payload="item"
          @edit="openDialog($event, 'edit')"
          @delete="openDialog($event, 'delete')"
        />
      </template>
    </v-data-table-virtual>
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
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import PayloadForm from '@/components/DataSource/Payload/PayloadForm.vue'
import DeletePayloadCard from './DeletePayloadCard.vue'
import Swimlanes from './Swimlanes.vue'
import { useDataSourceStore } from '@/store/datasource'
import { Payload } from '@hydroserver/client'
import { mdiMagnify } from '@mdi/js'

const { payloads, linkedDatastreams } = storeToRefs(useDataSourceStore())
const selectedPayload = ref<Payload>()
const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)
const search = ref()
const sortBy = [{ key: 'name' as const }]

const filteredPayloads = computed(() =>
  payloads.value.map((p) => {
    const mapped = {
      ...p,
      searchText: '',
    }

    const sourceIds = (p.mappings ?? []).map((m) =>
      String(m.sourceIdentifier ?? '')
    )

    const targetIds = (p.mappings ?? []).flatMap((m) =>
      (m.paths ?? []).map((path) => String(path.targetIdentifier ?? ''))
    )

    const targetNames = targetIds.map((tid) => {
      const ds = (linkedDatastreams.value ?? []).find(
        (d) => String(d.id) === tid
      )
      return ds?.name ?? ''
    })

    mapped.searchText = [
      mapped.name,
      ...sourceIds,
      ...targetIds,
      ...targetNames,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return mapped
  })
)

const payloadHeaders = [
  {
    title: 'Source → Data transformations → Target',
    key: 'overview',
    value: 'searchText',
    sortable: false,
  },
] as const

function openDialog(selectedItem: Payload, dialog: 'edit' | 'delete') {
  selectedPayload.value = new Payload(selectedItem)
  if (dialog === 'edit') openEdit.value = true
  else openDelete.value = true
}
</script>
