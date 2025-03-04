<template>
  <v-container>
    <v-row class="mb-4 mt-2" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">Manage data sources</h5>
      </v-col>
      <v-col cols="12" sm="3">
        <v-select
          v-model="selectedWorkspace"
          label="Selected Workspace"
          :items="workspaces"
          item-title="name"
          :return-object="true"
          variant="outlined"
          hide-details
        ></v-select>
      </v-col>
    </v-row>
    <v-card v-if="selectedWorkspace">
      <v-toolbar :flat="true" color="blue-grey" class="elevation-1">
        <v-text-field
          class="mx-4"
          clearable
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          hide-details
          density="compact"
          rounded="xl"
          maxWidth="300"
        />
        <v-spacer />

        <v-btn-add color="white" @click="openCreate = true">
          Add Data Source
        </v-btn-add>
      </v-toolbar>

      <DataSourceTable
        :search="search"
        :key="key"
        :workspace-id="selectedWorkspace.id"
      />
    </v-card>
  </v-container>

  <v-dialog v-model="openCreate">
    <DataSourceForm @close="openCreate = false" @created="refreshTable" />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DataSourceForm from '@/components/DataSource/Form/DataSourceForm.vue'
import DataSourceTable from '@/components/DataSource/DataSourceTable.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'

const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()

const search = ref()
const openCreate = ref(false)
const key = ref(0)
const refreshTable = () => (key.value += 1)

onMounted(async () => {
  try {
    const workspacesResponse = await api.fetchAssociatedWorkspaces()
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  }
})
</script>
