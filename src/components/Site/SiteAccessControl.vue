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
          <v-btn color="primary" @click="addSecondaryOwner">Submit</v-btn>
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
          <v-btn
            v-if="showPrimaryOwnerConfirmation"
            color="primary"
            @click="transferPrimaryOwnership"
            >Confirm</v-btn
          >
          <v-btn
            v-else
            color="primary"
            @click="showPrimaryOwnerConfirmation = true"
            >Submit</v-btn
          >
        </v-col>
      </v-row>

      <h6 class="text-h6 my-4">Current Owners</h6>

      <v-row v-for="owner in thing.owners" class="my-0">
        <v-col cols="auto" class="py-0">
          {{ owner.firstName }} {{ owner.lastName }} -
          {{
            owner.organizationName ? owner.organizationName : 'No Organization'
          }}
        </v-col>

        <v-col class="py-0" cols="auto">
          <strong v-if="owner.isPrimaryOwner">(Primary)</strong>
          <v-btn
            v-else
            color="delete"
            v-if="isPrimaryOwner || owner.email == authStore.user.email"
            @click="removeOwner(owner.email)"
            >Remove</v-btn
          >
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
      <v-btn variant="text" @click="emitClose">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import { useThing } from '@/composables/useThing'
import { useThingOwnership } from '@/composables/useThingOwnership'

const authStore = useAuthStore()
const emits = defineEmits(['close'])
const props = defineProps<{
  thingId: string
}>()

const {
  isPrimaryOwner,
  newOwnerEmail,
  newPrimaryOwnerEmail,
  addSecondaryOwner,
  showPrimaryOwnerConfirmation,
  transferPrimaryOwnership,
  removeOwner,
} = useThingOwnership(props.thingId)

const { thing, toggleSitePrivacy } = useThing(props.thingId)

const emitClose = () => emits('close')
</script>
