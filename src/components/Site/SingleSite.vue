<template>
  <v-container>
    <v-row v-if="thing">
      <v-col class="single-site-name">
        <h5 class="text-h5">{{ thing?.name }}</h5>
      </v-col>
    </v-row>
    <v-row v-if="thing" style="height: 25rem">
      <v-col>
        <GoogleMap
          :key="stringThing"
          :things="[thing]"
          :mapOptions="mapOptions"
        />
      </v-col>
    </v-row>
    <v-row class="justify-start" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">Site Information</h5>
      </v-col>
      <v-col cols="auto" v-if="isOwner">
        <v-btn class="access_control" @click="isAccessControlModalOpen = true"
          >Access Control</v-btn
        >
        <v-dialog
          class="access_control_dialog"
          v-model="isAccessControlModalOpen"
          width="60rem"
        >
          <SiteAccessControl
            @close="isAccessControlModalOpen = false"
            :thing-id="thingId"
          ></SiteAccessControl>
        </v-dialog>
      </v-col>
      <v-col cols="auto" v-if="isOwner">
        <v-btn @click="isRegisterModalOpen = true" color="secondary"
          >Edit Site Information</v-btn
        >
        <v-dialog v-model="isRegisterModalOpen" width="80rem">
          <SiteForm
            @close="isRegisterModalOpen = false"
            :thing-id="thingId"
          ></SiteForm>
        </v-dialog>
      </v-col>
      <v-col cols="auto" v-if="isOwner">
        <v-btn
          color="red-darken-3"
          style="margin-left: 1rem"
          @click="isDeleteModalOpen = true"
          >Delete Site</v-btn
        >
        <v-dialog v-model="isDeleteModalOpen" width="40rem">
          <v-card>
            <v-card-title>
              <span class="text-h5">Confirm Deletion</span>
            </v-card-title>
            <v-card-text>
              This action will permanently delete the site along with all
              associated datastreams and observations
              <strong>for all users of this system</strong>. If you want to keep
              your data, you can backup to HydroShare or download a local copy
              before deletion. Alternatively, you can pass ownership of this
              site to someone else on the
              <v-btn @click="switchToAccessControlModal">Access Control</v-btn>
              page.
            </v-card-text>
            <v-card-text>
              Please type the site name (<strong>{{ thing.name }}</strong
              >) to confirm deletion:
              <v-form>
                <v-text-field
                  v-model="deleteInput"
                  label="Site name"
                  solo
                  @keydown.enter.prevent="deleteThing"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn-cancel @click="isDeleteModalOpen = false"
                >Cancel</v-btn-cancel
              >
              <v-btn color="delete" @click="deleteThing">Delete</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
      <!-- Jeff said to comment out anything related to following a site August 8, 2023 -->
      <!-- <v-col cols="auto" v-if="!isOwner">
        <v-switch
          color="secondary"
          hide-details
          v-if="isAuthenticated && thing"
          v-model="thing.followsThing"
          @change="updateFollow"
          :label="thing.followsThing ? 'You Follow This site' : 'Follow Site'"
        ></v-switch>
      </v-col> -->
    </v-row>
    <v-row>
      <v-col cols="12" md="8">
        <v-data-table class="elevation-2">
          <tbody>
            <tr v-for="property in thingProperties" :key="property.label">
              <td><i :class="property.icon"></i></td>
              <td>{{ property.label }}</td>
              <td>{{ property.value }}</td>
            </tr>
          </tbody>
          <template v-slot:bottom></template>
        </v-data-table>
      </v-col>

      <v-col cols="12" md="4">
        <v-carousel
          hide-delimiters
          v-if="
            !photoStore.loading &&
            photoStore.photos[thingId] &&
            photoStore.photos[thingId].length > 0
          "
        >
          <v-carousel-item
            v-for="photo in photoStore.photos[thingId]"
            :key="photo.id"
            :src="photo.link"
            cover
          >
          </v-carousel-item>
        </v-carousel>
        <div v-else-if="photoStore.loading" class="text-center">
          <p>
            Your photos are being uploaded. They will appear once the upload is
            complete.
          </p>
          <v-progress-circular
            indeterminate
            color="primary"
          ></v-progress-circular>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="auto">
        <h5 class="text-h5">Datastreams Available at this Site</h5>
      </v-col>
      <v-spacer></v-spacer>
      <!-- <v-col cols="auto">
        <img
          style="max-height: 1.5rem"
          src="@/assets/hydro.png"
          alt="hydro share logo"
          class="site-information-image"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn color="grey" class="site-information-button"
          >Download Data from HydroShare</v-btn
        >
      </v-col> -->
    </v-row>
    <v-row class="pb-2" v-if="isOwner">
      <v-col>
        <v-btn-secondary
          prependIcon="mdi-plus"
          variant="elevated"
          :to="{ name: 'DatastreamForm', params: { id: thingId } }"
          >Add New Datastream</v-btn-secondary
        >
      </v-col>
    </v-row>
    <v-row class="pb-5">
      <DatastreamTable :thing-id="thingId" />
    </v-row>
    <v-row v-if="thing?.dataDisclaimer" class="pt-2 pb-8">
      <h6 class="text-h6" style="color: #b71c1c">
        {{ thing.dataDisclaimer }}
      </h6>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import GoogleMap from '@/components/GoogleMap.vue'
import SiteAccessControl from '@/components/Site/SiteAccessControl.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '@/store/photos'
import { useThing } from '@/composables/useThing'
import { useThingOwnership } from '@/composables/useThingOwnership'
import DatastreamTable from '../Datastream/DatastreamTable.vue'

const photoStore = usePhotosStore()
const thingId = useRoute().params.id.toString()

const { isOwner } = useThingOwnership(thingId)

const {
  thing,
  stringThing,
  mapOptions,
  deleteInput,
  deleteThing,
  thingProperties,
  isRegisterModalOpen,
  isDeleteModalOpen,
  isAccessControlModalOpen,
  switchToAccessControlModal,
} = useThing(thingId)

onMounted(async () => {
  photoStore.fetchPhotos(thingId)
  // TODO: observationStore.fetchObservationsByThingId(thingId)
})
</script>
