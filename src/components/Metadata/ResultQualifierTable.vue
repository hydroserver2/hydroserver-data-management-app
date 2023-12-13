<template>
  <v-data-table :headers="headers" :items="ownedItems">
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item.raw, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item.raw, 'delete')"> mdi-delete </v-icon>
    </template></v-data-table
  >

  <v-dialog v-model="openEdit" width="60rem">
    <ResultQualifierFormCard
      :result-qualifier="item"
      @close="openEdit = false"
      @updated="onUpdate"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteMetadataCard
      itemName="result qualifier"
      :itemID="item.id"
      parameter-name="resultQualifierId"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { ResultQualifier } from '@/types'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteMetadataCard from '@/components/Metadata/DeleteMetadataCard.vue'
import ResultQualifierFormCard from '@/components/Metadata/ResultQualifierFormCard.vue'

const {
  item,
  ownedItems,
  openEdit,
  openDelete,
  openDialog,
  onUpdate,
  onDelete,
} = useTableLogic(
  api.fetchResultQualifiers,
  api.deleteResultQualifier,
  ResultQualifier
)

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>
