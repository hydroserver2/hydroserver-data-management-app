<template>
  <v-card>
    <v-toolbar title="Data connections" flat color="blue-grey">
      <v-spacer />
      <v-text-field
        label="Search"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        hide-details
        density="compact"
        variant="underlined"
        maxWidth="300"
      />

      <v-btn-add class="mx-4" @click="openCreateDialog(null)"
        >Add data connection</v-btn-add
      >
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="items"
      :search="search"
      :loading="loading"
      class="data-connection-table"
      fixed-header
      no-data-text="There's currently no templates for this workspace"
    >
      <template v-slot:item.actions="{ item }">
        <v-icon
          color="secondary"
          :icon="mdiPencil"
          @click="openDialog(item, 'edit')"
        />
        <v-icon
          color="delete"
          :icon="mdiDelete"
          @click="openDialog(item, 'delete')"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog
    v-model="openCreate"
    transition="dialog-bottom-transition"
    width="60rem"
  >
    <DataConnectionForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="80rem">
    <DataConnectionForm
      :dataConnection="item"
      @close="openEdit = false"
      @updated="onUpdate"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteDataConnectionCard
      @close="openDelete = false"
      @delete="onDelete"
      :itemName="item.name"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import DataConnectionForm from '@/components/Orchestration/DataConnectionForm.vue'
import hs, { OrchestrationSystem, DataConnection } from '@hydroserver/client'
import { mdiMagnify, mdiPencil, mdiDelete } from '@mdi/js'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteDataConnectionCard from './DeleteDataConnectionCard.vue'

const props = defineProps<{
  workspaceId: string
}>()

const openCreate = ref(false)
const search = ref()
const selectedOrchestrationSystem = ref<OrchestrationSystem>()
const loading = ref(false)

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (wsId: string) =>
      await hs.dataConnections.listAllItems({
        workspace_id: [wsId],
        expand_related: true,
        order_by: ['name'],
      }),
    hs.dataConnections.delete,
    DataConnection,
    toRef(props, 'workspaceId')
  )

const refreshTable = async () => {
  items.value = await hs.dataConnections.listAllItems({
    workspace_id: [props.workspaceId],
    expand_related: true,
    order_by: ['name'],
  })
}

const openCreateDialog = (selectedItem: any) => {
  selectedOrchestrationSystem.value = selectedItem
  openCreate.value = true
}

const headers = [
  {
    title: 'Data connection name',
    key: 'name',
  },
  {
    title: 'Extractor',
    key: 'extractor.type',
  },
  {
    title: 'Transformer',
    key: 'transformer.type',
  },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>

<style scoped>
.data-connection-table :deep(.v-table__wrapper) {
  max-height: 56vh;
}
</style>
