<template>
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :search="search"
    hover
    class="elevation-3"
  >
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
    </template>
  </v-data-table-virtual>

  <v-dialog v-model="openDelete" max-width="500">
    <DeleteEtlSystemCard
      :item-name="item.name"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { EtlSystem } from '@/types'
import { api } from '@/services/api'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteEtlSystemCard from '@/components/EtlSystem/DeleteEtlSystemCard.vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { toRef } from 'vue'

defineProps({ search: String })
const { selectedWorkspace } = storeToRefs(useWorkspaceStore())

// TODO: This needs a new endpoint
const { item, items, openDelete, openDialog, onDelete } = useTableLogic(
  api.fetchEtlSystems,
  api.deleteEtlSystem,
  EtlSystem,
  toRef(selectedWorkspace.value?.id || '')
)

const headers = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Actions',
    align: 'end',
    key: 'actions',
  },
] as const
</script>
