<template>
  <v-data-table
    v-if="user.organization"
    :items="organizationInfo"
    :items-per-page="-1"
    hide-default-header
    hide-default-footer
    density="compact"
    class="elevation-3 my-6 rounded-lg"
  >
    <template v-slot:top>
      <v-toolbar color="blue-grey" rounded="t-lg">
        <h5 class="text-h5 ml-4">Organization information</h5>
      </v-toolbar>
    </template>
    <template v-slot:item.icon="{ item }">
      <v-icon :icon="item.icon"></v-icon>
    </template>
    <template v-slot:item.label="{ item }">
      <strong>{{ item.label }}</strong>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { user } = storeToRefs(useUserStore())

const organizationInfo = computed(() => {
  if (!user.value.organization) return []

  return [
    {
      icon: 'mdi-office-building',
      label: 'Name',
      value: user.value.organization.name,
    },
    {
      icon: 'mdi-code-tags',
      label: 'Code',
      value: user.value.organization.code,
    },
    {
      icon: 'mdi-open-in-new',
      label: 'Link',
      value: user.value.organization.link,
    },
    {
      icon: 'mdi-factory',
      label: 'Type',
      value: user.value.organization.type,
    },
    {
      icon: 'mdi-file-document-outline',
      label: 'Description',
      value: user.value.organization.description,
    },
  ].filter(Boolean)
})
</script>
