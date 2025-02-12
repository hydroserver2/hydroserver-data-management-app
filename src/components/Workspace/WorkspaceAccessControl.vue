<template>
  <v-card>
    <v-toolbar color="primary-darken-5">
      <v-card-title>Workspace access control</v-card-title>
    </v-toolbar>

    <v-row v-if="isOwner">
      <v-col cols="12" md="6">
        <v-row align="center" class="mt-6">
          <v-col cols="auto" class="pr-0">
            <v-card-title class="text-h6">
              Add a collaborator to this workspace
            </v-card-title>
          </v-col>
          <v-col class="pl-0">
            <v-icon
              @click="showAddCollaboratorHelp = !showAddCollaboratorHelp"
              color="grey"
              small
            >
              mdi-help-circle-outline
            </v-icon>
          </v-col>
        </v-row>

        <v-card-text v-if="showAddCollaboratorHelp">
          The new collaborator will be given the following permissions:
          <ul>
            <li class="v-list-item">
              Create, read, update, delete for all site metadata and datastreams
            </li>
            <li class="v-list-item">Make site private or public</li>
            <li class="v-list-item">Remove themselves as collaborator</li>
          </ul>
        </v-card-text>

        <v-card-text>
          <v-text-field
            v-model="newCollaboratorEmail"
            label="New collaborator's email"
          />
          <v-select
            v-model="selectedRole"
            :items="roles"
            label="New collaborator's role"
            item-title="name"
            :return-object="true"
            variant="outlined"
          />
          <v-btn-primary @click="onAddCollaborator">Submit</v-btn-primary>
        </v-card-text>

        <v-row class="mt-6">
          <v-col>
            <v-card-title class="text-h6"> Collaborators </v-card-title>
          </v-col>
        </v-row>

        <v-row v-for="collaborator in collaborators" class="my-1">
          <v-col cols="auto" class="py-0">
            {{ collaborator.user.name }} -
            {{
              collaborator.user.organizationName
                ? collaborator.user.organizationName
                : 'No Organization'
            }}
          </v-col>

          <v-col class="py-0" cols="auto">
            <strong v-if="isOwner">(Owner)</strong>
            <div v-else>
              <v-btn-delete
                v-if="!isOwner && collaborator.user.email == user.email"
                @click="onRemoveOwner(collaborator.user.email)"
                >Remove</v-btn-delete
              >
            </div>
          </v-col>
        </v-row>
      </v-col>

      <v-col cols="12" md="6">
        <v-row align="center" class="mt-6">
          <v-col cols="auto" class="pr-0">
            <v-card-title class="text-h6">
              Transfer workspace ownership
            </v-card-title>
          </v-col>
          <v-col class="pl-0">
            <v-icon
              @click="showTransferHelp = !showTransferHelp"
              color="grey"
              small
            >
              mdi-help-circle-outline
            </v-icon>
          </v-col>
        </v-row>

        <v-card-text v-if="showTransferHelp">
          This action will irreversibly de-elevate your permission level to
          collaborator and elevate the chosen user's permission level to owner
          once the chosen user has accepted the transfer request. Permissions
          unique to the owner are:
          <ul class="ml-5">
            <li>Rename a workspace</li>
            <li>Delete a workspace</li>
            <li>Make a workspace public or private</li>
          </ul>
        </v-card-text>

        <v-card-text>
          <v-text-field
            v-model="newOwnerEmail"
            label="New owner's email"
            required
          />
          <p v-if="showTransferConfirmation" style="color: red" class="pb-4">
            WARNING: This action cannot be undone. Once you the transfer has
            been completed by the chosen user, your permissions will be reduced
            to those of a collaborator.
          </p>
          <v-btn-primary
            v-if="showTransferConfirmation"
            @click="onTransferOwnership"
          >
            Confirm
          </v-btn-primary>
          <v-btn-primary v-else @click="showTransferConfirmation = true"
            >Submit</v-btn-primary
          >
        </v-card-text>

        <v-row align="center" class="mt-6">
          <v-col cols="auto" class="pr-0">
            <v-card-title class="text-h6"> Privacy </v-card-title>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-icon
              @click="showPrivacyHelp = !showPrivacyHelp"
              color="grey"
              small
            >
              mdi-help-circle-outline
            </v-icon>
          </v-col>
        </v-row>

        <v-card-text cols="12" md="6" v-if="showPrivacyHelp" class="py-0">
          Setting your workspace to private will make it and all related sites,
          datastreams, and workspace metadata visible to only you and other
          collaborators of your workspace. Setting your workspace to public will
          make it visible to all users and guests of the system. By default, all
          related sites and datastreams will also be public, but can be made
          private from on the Site Details page.
        </v-card-text>

        <v-card-text>
          <v-checkbox
            v-model="workspace.isPrivate"
            label="Make this workspace private"
            @click="togglePrivacy"
            hide-details
          />
        </v-card-text>
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
import { ref, computed, onMounted } from 'vue'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { Collaborator, Workspace } from '@/types'
import router from '@/router/router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

