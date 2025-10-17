<template>
  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :search="search"
    :style="{ 'max-height': `400px` }"
    fixed-header
  >
    <template v-slot:item.actions="{ item }" v-if="canEdit">
      <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
    </template></v-data-table-virtual
  >

  <v-dialog v-model="openEdit" width="60rem">
    <ResultQualifierFormCard
      :result-qualifier="item"
      @close="openEdit = false"
      @updated="onUpdate"
      v-bind="{
        ...(workspaceId ? { 'workspace-id': workspaceId } : {}),
      }"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteMetadataCard
      itemName="result qualifier"
      :itemID="item.id"
      parameter-name="result_qualifier_id"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import hs from '@hydroserver/client'
import { ResultQualifier } from '@/types'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteMetadataCard from '@/components/Metadata/DeleteMetadataCard.vue'
import ResultQualifierFormCard from '@/components/Metadata/ResultQualifierFormCard.vue'
import { toRef } from 'vue'
import { useSystemTableLogic } from '@/composables/useSystemTableLogic'

const props = defineProps<{
  search: string | undefined
  workspaceId?: string
  canEdit: Boolean
}>()

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  props.workspaceId
    ? useTableLogic(
        async (wsId: string) =>
          await hs.resultQualifiers.listAllItems({ workspace_id: [wsId] }),
        hs.resultQualifiers.delete,
        ResultQualifier,
        toRef(props, 'workspaceId')
      )
    : useSystemTableLogic(
        () => hs.resultQualifiers.listAllItems(),
        (id: string) => hs.resultQualifiers.delete(id),
        ResultQualifier
      )

const headers = [
  { title: 'Code', key: 'code' },
  { title: 'Description', key: 'description' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const
</script>
