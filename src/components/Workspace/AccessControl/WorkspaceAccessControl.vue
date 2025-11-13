<template>
  <v-card>
    <v-toolbar color="primary-darken-5">
      <v-card-title
        >Workspace access control
        <span class="opacity-80">- {{ workspace.name }}</span>
      </v-card-title>
    </v-toolbar>

    <v-row style="min-height: 500px">
      <v-col cols="4">
        <v-list :lines="false" nav>
          <v-list-item
            v-for="item in items"
            :prepend-icon="item.icon"
            :title="item.title"
            :active="selected === item.name"
            @click="selected = item.name"
          />
        </v-list>
      </v-col>

      <v-col cols="8" style="max-height: 500px; overflow-y: auto" class="my-3">
        <WorkspaceCollaborators
          v-if="selected === 'collaborators'"
          :workspace="workspace"
        />
        <TransferWorkspaceOwnership
          v-else-if="selected === 'transfer'"
          :workspace="workspace"
          @needs-refresh="emits('needs-refresh')"
        />
        <ManageWorkspacePrivacy
          v-else-if="selected === 'privacy'"
          :workspace="workspace"
          @privacy-updated="emits('privacy-updated', $event)"
        />
        <ManageApiKeys
          v-else-if="selected === 'api-keys'"
          :workspace-id="workspace.id"
        />
      </v-col>
    </v-row>

    <v-divider />

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emitClose">Close</v-btn-cancel>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Workspace } from '@hydroserver/client'
import WorkspaceCollaborators from './ManageCollaborators.vue'
import TransferWorkspaceOwnership from './TransferWorkspaceOwnership.vue'
import ManageWorkspacePrivacy from './ManageWorkspacePrivacy.vue'
import ManageApiKeys from './ManageApiKeys.vue'
import { ref } from 'vue'
import {
  mdiAccountCircle,
  mdiKeyVariant,
  mdiLock,
  mdiTransitTransfer,
} from '@mdi/js'

const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})

const emits = defineEmits(['close', 'privacy-updated', 'needs-refresh'])
const emitClose = () => emits('close')

const selected = ref('collaborators')

const items = [
  { title: 'Collaborators', name: 'collaborators', icon: mdiAccountCircle },
  { title: 'API keys', name: 'api-keys', icon: mdiKeyVariant },
  { title: 'Workspace privacy', name: 'privacy', icon: mdiLock },
  {
    title: 'Transfer ownership',
    name: 'transfer',
    icon: mdiTransitTransfer,
  },
]
</script>