const emits = defineEmits(['close'])
const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})
console.log('workspace', props.workspace)
const { user } = storeToRefs(useUserStore())

const isOwner = computed(
  () => props.workspace?.owner?.email == user.value.email
)
const newOwnerEmail = ref('')
const showTransferConfirmation = ref(false)
const newCollaboratorEmail = ref('')
const openHydroSharePrivacy = ref(false)
const isUpdating = ref(false)
const collaborators = ref<Collaborator[]>([])
const roles = ref([])
const selectedRole = ref()

const showPrivacyHelp = ref(false)
const showAddCollaboratorHelp = ref(false)
const showTransferHelp = ref(false)

async function onTransferOwnership() {
  if (!newOwnerEmail.value) return
  try {
    await api.transferWorkspace(props.workspace!.id, newOwnerEmail.value)
    // TODO: This should only send a request for transfer to the new owner
    Snackbar.success('Workspace transfer requested.')
  } catch (error) {
    console.error('Error transferring workspace.', error)
  }
  newOwnerEmail.value = ''
  showTransferConfirmation.value = false
}

async function onAddCollaborator() {
  if (!newCollaboratorEmail.value || !selectedRole.value) {
    Snackbar.warn('Please fill out collaborator email and role.')
    return
  }
  try {
    console.log('selectedRole', selectedRole.value)
    const collaboratorResponse = await api.addCollaborator(
      props.workspace!.id,
      newCollaboratorEmail.value,
      selectedRole.value.id
    )
    console.log('collaboratorResponse', collaboratorResponse)
    collaborators.value = collaboratorResponse
    // TODO: update workspace collaborators
  } catch (error: any) {
    console.error('Error adding secondary owner', error)
    console.log(error)
    Snackbar.error(error.message)
    return
  }
  newCollaboratorEmail.value = ''
}

async function onRemoveOwner(email: string) {
  try {
    await api.removeCollaborator(props.workspace!.id, email)
    // TODO: update workspace
    Snackbar.success('Owner removed for site.')
    if (email === user.value.email) await router.push({ name: 'Sites' })
  } catch (error) {
    console.error('Error removing owner from thing', error)
  }
}

async function togglePrivacy(updateHydroShare?: boolean) {
  try {
    isUpdating.value = true
    await api.updateWorkspace(props.workspace)
  } catch (error) {
    console.error('Error updating thing privacy', error)
  } finally {
    isUpdating.value = false
  }
  openHydroSharePrivacy.value = false
}

const emitClose = () => emits('close')

onMounted(async () => {
  try {
    const [collaboratorsResponse, rolesResponse] = await Promise.all([
      api.getCollaborators(props.workspace.id),
      api.getCollaboratorRoles(props.workspace.id),
    ])

    collaborators.value = collaboratorsResponse
    roles.value = rolesResponse
  } catch (error) {
    console.error('Error fetching collaborators for workspace', error)
  }
})
</script>
