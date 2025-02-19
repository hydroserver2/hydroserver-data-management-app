<template>
  <v-data-table-virtual
    :headers="headers"
    :items="sortedItems"
    :search="search"
    :style="{ 'max-height': `200vh` }"
    fixed-header
  >
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
    </template>
  </v-data-table-virtual>

  <v-dialog v-model="openEdit" width="60rem">
    <ObservedPropertyFormCard
      :observedProperty="item"
      @close="openEdit = false"
      @updated="onUpdate"
      :workspace-id="workspaceId"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteMetadataCard
      itemName="observedProperty"
      :itemID="item.id"
      parameter-name="observedPropertyId"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import ObservedPropertyFormCard from '@/components/Metadata/ObservedPropertyFormCard.vue'
import DeleteMetadataCard from '@/components/Metadata/DeleteMetadataCard.vue'
import { api } from '@/services/api'
import { ObservedProperty } from '@/types'
import { useTableLogic } from '@/composables/useTableLogic'
import { computed, toRef } from 'vue'

const props = defineProps<{
  search: string | undefined
  workspaceId: string
}>()

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (wsId: string) => await api.fetchWorkspaceObservedProperties(wsId),
    api.deleteObservedProperty,
    ObservedProperty,
    toRef(props, 'workspaceId')
  )

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Code', key: 'code' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const sortedItems = computed(() =>
  items.value.sort((a, b) => a.name.localeCompare(b.name))
)
</script>
