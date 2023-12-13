<template>
  <v-data-table :headers="headers" :items="sortedItems">
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item.raw, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item.raw, 'delete')"> mdi-delete </v-icon>
    </template>
  </v-data-table>

  <v-dialog v-model="openEdit" width="60rem">
    <ObservedPropertyFormCard
      :observedProperty="item"
      @close="openEdit = false"
      @updated="onUpdate"
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
import { computed } from 'vue'

// TODO: Only fetch the observedProperties the user is the primary owner of
const {
  item,
  ownedItems,
  openEdit,
  openDelete,
  openDialog,
  onUpdate,
  onDelete,
} = useTableLogic(
  api.fetchObservedProperties,
  api.deleteObservedProperty,
  ObservedProperty
)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Code', key: 'code' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const sortedItems = computed(() =>
  ownedItems.value.sort((a, b) => a.name.localeCompare(b.name))
)
</script>
