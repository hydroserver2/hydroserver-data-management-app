<template>
  <v-container>
    <v-row class="my-2">
      <v-col cols="12">
        <h5 class="text-h5">Job orchestration</h5>
        <WorkspaceToolbar />
      </v-col>
    </v-row>

    <template v-if="!!selectedWorkspace">
      <DataSourceTable :workspace-id="selectedWorkspace.id" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import DataSourceTable from '@/components/DataSource/DataSourceTable.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'

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
