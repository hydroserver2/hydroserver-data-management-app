<template>
  <v-container v-if="thing">
    <h5 class="text-h5 my-4">{{ thing?.name }}</h5>

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
        <v-btn @click="isAccessControlModalOpen = true">Access Control</v-btn>
        <v-dialog v-model="isAccessControlModalOpen" width="60rem">
          <SiteAccessControl
            @close="isAccessControlModalOpen = false"
            :thing-id="thingId"
          />
        </v-dialog>
      </v-col>

      <v-col cols="auto" v-if="isOwner && hydroShareConnected">
        <v-btn @click="isHydroShareArchiveModalOpen = true"
          >Archive to HydroShare</v-btn
        >
        <v-dialog v-model="isHydroShareArchiveModalOpen" width="60rem">
          <SiteHydroShareArchivalModal
            @close="isHydroShareArchiveModalOpen = false"
            :thing-id="thingId"
          />
        </v-dialog>
      </v-col>

      <v-col cols="auto" v-if="isOwner">
        <v-btn @click="isRegisterModalOpen = true" color="secondary"
          >Edit Site Information</v-btn
        >
        <v-dialog v-model="isRegisterModalOpen" width="80rem">
          <SiteForm @close="isRegisterModalOpen = false" :thing-id="thingId" />
        </v-dialog>
      </v-col>

      <v-col cols="auto" v-if="isOwner">
        <v-btn color="red-darken-3" @click="isDeleteModalOpen = true"
          >Delete Site</v-btn
        >
        <v-dialog v-model="isDeleteModalOpen" v-if="thing" width="40rem">
          <SiteDeleteModal
            :thing="thing"
            @switch-to-access-control="switchToAccessControlModal"
            @close="isDeleteModalOpen = false"
            @delete="onDeleteThing"
          />
        </v-dialog>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <SiteDetailsTable :thing-id="thingId" />
      </v-col>

      <v-col cols="12" md="4">
        <v-carousel hide-delimiters v-if="hasPhotos">
          <v-carousel-item
            v-for="photo in photos"
            :key="photo.id"
            :src="photo.link"
            cover
          />
        </v-carousel>
        <div v-else-if="loading" class="text-center">
          <p>
            Your photos are being uploaded. They will appear once the upload is
            complete.
          </p>
          <v-progress-circular indeterminate color="primary" />
        </div>
      </v-col>
    </v-row>

    <h5 class="text-h5 my-6">Datastreams Available at this Site</h5>
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
    <DatastreamTable
      v-if="thing"
      class="my-6"
      :is-owner="thing.ownsThing"
      :thing-id="thingId"
    />

    <h6 class="text-h6" style="color: #b71c1c">
      {{ thing?.dataDisclaimer }}
    </h6>
  </v-container>
  <v-container v-else>
    <h5 class="text-h5 my-4">Loading Site Details...</h5>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '@/store/photos'
import { useThingStore } from '@/store/thing'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import router from '@/router/router'
import GoogleMap from '@/components/GoogleMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import SiteAccessControl from '@/components/Site/SiteAccessControl.vue'
import DatastreamTable from '@/components/Datastream/DatastreamTable.vue'
import SiteDetailsTable from '@/components/Site/SiteDetailsTable.vue'
import SiteDeleteModal from '@/components/Site/SiteDeleteModal.vue'
import SiteHydroShareArchivalModal from '@/components/Site/SiteHydroShareArchivalModal.vue'

const thingId = useRoute().params.id.toString()
const { photos, loading } = storeToRefs(usePhotosStore())

const { thing } = storeToRefs(useThingStore())
const { user } = storeToRefs(useUserStore())
const isOwner = computed(() => thing.value?.ownsThing)
const hydroShareConnected = computed(() => user.value?.hydroShareConnected)
const hasPhotos = computed(() => !loading.value && photos.value?.length > 0)

const isRegisterModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAccessControlModalOpen = ref(false)
const isHydroShareArchiveModalOpen = ref(false)

function switchToAccessControlModal() {
  isDeleteModalOpen.value = false
  isAccessControlModalOpen.value = true
}

async function onDeleteThing() {
  try {
    await api.deleteThing(thingId)
    delete thing.value
    await router.push('/sites')
  } catch (error) {
    console.error('Error deleting thing', error)
  }
}

const mapOptions = computed(() =>
  thing.value
    ? {
        center: { lat: thing.value.latitude, lng: thing.value.longitude },
        zoom: 16,
        mapTypeId: 'satellite',
      }
    : undefined
)

onMounted(async () => {
  photos.value = []
  api
    .fetchSitePhotos(thingId)
    .then((data) => (photos.value = data))
    .catch((error) => console.error('Error fetching photos from DB', error))
  try {
    thing.value = await api.fetchThing(thingId)
  } catch (error) {
    console.error('Error fetching thing', error)
  }
})
</script>
