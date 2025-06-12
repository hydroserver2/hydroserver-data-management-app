<template>
  <v-container v-if="loaded && authorized">
    <h5 class="text-h5 my-4">{{ thing?.name }}</h5>

    <v-row v-if="thing" style="height: 25rem">
      <v-col>
        <OpenLayersMap :things="[thing]" startInSatellite />
      </v-col>
    </v-row>

    <v-row class="justify-start" align="center">
      <v-col cols="auto">
        <h5 class="text-h5">Site information</h5>
      </v-col>

      <v-col cols="auto" v-if="canEditThings">
        <v-btn @click="isAccessControlModalOpen = true">Access control</v-btn>
        <v-dialog v-model="isAccessControlModalOpen" width="40rem">
          <SiteAccessControl
            @close="isAccessControlModalOpen = false"
            :thing-id="thingId"
          />
        </v-dialog>
      </v-col>

      <v-col cols="auto" v-if="canEditThings && !!thing">
        <v-btn @click="isRegisterModalOpen = true" color="secondary"
          >Edit site information</v-btn
        >
        <v-dialog v-model="isRegisterModalOpen" width="80rem">
          <SiteForm
            @close="isRegisterModalOpen = false"
            :thing-id="thingId"
            :workspace-id="thing.workspaceId"
          />
        </v-dialog>
      </v-col>

      <v-col cols="auto" v-if="canDeleteThings">
        <v-btn color="red-darken-3" @click="isDeleteModalOpen = true"
          >Delete site</v-btn
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

      <v-spacer />

      <v-col cols="auto" v-if="canEditThings && hydroShareConnected">
        <HydroShareArchivalButton />
      </v-col>
    </v-row>

    <v-row class="mb-6">
      <v-col cols="12" md="8">
        <SiteDetailsTable />
      </v-col>

      <v-col cols="12" md="4">
        <v-carousel hide-delimiters v-if="hasPhotos">
          <v-carousel-item
            v-for="photo in photos"
            :key="photo.name"
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

    <DatastreamTable v-if="thing && workspace" :workspace="workspace" />
  </v-container>
  <v-container v-else-if="loaded && !authorized">
    <h5 class="text-h5 my-4">
      You are not authorized to view this private site.
    </h5>
  </v-container>
  <FullScreenLoader v-else />
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '@/store/photos'
import { useThingStore } from '@/store/thing'
import { useTagStore } from '@/store/tags'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
import router from '@/router/router'
import OpenLayersMap from '@/components/Maps/OpenLayersMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import SiteAccessControl from '@/components/Site/SiteAccessControl.vue'
import DatastreamTable from '@/components/Datastream/DatastreamTable.vue'
import SiteDetailsTable from '@/components/Site/SiteDetailsTable.vue'
import SiteDeleteModal from '@/components/Site/SiteDeleteModal.vue'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { Workspace } from '@/types'
import { useHydroShare } from '@/composables/useHydroShare'
import { useHydroShareStore } from '@/store/hydroShare'
import HydroShareArchivalButton from '@/components/HydroShare/HydroShareArchivalButton.vue'

const thingId = useRoute().params.id.toString()
const { photos, loading } = storeToRefs(usePhotosStore())
const workspace = ref<Workspace>()

const { isConnected: hydroShareConnected } = useHydroShare()
const { hydroShareArchive } = storeToRefs(useHydroShareStore())

const { canEditThings, canDeleteThings } = useWorkspacePermissions(workspace)
const loaded = ref(false)
const authorized = ref(true)
const { thing } = storeToRefs(useThingStore())
const { tags } = storeToRefs(useTagStore())

const hasPhotos = computed(() => !loading.value && photos.value?.length > 0)

const isRegisterModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAccessControlModalOpen = ref(false)

function switchToAccessControlModal() {
  isDeleteModalOpen.value = false
  isAccessControlModalOpen.value = true
}

async function onDeleteThing() {
  try {
    await api.deleteThing(thingId)
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
    const [thingResponse, hydroShareArchiveResponse, tagResponse] =
      await Promise.all([
        api.fetchThing(thingId).catch((error: any) => {
          if (parseInt(error.status) === 403) authorized.value = false
          else console.error('Error fetching thing', error)

          return null
        }),
        api.fetchHydroShareArchive(thingId).catch((error) => {
          console.error('Error fetching hydroShareArchive', error)
          return null
        }),
        api.fetchSiteTags(thingId).catch((error) => {
          console.error('Error fetching additional metadata tags', error)
          return null
        }),
      ])

    tags.value = tagResponse
    thing.value = thingResponse
    try {
      workspace.value = await api.fetchWorkspace(thing.value!.workspaceId)
    } catch (error) {
      console.error('Error fetching workspace', error)
    }

    hydroShareArchive.value = hydroShareArchiveResponse
  } finally {
    loaded.value = true
  }
})
</script>
