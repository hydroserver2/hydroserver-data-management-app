<template>
  <v-row class="mt-0 mb-2" align="center">
    <v-col cols="auto">
      <WorkspaceSelector />
    </v-col>
    <v-col cols="12" sm="auto">
      <v-btn
        @click="openWorkspaceTable = !openWorkspaceTable"
        rounded="xl"
        color="secondary-darken-3"
        variant="outlined"
        density="comfortable"
        :append-icon="openWorkspaceTable ? 'mdi-menu-up' : 'mdi-menu-down'"
      >
        Manage workspaces
      </v-btn>
    </v-col>
    <v-col cols="12" sm="auto" v-if="pendingWorkspaces.length">
      <v-btn
        @click="openTransferTable = !openTransferTable"
        rounded="xl"
        color="blue-darken-4"
      >
        Pending workspace transfer
      </v-btn>
    </v-col>
  </v-row>

  <v-card v-if="openTransferTable" class="mb-8">
    <v-toolbar flat color="blue-darken-4">
      <v-card-title>Pending transfers</v-card-title>
    </v-toolbar>
    <v-data-table-virtual
      :headers="transferHeaders"
      :items="pendingWorkspaces"
      :sort-by="[{ key: 'name' }]"
      item-value="id"
      class="elevation-3 owned-sites-table"
      color="secondary-darken-2"
      :style="{ 'max-height': `200vh` }"
      fixed-header
      loading-text="Loading sites..."
    >
      <template v-slot:item.actions="{ item }">
        <v-btn
          variant="outlined"
          color="grey-darken-2"
          @click="onCancelTransfer(item)"
          prepend-icon="mdi-close"
          rounded="xl"
        >
          Cancel transfer</v-btn
        >

        <v-btn
          color="green-darken-2"
          @click="onAcceptTransfer(item)"
          prepend-icon="mdi-check"
          rounded="xl"
          class="ml-2"
        >
          Accept transfer</v-btn
        >
      </template>
    </v-data-table-virtual>
  </v-card>

  <v-expand-transition>
    <v-card v-if="openWorkspaceTable" class="mb-8">
      <v-toolbar flat color="secondary-darken-2">
        <v-text-field
          :disabled="!workspaces?.length"
          class="mx-4"
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

        <v-spacer />

        <v-btn-add class="mr-2" @click="openCreate = true" color="white">
          Add workspace
        </v-btn-add>
      </v-toolbar>
      <v-data-table-virtual
        :headers="headers"
        :items="workspaces"
        :sort-by="[{ key: 'name' }]"
        :search="search"
        multi-sort
        item-value="id"
        class="elevation-3 owned-sites-table"
        color="secondary-darken-2"
        :style="{ 'max-height': `400px` }"
        fixed-header
        loading-text="Loading sites..."
      >
        <template v-slot:no-data>
          <div class="text-center pa-4" v-if="workspaces.length === 0">
            <v-icon size="48" color="grey lighten-1"
              >mdi-briefcase-outline</v-icon
            >
            <h4 class="mt-2">No workspaces found</h4>
            <p class="mb-4">Click the "Add workspace" button to create one.</p>
            <v-icon
              class="mb-4"
              @click="showWorkspaceHelp = !showWorkspaceHelp"
              color="grey"
              small
            >
              mdi-help-circle-outline
            </v-icon>
            <p v-if="showWorkspaceHelp" class="mb-4">
              A workspace is an organizational concept for access control. All
              resources in HydroServer (Sites, Datastreams, Units, ETL Systems)
              belong to a workspace. After creating one, you can assign roles
              (e.g. Editor, Viewer) to users who need different permission
              levels.
            </p>
          </div>
        </template>
        <template #item.isPrivate="{ item }">
          {{ item.isPrivate ? 'Private' : 'Public' }}
        </template>
        <template #item.collaboratorRole="{ item }">
          {{ getUserRoleName(item) }}
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
            :disabled="
              !hasPermission(
                PermissionResource.Workspace,
                PermissionAction.Edit,
                item
              )
            "
            variant="text"
            color="grey-darken-2"
            @click="openDialog(item, 'edit')"
            icon="mdi-pencil"
            rounded="xl"
          />

          <v-btn
            :disabled="
              !hasPermission(
                PermissionResource.Workspace,
                PermissionAction.Delete,
                item
              )
            "
            variant="text"
            color="red-darken-2"
            @click="openDialog(item, 'delete')"
            icon="mdi-delete"
            rounded="xl"
          />
        </template>
      </v-data-table-virtual>
    </v-card>
  </v-expand-transition>

  <v-dialog v-model="openCreate" width="30rem">
    <WorkspaceFormCard
      @close="openCreate = false"
      @created="refreshWorkspaces"
    />
  </v-dialog>

  <v-dialog v-model="openAccessControl" width="70rem">
    <WorkspaceAccessControl
      :workspace="activeItem"
      @close="openAccessControl = false"
      @privacy-updated="activeItem.isPrivate = $event"
      @needs-refresh="refreshAccessControl(activeItem.id)"
    />
  </v-dialog>

  <v-dialog v-model="openEdit" width="30rem">
    <WorkspaceFormCard
      @close="openEdit = false"
      :workspace="activeItem"
      @updated="refreshWorkspaces"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="30rem">
    <DeleteWorkspaceCard
      @close="openDelete = false"
      @delete="onDelete"
      @switch-to-access-control="switchToAccessControlModal"
      :workspace="activeItem"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import WorkspaceFormCard from '@/components/Workspace/WorkspaceFormCard.vue'
