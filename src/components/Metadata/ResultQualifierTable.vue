<template>
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :search="search"
    :style="{ 'max-height': `200vh` }"
    fixed-header
  >
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
    </template></v-data-table-virtual
  >

  <v-dialog v-model="openEdit" width="60rem">
    <ResultQualifierFormCard
      :result-qualifier="item"
      @close="openEdit = false"
      @updated="onUpdate"
      :workspace-id="workspaceId"
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
import { toRef } from 'vue'

const props = defineProps<{
  search: string | undefined
  workspaceId: string
}>()

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (wsId: string) => await api.fetchWorkspaceResultQualifiers(wsId),
    api.deleteResultQualifier,
    ResultQualifier,
    toRef(props, 'workspaceId')
  )

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>
