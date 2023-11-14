<template>
  <v-card>
    <v-card-title class="text-h5">Access Control</v-card-title>
    <v-card-text>
      <v-row v-if="isPrimaryOwner">
        <v-col cols="12" md="6">
          <h6 class="text-h6 my-4">
            Add a secondary owner to this site
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-icon
                  small
                  class="ml-2"
                  color="grey lighten-1"
                  v-bind="props"
                >
                  mdi-help-circle-outline
                </v-icon>
              </template>
              <template v-slot:default>
                <p>
                  The new secondary owner will be given the following
                  permissions:
                </p>
                <ul>
                  <li class="v-list-item">
                    Create, read, update, delete for all site metadata and
                    datastreams
                  </li>
                  <li class="v-list-item">Make site private or public</li>
                  <li class="v-list-item">Remove themselves as owner</li>
                </ul>
              </template>
            </v-tooltip>
          </h6>

          <v-text-field
            v-model="newOwnerEmail"
            label="Secondary Owner's Email"
            required
          ></v-text-field>
          <v-btn-primary @click="onAddSecondaryOwner">Submit</v-btn-primary>
        </v-col>
        <v-col cols="12" md="6">
          <h6 class="text-h6 my-4">
            Transfer Primary Ownership
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-icon
                  small
                  class="ml-2"
                  color="grey lighten-1"
                  v-bind="props"
                >
                  mdi-help-circle-outline
                </v-icon>
              </template>
              <template v-slot:default>
                <p style="max-width: 35rem">
                  WARNING: This action will irreversibly de-elevate your
                  permission level to secondary owner and elevate the chosen
                  user's permission level to primary owner. Permissions unique
                  to the primary owner are:
                </p>
                <ul>
                  <li class="v-list-item">Add secondary owners</li>
                  <li class="v-list-item">Remove secondary owners</li>
                  <li class="v-list-item">Transfer primary ownership</li>
                  <li class="v-list-item">
                    Edit contents of datastream units, observed properties,
                    processing levels, and sensors
                  </li>
                </ul>
              </template>
            </v-tooltip>
          </h6>
          <v-text-field
            v-model="newPrimaryOwnerEmail"
            label="New Primary Owner's Email"
            required
          ></v-text-field>
          <v-card-text v-if="showPrimaryOwnerConfirmation" style="color: red"
            >WARNING: This action cannot be undone. Once you transfer primary
            ownership, your permissions will be reduced to those of a secondary
            owner.</v-card-text
          >
          <v-btn-primary
            v-if="showPrimaryOwnerConfirmation"
            @click="onTransferPrimaryOwnership"
            >Confirm</v-btn-primary
          >
          <v-btn-primary v-else @click="showPrimaryOwnerConfirmation = true"
            >Submit</v-btn-primary
          >
        </v-col>
      </v-row>

      <h6 class="text-h6 my-4">Current Owners</h6>

      <v-row v-for="owner in thing.owners" class="my-1">
        <v-col cols="auto" class="py-0">
          {{ owner.firstName }} {{ owner.lastName }} -
          {{
            owner.organizationName ? owner.organizationName : 'No Organization'
          }}
        </v-col>

        <v-col class="py-0" cols="auto">
          <strong v-if="owner.isPrimaryOwner">(Primary)</strong>
          <div v-else>
            <v-btn-delete
              v-if="isPrimaryOwner || owner.email == user.email"
              @click="onRemoveOwner(owner.email)"
              >Remove</v-btn-delete
            >
          </div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="auto" class="pb-0">
          <h6 class="text-h6 mt-4" v-if="thing">
            Toggle Site Privacy
            <v-tooltip>
              <template v-slot:activator="{ props }">
                <v-icon
                  small
                  class="ml-2"
                  color="grey lighten-1"
                  v-bind="props"
                >
                  mdi-help-circle-outline
                </v-icon>
              </template>
              <template v-slot:default>
                <p v-if="thing.isPrivate" style="max-width: 25rem">
                  Setting your site to public will make it visible to all users
                  and guests of the system. They will be able to follow your
                  site and download its data
                </p>
                <p v-else style="max-width: 25rem">
                  setting your site to private will make it visible to only you
                  and other owners of your site. Anyone who is currently
                  following your site who is not an owner will be removed as a
                  follower
                </p>
              </template>
            </v-tooltip>
          </h6>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="auto" class="py-0">
          <v-switch
            v-model="thing.isPrivate"
            :label="thing.isPrivate ? 'Site is private' : 'Site is public'"
            color="primary"
            hide-details
            @change="toggleSitePrivacy"
          ></v-switch>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emitClose">Close</v-btn-cancel>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useThingOwnership } from '@/composables/useThingOwnership'
import { useThingStore } from '@/store/things'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const { user } = storeToRefs(useUserStore())
const emits = defineEmits(['close'])
const props = defineProps<{
  thingId: string
}>()

const { isPrimaryOwner } = useThingOwnership(props.thingId)

const {
  addSecondaryOwner,
  transferPrimaryOwnership,
  removeOwner,
  updateThingPrivacy,
} = useThingStore()
const { things } = storeToRefs(useThingStore())

const thing = computed(() => things.value[props.thingId])

const newPrimaryOwnerEmail = ref('')
const showPrimaryOwnerConfirmation = ref(false)
const newOwnerEmail = ref('')

async function onTransferPrimaryOwnership() {
  if (newPrimaryOwnerEmail.value) {
    await transferPrimaryOwnership(props.thingId, newPrimaryOwnerEmail.value)
    newPrimaryOwnerEmail.value = ''
    showPrimaryOwnerConfirmation.value = false
  }
}

async function onAddSecondaryOwner() {
  if (newOwnerEmail.value) {
    await addSecondaryOwner(props.thingId, newOwnerEmail.value)
    newOwnerEmail.value = ''
  }
}

async function onRemoveOwner(email: string) {
  if (email) await removeOwner(props.thingId, email)
}

async function toggleSitePrivacy() {
  await updateThingPrivacy(props.thingId, thing.value.isPrivate)
}

const emitClose = () => emits('close')
</script>
