<template>
  <v-container>
    <v-row class="my-2" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">Job orchestration</h5>
        <WorkspaceSelector />
      </v-col>
    </v-row>

    <template v-if="!!selectedWorkspace">
      <DataSourceTable :workspace-id="selectedWorkspace.id" />
      <v-divider class="mb-6" opacity="0" />
      <EtlSystemTable />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DataSourceTable from '@/components/DataSource/DataSourceTable.vue'
import EtlSystemTable from '@/components/DataSource/EtlSystemTable.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import WorkspaceSelector from '@/components/Workspace/WorkspaceSelector.vue'

const { selectedWorkspace } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()

onMounted(async () => {
  try {
    const workspacesResponse = await api.fetchAssociatedWorkspaces()
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  }
})
</script>
