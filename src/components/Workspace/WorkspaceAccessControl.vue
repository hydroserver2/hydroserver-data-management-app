<template>
  <v-card>
    <v-toolbar color="primary-darken-5">
      <v-card-title
        >Workspace access control
        <span class="opacity-80">- {{ workspace.name }}</span>
      </v-card-title>
    </v-toolbar>

    <v-row>
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
          You can add collaborators to this workspace with either Editor or
          Viewer roles. Viewers can see everything in the workspace but cannot
          edit. Editors can create, read, update, and delete all sites,
          metadata, and datastreams as well as set their visibility. Users can
          remove themselves as collaborators.
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
            <v-card-title class="text-h6 pb-0"> Collaborators </v-card-title>
          </v-col>
        </v-row>

        <v-card-text>
          <div class="collaborator-list-container">
            <v-list
              lines="three"
              v-model:selected="selection"
              select-strategy="leaf"
            >
              <v-list-group v-for="item in collaboratorList" :key="item.value">
                <template v-slot:activator="{ props }">
                  <v-list-item
                    v-bind="props"
                    :title="item.name"
                    :value="item.value"
                    active-class="text-red"
                  >
                    <v-list-item-subtitle
                      v-if="item.isBeingEdited"
                      class="mb-1 text-high-emphasis opacity-100"
                    >
                      <v-select
                        v-model="item.pendingRole"
                        :items="roles"
                        item-title="name"
                        @click.stop
                        @mousedown.stop
                        :return-object="true"
                        variant="outlined"
                        hide-details
                      />
                      <div class="d-flex my-2">
                        <v-btn-cancel class="mr-2" @click="onCancelEdit(item)"
                          >Cancel</v-btn-cancel
                        >
                        <v-btn @click="onSaveRole(item)">Save</v-btn>
                      </div>
                    </v-list-item-subtitle>
                    <v-list-item-subtitle
                      v-else
                      class="mb-1 text-high-emphasis opacity-100"
                    >
                      {{ item.role.name }}
                    </v-list-item-subtitle>

                    <v-list-item-subtitle
                      class="mb-2 text-high-emphasis opacity-60"
                    >
                      {{ item.organization }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </template>

                <v-list-item>
                  <template v-slot:append>
                    <v-btn
                      variant="outlined"
                      class="mr-2"
                      :disabled="item.isOwner || item.isBeingEdited"
                      @click="item.isBeingEdited = true"
                      >Edit role</v-btn
                    >
                    <v-btn-delete
                      variant="outlined"
                      :disabled="item.isOwner || item.isBeingEdited"
                      @click="onRemoveCollaborator(item.email)"
                      >Remove collaborator</v-btn-delete
                    >
                  </template>
                </v-list-item>
              </v-list-group>
            </v-list>
          </div>
        </v-card-text>
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

        <template v-if="showPendingTransferText">
          <v-card-text style="color: #2196f3">
            <p>
              An ownership transfer is pending to
              {{ workspace.pendingTransferTo?.name }}
            </p>
            <v-btn-cancel class="mt-4" @click="onCancelTransfer">
              Cancel transfer
            </v-btn-cancel>
          </v-card-text>
        </template>
        <template v-else>
          <v-card-text>
            <v-text-field
              v-model="newOwnerEmail"
              label="New owner's email"
              required
            />
            <p v-if="showTransferConfirmation" style="color: red" class="pb-4">
              WARNING: Once the transfer has been accepted by the chosen user,
              your permissions will be reduced to those of a collaborator.
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
        </template>

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
            v-model="isPrivate"
            label="Make this workspace private"
            @change="togglePrivacy"
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
import { ref, onMounted, computed } from 'vue'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { Collaborator, CollaboratorRole, Workspace } from '@/types'
import router from '@/router/router'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'

const permissionsStore = useWorkspacePermissions()

const emits = defineEmits(['close', 'privacy-updated', 'needs-refresh'])
const props = defineProps({
  workspace: { type: Object as () => Workspace, required: true },
})
const isPrivate = ref(props.workspace.isPrivate)
const { user } = storeToRefs(useUserStore())

const showPendingTransferText = computed(
  () =>
    props.workspace.pendingTransferTo?.email &&
    permissionsStore.isOwner(props.workspace)
)

const selection = ref([])
const newOwnerEmail = ref('')
const showTransferConfirmation = ref(false)
const newCollaboratorEmail = ref('')
const openHydroSharePrivacy = ref(false)
const isUpdating = ref(false)
const roles = ref<CollaboratorRole[]>([])
const selectedRole = ref()

const showPrivacyHelp = ref(false)
const showAddCollaboratorHelp = ref(false)
const showTransferHelp = ref(false)

const collaboratorList = ref<any[]>([])

async function onCancelEdit(item: any) {
  item.pendingRole = item.role
  item.isBeingEdited = false
}

/**
 * Save the new role, then reset editing state
 */
async function onSaveRole(item: any) {
  try {
    const roleResponse = await api.updateCollaboratorRole(
      props.workspace.id,
      item.email,
      item.pendingRole.id
    )
    item.role = roleResponse.role
    item.isBeingEdited = false
    Snackbar.success('Collaborator role updated.')
  } catch (error: any) {
    console.error('Error updating collaborator role:', error)
    Snackbar.error(error.message)
  }
}

async function onTransferOwnership() {
  if (!newOwnerEmail.value) return
  try {
    await api.transferWorkspace(props.workspace!.id, newOwnerEmail.value)
    emits('needs-refresh')
    Snackbar.success('Workspace transfer initiated.')
  } catch (error) {
    console.error('Error transferring workspace.', error)
  }
  newOwnerEmail.value = ''
  showTransferConfirmation.value = false
}

async function onCancelTransfer() {
  try {
    await api.rejectWorkspaceTransfer(props.workspace!.id)
    emits('needs-refresh')
    Snackbar.success('Workspace transfer cancelled.')
  } catch (error) {
    console.error('Error cancelling workspace transfer.', error)
  }
}

async function onAddCollaborator() {
  if (!newCollaboratorEmail.value || !selectedRole.value) {
    Snackbar.warn('Please fill out collaborator email and role.')
    return
  }
  try {
    const collaboratorResponse = await api.addCollaborator(
      props.workspace!.id,
      newCollaboratorEmail.value,
      selectedRole.value.id
    )
    collaboratorList.value.push(collaboratorToFormData(collaboratorResponse))
    collaboratorList.value.sort((a, b) => a.name.localeCompare(b.name))
    Snackbar.success('Collaborator added to workspace.')
  } catch (error: any) {
    console.error('Error adding secondary owner', error)
    Snackbar.error(error.message)
    return
  }
  newCollaboratorEmail.value = ''
  selectedRole.value = ''
}

async function onRemoveCollaborator(email: string) {
  try {
    await api.removeCollaborator(props.workspace!.id, email)
    const index = collaboratorList.value.findIndex((c) => c.email === email)
    if (index !== -1) collaboratorList.value.splice(index, 1)
    Snackbar.success('Owner removed for site.')
    if (email === user.value.email) await router.push({ name: 'Sites' })
  } catch (error: any) {
    console.error('Error removing owner from thing', error)
    Snackbar.error(error.message)
  }
}

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

const emitClose = () => emits('close')
const collaboratorToFormData = (c: Collaborator) => ({
  email: c.user.email,
  value: c.user.email,
  name: c.user.name,
  role: c.role,
  pendingRole: c.role,
  organization: c.user.organizationName || 'No Organization',
  isOwner: false,
  isBeingEdited: false,
})

const setCollaboratorList = (collaborators: Collaborator[]) => {
  collaboratorList.value = collaborators.map((c) => collaboratorToFormData(c))

  if (props.workspace?.owner) {
    collaboratorList.value.unshift({
      email: props.workspace.owner.email,
      value: props.workspace.owner.email,
      name: props.workspace.owner.name,
      role: { name: 'Owner' },
      organization: props.workspace.owner.organizationName || 'No Organization',
      isOwner: true,
      isBeingEdited: false,
    })
  }
  collaboratorList.value.sort((a, b) => a.name.localeCompare(b.name))
}

onMounted(async () => {
  try {
    const [collaboratorsResponse, rolesResponse] = await Promise.all([
      api.getCollaborators(props.workspace.id),
      api.getCollaboratorRoles(props.workspace.id),
    ])

    roles.value = rolesResponse
    setCollaboratorList(collaboratorsResponse)
  } catch (error) {
    console.error('Error fetching collaborators for workspace', error)
  }
})
</script>

<style scoped>
.collaborator-list-container {
  max-height: 360px; /* max-height to about 4 collaborator items */
  overflow-y: auto;
}
</style>
