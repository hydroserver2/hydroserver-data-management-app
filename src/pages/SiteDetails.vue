<template>
  <div v-if="loaded && authorized" class="my-3 mx-4 site-details">
    <v-row v-if="thing" class="align-center site-header">
      <v-col cols="12" class="d-flex align-center flex-wrap site-header-row">
        <h5 class="text-h5 mt-2 mb-0">{{ thing.name }}</h5>
        <div class="site-header-actions">
          <v-btn
            v-if="
              hasPermission(PermissionResource.Thing, PermissionAction.Delete)
            "
            class="site-delete-btn"
            color="red-darken-3"
            @click="isDeleteModalOpen = true"
          >
            Delete site
          </v-btn>
          <div class="site-header-actions__spacer" />
          <HydroShareArchivalButton
            v-if="
              hasPermission(PermissionResource.Thing, PermissionAction.Edit) &&
              hydroShareConnected
            "
          />
        </div>
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

    <v-row v-if="thing" class="site-map-row">
      <v-col>
        <div class="map-wrapper">
          <div class="map-canvas">
            <OpenLayersMap :things="[thing]" startInSatellite />
          </div>
          <v-card class="map-location-card" elevation="4">
            <div class="text-subtitle-2 font-weight-medium mb-2">Location</div>
            <div class="location-grid">
              <div
                v-for="detail in locationDetails"
                :key="detail.label"
                class="location-item"
              >
                <span class="text-caption text-medium-emphasis">
                  {{ detail.label }}
                </span>
                <span class="text-body-2">{{ detail.value }}</span>
              </div>
            </div>
          </v-card>
        </div>
      </v-col>
    </v-row>

    <v-row class="align-center mb-2">
      <v-col
        cols="12"
        md="8"
        class="d-flex align-center flex-wrap site-info-actions"
      >
        <h5 class="text-h6 mb-0 site-info-title">Site information</h5>

        <v-btn
          v-if="hasPermission(PermissionResource.Thing, PermissionAction.Edit)"
          class="site-info-btn"
          @click="isAccessControlModalOpen = true"
        >
          Access control
        </v-btn>
        <v-dialog v-model="isAccessControlModalOpen" width="40rem">
          <SiteAccessControl
            @close="isAccessControlModalOpen = false"
            :thing-id="thingId"
          />
        </v-dialog>

        <v-btn
          v-if="
            hasPermission(PermissionResource.Thing, PermissionAction.Edit) &&
            !!thing
          "
          class="site-info-btn"
          @click="isRegisterModalOpen = true"
          color="secondary"
        >
          Edit site information
        </v-btn>
        <v-dialog v-if="thing" v-model="isRegisterModalOpen" width="80rem">
          <SiteForm
            @close="isRegisterModalOpen = false"
            :thing-id="thingId"
            :workspace-id="thing.workspaceId"
          />
        </v-dialog>
      </v-col>
    </v-row>

    <v-row class="mb-0">
      <v-col cols="12" md="8">
        <SiteDetailsTable />
      </v-col>

      <v-col cols="12" md="4">
        <div class="d-flex align-center justify-space-between mb-2">
          <h5 class="text-h6 mb-0">Site photos</h5>
          <span v-if="hasPhotos" class="text-caption text-medium-emphasis">
            {{ photos?.length }} photos
          </span>
        </div>
        <div v-if="hasPhotos" class="photo-grid">
          <button
            v-for="(photo, index) in visiblePhotos"
            :key="photo.name"
            class="photo-thumb"
            type="button"
            @click="openPhoto(photo)"
          >
            <v-img :src="photo.link" cover class="photo-thumb__image" />
            <div
              v-if="index === visiblePhotos.length - 1 && extraPhotoCount > 0"
              class="photo-more"
            >
              +{{ extraPhotoCount }}
            </div>
          </button>
        </div>
        <div v-else-if="loading" class="text-center">
          <p>
            Your photos are being uploaded. They will appear once the upload is
            complete.
          </p>
          <v-progress-circular indeterminate color="primary" />
        </div>
        <div v-else class="text-body-2 text-medium-emphasis">
          No photos added yet.
        </div>
      </v-col>
    </v-row>

    <DatastreamTable v-if="thing && workspace" :workspace="workspace" />

    <v-dialog v-model="isPhotoViewerOpen" width="60rem">
      <v-card v-if="selectedPhoto">
        <div class="photo-viewer">
          <v-img :src="selectedPhoto.link" height="32rem" cover />
          <v-btn
            class="photo-nav-btn photo-nav-btn--left"
            variant="text"
            :icon="mdiChevronLeft"
            :disabled="!hasMultiplePhotos"
            @click="showPrevPhoto"
          />
          <v-btn
            class="photo-nav-btn photo-nav-btn--right"
            variant="text"
            :icon="mdiChevronRight"
            :disabled="!hasMultiplePhotos"
            @click="showNextPhoto"
          />
        </div>
        <v-card-text
          v-if="selectedPhoto.name"
          class="text-caption text-medium-emphasis"
        >
          {{ selectedPhoto.name }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="isPhotoViewerOpen = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
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
import hs, {
  PermissionAction,
  PermissionResource,
  Workspace,
  FileAttachment,
} from '@hydroserver/client'
import router from '@/router/router'
import OpenLayersMap from '@/components/Maps/OpenLayersMap.vue'
import SiteForm from '@/components/Site/SiteForm.vue'
import SiteAccessControl from '@/components/Site/SiteAccessControl.vue'
import DatastreamTable from '@/components/Datastream/DatastreamTable.vue'
import SiteDetailsTable from '@/components/Site/SiteDetailsTable.vue'
import SiteDeleteModal from '@/components/Site/SiteDeleteModal.vue'
import FullScreenLoader from '@/components/base/FullScreenLoader.vue'
import { useWorkspacePermissions } from '@/composables/useWorkspacePermissions'
import { useHydroShare } from '@/composables/useHydroShare'
import { useHydroShareStore } from '@/store/hydroShare'
import HydroShareArchivalButton from '@/components/HydroShare/HydroShareArchivalButton.vue'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'

const thingId = useRoute().params.id.toString()
const { photos, loading } = storeToRefs(usePhotosStore())
const workspace = ref<Workspace>()

const { isConnected: hydroShareConnected } = useHydroShare()
const { hydroShareArchive } = storeToRefs(useHydroShareStore())

const { hasPermission } = useWorkspacePermissions(workspace)
const loaded = ref(false)
const authorized = ref(true)
const { thing } = storeToRefs(useThingStore())
const { tags } = storeToRefs(useTagStore())

const hasPhotos = computed(() => !loading.value && photos.value?.length > 0)
const maxPhotoThumbnails = 6
const visiblePhotos = computed(() =>
  photos.value ? photos.value.slice(0, maxPhotoThumbnails) : []
)
const extraPhotoCount = computed(() =>
  Math.max(0, (photos.value?.length ?? 0) - maxPhotoThumbnails)
)

const isRegisterModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAccessControlModalOpen = ref(false)
const selectedPhotoIndex = ref<number | null>(null)
const isPhotoViewerOpen = ref(false)
const hasMultiplePhotos = computed(() => (photos.value?.length ?? 0) > 1)
const selectedPhoto = computed(() => {
  if (selectedPhotoIndex.value === null) return null
  return photos.value?.[selectedPhotoIndex.value] ?? null
})

const locationDetails = computed(() => {
  const location = thing.value?.location
  if (!location) return []

  return [
    {
      label: 'Latitude',
      value: formatCoordinate(location.latitude),
    },
    {
      label: 'Longitude',
      value: formatCoordinate(location.longitude),
    },
    {
      label: 'State/Province',
      value: formatLocationValue(location.adminArea1),
    },
    {
      label: 'County/District',
      value: formatLocationValue(location.adminArea2),
    },
    {
      label: 'Country',
      value: formatLocationValue(location.country),
    },
  ]
})

function switchToAccessControlModal() {
  isDeleteModalOpen.value = false
  isAccessControlModalOpen.value = true
}

function openPhoto(photo: FileAttachment) {
  const index = photos.value?.findIndex((p) => p.name === photo.name) ?? -1
  if (index < 0) return
  selectedPhotoIndex.value = index
  isPhotoViewerOpen.value = true
}

function showPrevPhoto() {
  if (!photos.value?.length || selectedPhotoIndex.value === null) return
  const total = photos.value.length
  selectedPhotoIndex.value = (selectedPhotoIndex.value - 1 + total) % total
}

function showNextPhoto() {
  if (!photos.value?.length || selectedPhotoIndex.value === null) return
  const total = photos.value.length
  selectedPhotoIndex.value = (selectedPhotoIndex.value + 1) % total
}

function formatCoordinate(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'number') return value.toFixed(6)
  return value.toString()
}

function formatLocationValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-'
  return value.toString()
}

async function onDeleteThing() {
  try {
    await hs.things.delete(thingId)
    await router.push('/sites')
  } catch (error) {
    console.error('Error deleting thing', error)
  }
}

onMounted(async () => {
  photos.value = []
  hs.things
    .getAttachments(thingId)
    .then((res) => {
      photos.value = res.data.filter(
        (attachment: FileAttachment) =>
          attachment.fileAttachmentType === 'Photo'
      )
    })
    .catch((error) => console.error('Error fetching photos from DB', error))

  const [thingResponse, hydroShareArchiveResponse, tagResponse] =
    await Promise.all([
      hs.things.getItem(thingId).catch((error: any) => {
        if (parseInt(error.status) === 403) authorized.value = false
        else console.error('Error fetching thing', error)

        return null
      }),
      hs.things.getHydroShareArchive(thingId).catch((error) => {
        // console.error('Error fetching hydroShareArchive', error)
        return null
      }),
      hs.things.getTags(thingId).catch((error) => {
        console.error('Error fetching additional metadata tags', error)
        return null
      }),
    ])

  tags.value = tagResponse?.data
  thing.value = thingResponse ?? undefined
  try {
    workspace.value =
      (await hs.workspaces.getItem(thing.value!.workspaceId)) ?? undefined
  } catch (error) {
    console.error('Error fetching workspace', error)
  }
  hydroShareArchive.value = hydroShareArchiveResponse?.data ?? null
  loaded.value = true
})
</script>

