<template>
  <v-container>
    <v-row class="mb-4 mt-2" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">Manage ETL systems</h5>
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
    <v-card>
      <v-toolbar flat color="indigo">
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

        <v-btn-add
          prepend-icon="mdi-download"
          color="white"
          :to="{ name: 'HydroLoader' }"
        >
          Download Streaming Data Loader
        </v-btn-add>
      </v-toolbar>

      <EtlSystemTable :search="search" />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import EtlSystemTable from '@/components/EtlSystem/EtlSystemTable.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'

const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()
const search = ref()

onMounted(async () => {
  try {
    const workspacesResponse = await api.fetchAssociatedWorkspaces()
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  }
})
</script>
