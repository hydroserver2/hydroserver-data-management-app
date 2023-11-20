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
          <SiteForm @close="isRegisterModalOpen = false" :thing-id="thingId" />
        </v-dialog>
      </v-col>
      <v-col cols="auto" v-if="isOwner">
        <v-btn color="red-darken-3" @click="isDeleteModalOpen = true"
          >Delete Site</v-btn
        >
        <v-dialog v-model="isDeleteModalOpen" width="40rem">
          <SiteDeleteModal
            :thing="things[thingId]"
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
            v-for="photo in photos[thingId]"
            :key="photo.id"
            :src="photo.link"
            cover
          >
          </v-carousel-item>
        </v-carousel>
        <div v-else-if="loading" class="text-center">
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
import DatastreamTable from '../Datastream/DatastreamTable.vue'
import { useThingStore } from '@/store/things'
import { storeToRefs } from 'pinia'
import router from '@/router/router'
import SiteDetailsTable from '@/components/Site/SiteDetailsTable.vue'
import SiteDeleteModal from '@/components/Site/SiteDeleteModal.vue'
import { api } from '@/services/api'

const thingId = useRoute().params.id.toString()
const { fetchPhotos } = usePhotosStore()
const { photos, loading } = storeToRefs(usePhotosStore())

const { fetchThingById } = useThingStore()
const { things } = storeToRefs(useThingStore())
const thing = computed(() => things.value[thingId])

const hasPhotos = computed(
  () => !loading.value && photos.value[thingId]?.length > 0
)

const isOwner = computed(() => things.value[thingId]?.ownsThing)

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
    delete things.value[thingId]
    await router.push('/sites')
  } catch (error) {
    console.error('Error deleting thing', error)
  }
}

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

onMounted(async () => {
  fetchPhotos(thingId)
  fetchThingById(thingId)
})
</script>
