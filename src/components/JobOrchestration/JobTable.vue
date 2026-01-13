<template>
  <v-card>
    <v-toolbar title="Task Templates" flat color="blue-grey">
      <v-spacer />
      <v-text-field
        label="Search"
        class="mx-4"
        clearable
        v-model="search"
        :prepend-inner-icon="mdiMagnify"
        hide-details
        density="compact"
        variant="underlined"
        maxWidth="300"
      />

      <v-btn-add class="mx-4" @click="openCreateDialog(null)"
        >Add task template</v-btn-add
      >
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="items"
      :search="search"
      :loading="loading"
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
    <JobForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>

  <v-dialog v-model="openEdit" width="80rem">
    <JobForm :job="item" @close="openEdit = false" @updated="onUpdate" />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteJobCard
      @close="openDelete = false"
      @delete="onDelete"
      :itemName="item.name"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import JobForm from '@/components/JobOrchestration/JobForm.vue'
import hs, { OrchestrationSystem, Job } from '@hydroserver/client'
import { mdiMagnify, mdiPencil, mdiDelete } from '@mdi/js'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteJobCard from './DeleteJobCard.vue'

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
      await hs.jobs.listAllItems({
        workspace_id: [wsId],
        expand_related: true,
        order_by: ['name'],
      }),
    hs.jobs.delete,
    Job,
    toRef(props, 'workspaceId')
  )

const refreshTable = async () => {
  items.value = await hs.jobs.listAllItems({
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
    title: 'Template name',
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
