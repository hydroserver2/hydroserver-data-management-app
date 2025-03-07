<template>
  <v-card>
    <v-toolbar title="ETL systems" flat color="blue-grey-darken-2">
      <v-spacer />

      <v-text-field
        class="mx-2"
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        density="compact"
        variant="underlined"
        rounded="xl"
        maxWidth="300"
      />

      <v-btn
        class="mx-2"
        append-icon="mdi-chevron-right"
        color="white"
        :to="{ name: 'HydroLoader' }"
      >
        Download Streaming Data Loader
      </v-btn>
    </v-toolbar>

    <v-data-table-virtual
      :headers="headers"
      :items="items"
      :search="search"
      hover
      class="elevation-3"
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="text"
          icon="mdi-delete"
          color="red-darken-2"
          @click="openDialog(item, 'delete')"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openDelete" max-width="500">
    <DeleteEtlSystemCard
      :item-name="item.name"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import { EtlSystem } from '@/types'
import { api } from '@/services/api'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteEtlSystemCard from '../EtlSystem/DeleteEtlSystemCard.vue'
import etlSystemFixtures from '@/utils/test/fixtures/etlSystemFixtures'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const search = ref()

const { item, items, openDelete, openDialog, onDelete } = useTableLogic(
  async (wsId: string) => etlSystemFixtures as EtlSystem[],
  api.deleteEtlSystem,
  EtlSystem,
  toRef(selectedWorkspace.value?.id || '')
)

const headers = [
  {
    title: 'Name',
    key: 'name',
  },
  { title: 'Type', key: 'type' },
  {
    title: 'Actions',
    align: 'end',
    key: 'actions',
  },
] as const
</script>
