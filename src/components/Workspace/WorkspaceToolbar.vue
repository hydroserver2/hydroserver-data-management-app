<template>
  <v-row class="my-4" align="center">
    <v-col cols="12" sm="3">
      <v-select
        v-model="selectedWorkspace"
        label="Selected Workspace"
        :items="sortedWorkspaces"
        :key="workspaceKey"
        item-title="name"
        :return-object="true"
        variant="outlined"
        hide-details
      ></v-select>
    </v-col>
    <v-col cols="12" sm="auto">
      <v-btn
        @click="openWorkspaceTable = !openWorkspaceTable"
        rounded="xl"
        color="secondary-darken-2"
        variant="outlined"
      >
        Manage workspaces
      </v-btn>
    </v-col>
  </v-row>

  <v-card v-if="openWorkspaceTable" class="mb-8">
    <v-toolbar flat color="secondary-darken-2">
      <v-text-field
        :disabled="!workspaces?.length"
        class="mx-2"
        clearable
        v-model="search"
        prepend-inner-icon="mdi-magnify"
        label="Search"
        hide-details
        density="compact"
        rounded="xl"
      />

      <v-spacer />

      <v-btn-add class="mr-2" @click="openCreate = true" color="white">
        Add workspace
      </v-btn-add>
    </v-toolbar>
    <v-data-table-virtual
      :headers="headers"
      :items="items"
      :sort-by="[{ key: 'name' }]"
      :search="search"
      multi-sort
      item-value="id"
      class="elevation-3 owned-sites-table"
      color="secondary-darken-2"
      :style="{ 'max-height': `200vh` }"
      fixed-header
      loading-text="Loading sites..."
    >
      <template v-slot:no-data>
        <div class="text-center pa-4" v-if="workspaces.length === 0">
          <v-icon size="48" color="grey lighten-1"
            >mdi-briefcase-outline</v-icon
          >
          <h4 class="mt-2">You have not registered any workspaces</h4>
          <p class="mb-4">Click the "Add workspace" button to create one.</p>
        </div>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="text"
          color="primary-darken-2"
          @click="openDialog(item, 'accessControl')"
          icon="mdi-lock-plus-outline"
          rounded="xl"
        />

        <v-btn
          variant="text"
          color="grey-darken-2"
          @click="openDialog(item, 'edit')"
          icon="mdi-pencil"
          rounded="xl"
        />

        <v-btn
          variant="text"
          color="red-darken-2"
          @click="openDialog(item, 'delete')"
          icon="mdi-delete"
          rounded="xl"
        />
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-dialog v-model="openCreate" width="30rem">
    <WorkspaceFormCard
      @close="openCreate = false"
      @created="refreshWorkspaces"
    />
  </v-dialog>

  <v-dialog v-model="openAccessControl" width="60rem">
    <WorkspaceAccessControl
      @close="openAccessControl = false"
      :workspace="item"
    />
  </v-dialog>

  <v-dialog v-model="openEdit" width="30rem">
    <WorkspaceFormCard
      @close="openEdit = false"
      :workspace="item"
      @updated="refreshWorkspaces"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="30rem">
    <DeleteWorkspaceCard
      @close="openDelete = false"
      @delete="onDeleteWorkspace"
      @switch-to-access-control="switchToAccessControlModal"
      :workspace="item"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkspaceFormCard from '@/components/Workspace/WorkspaceFormCard.vue'
import DeleteWorkspaceCard from './DeleteWorkspaceCard.vue'
import WorkspaceAccessControl from './WorkspaceAccessControl.vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import { Workspace } from '@/types'
import { api } from '@/services/api'
import { useTableLogic } from '@/composables/useTableLogic'

const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()
console.log('workspaces', workspaces.value)

const openCreate = ref(false)
const openWorkspaceTable = ref(false)
const workspaceKey = ref(0)
const search = ref()
const selectedWorkspaceId = ref('')

const {
  item,
  items,
  openEdit,
  openDelete,
  openAccessControl,
  openDialog,
  onDelete,
} = useTableLogic(api.fetchWorkspaces, api.deleteWorkspace, Workspace)

const sortedWorkspaces = computed(() =>
  workspaces.value.sort((a, b) => a.name.localeCompare(b.name))
)

watch(
  selectedWorkspaceId,
  (newId) => {
    console.log('selected workspace changed', newId)
    if (!newId || newId === selectedWorkspace.value?.id) return
    const newWorkspace = workspaces.value.find((ws) => ws.id === newId)
    if (!!newWorkspace) selectedWorkspace.value = newWorkspace
    console.log('new selected workspace', selectedWorkspace.value)
  },
  { immediate: true }
)

/** We need refreshWorkspaces because we're saving a global workspaces array that should
 * always be the source of truth. This function syncs the table items with the db and global workspaces.
 */
const refreshWorkspaces = async (workspace?: Workspace) => {
  console.log('refreshing workspace')
  try {
    items.value = await api.fetchWorkspaces()
    setWorkspaces(items.value)
    if (workspace) selectedWorkspace.value = workspace
    workspaceKey.value += 1
  } catch (error) {
    console.error('Error refreshing workspaces', error)
  }
}

const onDeleteWorkspace = async () => {
  await onDelete()
  refreshWorkspaces()
}

function switchToAccessControlModal() {
  openDelete.value = false
  openAccessControl.value = true
}

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Is private', key: 'private' },
  { title: 'Actions', key: 'actions', align: 'end' },
] as const
</script>
