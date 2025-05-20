<template>
  <v-row align="center">
    <v-col cols="auto" class="pr-0">
      <v-card-title class="text-h6"> Privacy </v-card-title>
    </v-col>
    <v-col cols="auto" class="pl-0">
      <v-icon @click="showPrivacyHelp = !showPrivacyHelp" color="grey" small>
        mdi-help-circle-outline
      </v-icon>
    </v-col>
  </v-row>

  <v-card-text cols="12" md="6" v-if="showPrivacyHelp" class="py-0">
    Setting your workspace to private will make it and all related sites,
    datastreams, and workspace metadata visible to only you and other
    collaborators of your workspace. Setting your workspace to public will make
    it visible to all users and guests of the system. By default, all related
    sites and datastreams will also be public, but can be made private from on
    the Site Details page.
  </v-card-text>

  <v-card-text>
    <v-checkbox
      v-model="isPrivate"
      label="Make this workspace private"
      @change="togglePrivacy"
      hide-details
    />
  </v-card-text>
</template>

<script setup lang="ts">
import { api } from '@/services/api'
import { Workspace } from '@/types'
import { Snackbar } from '@/utils/notifications'
import { ref } from 'vue'

const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})
const emits = defineEmits(['privacy-updated'])

const isPrivate = ref(props.workspace.isPrivate)
const openHydroSharePrivacy = ref(false)
const isUpdating = ref(false)
const showPrivacyHelp = ref(false)

async function togglePrivacy() {
  try {
    isUpdating.value = true
    await api.updateWorkspace({
      id: props.workspace.id,
      isPrivate: isPrivate.value,
    } as Workspace)
    emits('privacy-updated', isPrivate.value)
  } catch (error: any) {
    isPrivate.value = !isPrivate.value
    Snackbar.error(error.message)
    console.error('Error updating thing privacy', error)
  } finally {
    isUpdating.value = false
  }
  openHydroSharePrivacy.value = false
}
</script>