<style scoped>
.site-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.site-header {
  row-gap: 0.35rem;
}

.site-header-row {
  justify-content: space-between;
  gap: 0.5rem;
}

.site-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.site-header-actions__spacer {
  flex: 1;
}

.site-info-actions {
  gap: 0.5rem;
}

.site-info-title {
  text-align: left;
}

@media (max-width: 600px) {
  .site-info-title {
    width: 100%;
  }
}

.map-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
}

.map-canvas {
  height: 22rem;
}

.map-location-card {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  padding: 0.5rem;
  max-width: 18rem;
  background: rgba(255, 255, 255, 0.95);
  z-index: 2;
}

.location-grid {
  display: grid;
  gap: 0.25rem;
}

.location-item {
  display: flex;
  flex-direction: column;
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 0.5rem;
}

.photo-thumb {
  position: relative;
  display: block;
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: transparent;
  cursor: pointer;
  aspect-ratio: 1 / 1;
  appearance: none;
}

.photo-thumb :deep(.v-img__img) {
  object-fit: cover;
}

.photo-thumb__image {
  height: 100%;
  width: 100%;
}

.photo-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
}

.photo-viewer {
  position: relative;
}

.photo-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
}

.photo-nav-btn--left {
  left: 0.5rem;
}

.photo-nav-btn--right {
  right: 0.5rem;
}

@media (min-width: 961px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fit, 85px);
    justify-content: flex-start;
    max-height: 12rem;
    overflow: hidden;
  }
}

@media (max-width: 960px) {
  .map-location-card {
    position: static;
    margin-top: 0.75rem;
    max-width: none;
  }

  .map-canvas {
    height: 18rem;
  }
}

@media (max-width: 600px) {
  .site-header-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-header-actions {
    width: 100%;
    margin-left: 0;
  }

  .site-delete-btn {
    align-self: flex-start;
  }

  .site-info-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .site-info-btn {
    align-self: flex-start;
  }
}
</style>