import DeleteWorkspaceCard from './DeleteWorkspaceCard.vue'
import WorkspaceAccessControl from '@/components/Workspace/AccessControl/WorkspaceAccessControl.vue'
import { storeToRefs } from 'pinia'
import { useWorkspaceStore } from '@/store/workspaces'
import hs, {
  PermissionResource,
  PermissionAction,
  Workspace,
} from '@hydroserver/client'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { useUserStore } from '@/store/user'
import { Snackbar } from '@/utils/notifications'
import WorkspaceSelector from './WorkspaceSelector.vue'

const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
const { setWorkspaces } = useWorkspaceStore()
const { hasPermission, getUserRoleName } = useWorkspacePermissions()
const { user } = storeToRefs(useUserStore())

const openWorkspaceTable = ref(!workspaces.value.length)
const openTransferTable = ref(false)
const openCreate = ref(false)
const openEdit = ref(false)
const openDelete = ref(false)
const openAccessControl = ref(false)
const search = ref<string>('')
const activeItem = ref<Workspace>({} as Workspace)
const showWorkspaceHelp = ref(false)

const selectedWorkspaceId = ref('')
watch(
  selectedWorkspaceId,
  (newId) => {
    if (!newId || newId === selectedWorkspace.value?.id) return
    const newWorkspace = workspaces.value.find((ws) => ws.id === newId)
    if (!!newWorkspace) selectedWorkspace.value = newWorkspace
  },
  { immediate: true }
)

/** Workspaces that are pending a transfer to the current user */
const pendingWorkspaces = computed(() =>
  workspaces.value.filter(
    (ws) =>
      ws.pendingTransferTo?.email &&
      ws.pendingTransferTo?.email === user.value.email
  )
)

function openDialog(
  item: Workspace,
  dialog: 'edit' | 'delete' | 'accessControl'
) {
  activeItem.value = item
  if (dialog === 'edit') openEdit.value = true
  if (dialog === 'delete') openDelete.value = true
  if (dialog === 'accessControl') openAccessControl.value = true
}

/** We need refreshWorkspaces because we're saving a global workspaces array that should
 * always be the source of truth. This function syncs the table items with the db and global workspaces.
 */
const refreshWorkspaces = async (workspace?: Workspace) => {
  const res = await hs.workspaces.listItems({
    is_associated: true,
    fetch_all: true,
  })
  setWorkspaces(res)

  if (
    workspace &&
    (!selectedWorkspace.value || selectedWorkspace.value.id === workspace.id)
  )
    selectedWorkspace.value = workspace
}

const refreshAccessControl = async (workspaceId: string) => {
  try {
    activeItem.value = (await hs.workspaces.getItem(workspaceId)) as Workspace
  } catch (error) {
    console.error('Error refreshing workspaces', error)
  }
}

async function onCancelTransfer(ws: Workspace) {
  try {
    await hs.workspaces.rejectWorkspaceTransfer(ws.id)
    await refreshWorkspaces()
    Snackbar.success('Workspace transfer cancelled.')
    if (!pendingWorkspaces.value.length) openTransferTable.value = false
  } catch (error) {
    console.error('Error cancelling workspace transfer.', error)
  }
}

async function onAcceptTransfer(ws: Workspace) {
  try {
    await hs.workspaces.acceptOwnershipTransfer(ws.id)
    await refreshWorkspaces()
    Snackbar.success('Workspace transfer accepted.')
    if (!pendingWorkspaces.value.length) openTransferTable.value = false
  } catch (error) {
    console.error('Error accepting workspace transfer.', error)
  }
}

async function onDelete() {
  if (!activeItem.value) return
  const res = await hs.workspaces.delete(activeItem.value.id)
  if (res.ok) {
    Snackbar.success('Workspace deleted')
    refreshWorkspaces()
  } else Snackbar.error(res.message)
}

function switchToAccessControlModal() {
  openDelete.value = false
  openAccessControl.value = true
}

const headers = [
  { title: 'Workspace name', key: 'name' },
  { title: 'Visibility', key: 'isPrivate' },
  { title: 'Your role', key: 'collaboratorRole' },
  { title: 'Id', key: 'id' },
  { title: 'Actions', key: 'actions', align: 'end' },
] as const

const transferHeaders = [
  { title: 'Workspace name', key: 'name' },
  { title: 'Actions', key: 'actions', align: 'end' },
] as const
</script>
