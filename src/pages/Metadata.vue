<template>
  <v-container v-if="isPageLoaded">
    <v-row class="mt-2" align="center">
      <v-col cols="auto" class="pb-0">
        <h5 class="text-h5">Manage metadata</h5>
      </v-col>
    </v-row>
    <WorkspaceToolbar />

    <v-text-field
      class="my-2"
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

    <div class="pb-6">
      <MetadataTable
        :toolbar-color="'brown'"
        :search="search"
        useWorkspaceVariables
      />
    </div>
    <MetadataTable :toolbar-color="'deep-orange-darken-4'" :search="search" />
  </v-container>
  <FullScreenLoader v-else />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import WorkspaceToolbar from '@/components/Workspace/WorkspaceToolbar.vue'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'
import { useWorkspaceStore } from '@/store/workspaces'
import { api } from '@/services/api'
import MetadataTable from '@/components/Metadata/MetadataTable.vue'

const { setWorkspaces } = useWorkspaceStore()
const isPageLoaded = ref(false)

const search = ref()

onMounted(async () => {
  try {
    const workspacesResponse = await api.fetchAssociatedWorkspaces()
    setWorkspaces(workspacesResponse)
  } catch (error) {
    console.error('Error fetching workspaces', error)
  } finally {
    isPageLoaded.value = true
  }
})
</script>
