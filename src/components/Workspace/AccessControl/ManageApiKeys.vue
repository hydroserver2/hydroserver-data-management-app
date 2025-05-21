<template>
  <v-row align="center">
    <v-col cols="auto" class="pr-0">
      <v-card-item>
        <v-card-title> API keys </v-card-title>
      </v-card-item>
    </v-col>
    <v-col class="pl-0">
      <v-icon @click="showApiKeyHelp = !showApiKeyHelp" color="grey" small>
        mdi-help-circle-outline
      </v-icon>
    </v-col>

    <v-spacer />

    <v-btn
      variant="text"
      prepend-icon="mdi-plus"
      class="mr-4"
      @click="openCreate = true"
      >Add API key</v-btn
    >
  </v-row>

  <v-card-text v-if="showApiKeyHelp">
    API keys are intended to provide remote systems with a subset of permissions
    to this workspace.
  </v-card-text>

  <v-data-table-virtual
    :headers="headers"
    :items="items"
    :sort-by="sortBy"
    :search="search"
    :style="{ 'max-height': `100vh` }"
    no-data-text="No keys available"
    fixed-header
  >
    <template #item.id="{ item }">
      <div class="d-flex align-center">
        {{ item.id }}
        <v-icon size="x-small" class="ml-2" @click="copyKey(item.id)">
          <v-icon>mdi-content-copy</v-icon>
        </v-icon>
      </div>
    </template>

    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item, 'delete')"> mdi-delete </v-icon>
    </template>
  </v-data-table-virtual>

  <v-dialog v-model="openCreate" width="40rem">
    <ApiKeyForm
      @close="openCreate = false"
      @created="onCreate"
      :workspace-id="workspaceId"
      :roles="roles"
    />
  </v-dialog>

  <v-dialog v-model="openEdit" width="40rem">
    <ApiKeyForm
      @close="openEdit = false"
      @updated="onUpdate"
      :workspace-id="workspaceId"
      :roles="roles"
      :api-key="item"
    />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteApiKey
      :itemName="item.name"
      @delete="onDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { ApiKey, CollaboratorRole, Workspace } from '@/types'
import { Snackbar } from '@/utils/notifications'
import { onMounted, ref, toRef } from 'vue'
import ApiKeyForm from './ApiKeyForm.vue'
import { useTableLogic } from '@/composables/useTableLogic'
import DeleteApiKey from './DeleteApiKey.vue'

const props = defineProps({
  workspaceId: { type: String, required: true },
})

const openCreate = ref(false)
const showApiKeyHelp = ref(false)
const sortBy = [{ key: 'OPName' }]
const search = ref()
const roles = ref<CollaboratorRole[]>([])

const { item, items, openEdit, openDelete, openDialog, onUpdate, onDelete } =
  useTableLogic(
    async (wsId: string) => await api.fetchApiKeys(wsId),
    async (keyId: string) => {
      await api.deleteApiKey(props.workspaceId, keyId)
    },
    ApiKey,
    toRef(props, 'workspaceId')
  )

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Key', key: 'id' },
  { title: 'Role', key: 'role.name' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

const onCreate = (newKey: ApiKey) => {
  items.value.push(newKey)
}

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key)
    Snackbar.success('API key copied to clipboard')
  } catch {
    Snackbar.error('Failed to copy key')
  }
}

onMounted(async () => {
  try {
    const rolesResponse = await api.getCollaboratorRoles(props.workspaceId)
    roles.value = rolesResponse.filter(
      (r: CollaboratorRole) => r.isApikeyRole === true
    )
  } catch (error) {
    console.error('Error fetching collaborators for workspace', error)
  }
})
</script>
