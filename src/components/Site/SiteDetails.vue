<template>
  <v-container>
    <v-row v-if="thing">
      <v-col class="single-site-name">
        <h5 class="text-h5">{{ thing?.name }}</h5>
      </v-col>
    </v-row>
    <v-row v-if="thing" style="height: 25rem">
      <v-col>
        <GoogleMap :things="[thing]" :mapOptions="mapOptions" />
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
        <v-btn color="red-darken-3" @click="isDeleteModalOpen = true"
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
              <v-btn
                class="px-0"
                variant="text"
                @click="switchToAccessControlModal"
                >Access Control</v-btn
              >
              page.
            </v-card-text>
            <v-card-text>
              Please type the site name (<strong>{{ thing.name }}</strong
              >) to confirm deletion:
              <v-form>
                <v-text-field
                  class="pt-2"
                  v-model="deleteInput"
                  label="Site name"
                  solo
                  @keydown.enter.prevent="onDeleteThing"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn-cancel @click="isDeleteModalOpen = false"
                >Cancel</v-btn-cancel
              >
              <v-btn-delete color="delete" @click="onDeleteThing"
                >Delete</v-btn-delete
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
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
        <v-carousel hide-delimiters v-if="hasPhotos">
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
      <v-col>
        <DatastreamTable :thing-id="thingId" />
      </v-col>
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
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '@/store/photos'
import { useThingOwnership } from '@/composables/useThingOwnership'
import DatastreamTable from '../Datastream/DatastreamTable.vue'
import { useThingStore } from '@/store/things'
import { storeToRefs } from 'pinia'
import router from '@/router/router'

const thingId = useRoute().params.id.toString()
const photoStore = usePhotosStore()

const hasPhotos = computed(() => {
  const photos = photoStore.photos[thingId]
  return !photoStore.loading && photos && photos.length > 0
})

const { isOwner } = useThingOwnership(thingId)

const isRegisterModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAccessControlModalOpen = ref(false)
const deleteInput = ref('')

function switchToAccessControlModal() {
  isDeleteModalOpen.value = false
  isAccessControlModalOpen.value = true
}

async function onDeleteThing() {
  if (!thing.value) {
    console.error('Site could not be found.')
    return
  }
  if (deleteInput.value !== thing.value.name) {
    console.error('Site name does not match.')
    return
  }
  await deleteThing(thingId)
  await router.push('/sites')
}

const { things } = storeToRefs(useThingStore())
const { deleteThing, fetchThingById } = useThingStore()
const thing = computed(() => things.value[thingId])

const mapOptions = computed(() => {
  if (things.value[thingId])
    return {
      center: {
        lat: things.value[thingId].latitude,
        lng: things.value[thingId].longitude,
      },
      zoom: 16,
      mapTypeId: 'satellite',
    }
})

const thingProperties = computed(() => {
  if (!thing.value) return []
  const {
    id,
    samplingFeatureCode,
    latitude,
    longitude,
    elevation_m,
    description,
    siteType,
    state,
    county,
    isPrivate,
    owners,
  } = thing.value

  return [
    { icon: 'fas fa-id-badge', label: 'ID', value: id },
    {
      icon: 'fas fa-barcode',
      label: 'Site Code',
      value: samplingFeatureCode,
    },
    { icon: 'fas fa-map', label: 'Latitude', value: latitude },
    { icon: 'fas fa-map', label: 'Longitude', value: longitude },
    { icon: 'fas fa-mountain', label: 'Elevation', value: elevation_m },
    { icon: 'fas fa-file-alt', label: 'Description', value: description },
    { icon: 'fas fa-map-pin', label: 'Site Type', value: siteType },
    { icon: 'fas fa-flag-usa', label: 'State', value: state },
    { icon: 'fas fa-flag-usa', label: 'County', value: county },
    {
      icon: isPrivate ? 'fas fa-lock' : 'fas fa-globe',
      label: 'Privacy',
      value: isPrivate ? 'Private' : 'Public',
    },
    {
      icon: 'fas fa-user',
      label: 'Site Owners',
      value: owners
        .map(
          (owner) =>
            owner.firstName +
            ' ' +
            owner.lastName +
            (owner.organizationName ? `: ${owner.organizationName}` : '')
        )
        .join(', '),
    },
  ]
})

onMounted(async () => {
  photoStore.fetchPhotos(thingId)
  await fetchThingById(thingId)
})
</script>
