<template>
  <v-select
    v-model="selectedWorkspace"
    hint="Selected Workspace"
    :items="workspaces"
    item-title="name"
    :return-object="true"
    variant="plain"
    hide-details
  >
    <template v-slot:item="{ props, item }">
      <v-list-item
        v-bind="props"
        :title="item.raw.name"
        :subtitle="`Your role: ${getUserRoleName(item.raw)}`"
      />
    </template>
  </v-select>
</template>

<script setup lang="ts">
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { useWorkspaceStore } from '@/store/workspaces'
import { storeToRefs } from 'pinia'

const { selectedWorkspace, workspaces } = storeToRefs(useWorkspaceStore())
const { getUserRoleName } = useWorkspacePermissions()
</script>
