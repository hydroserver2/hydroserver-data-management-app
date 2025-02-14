<template>
  <v-card>
    <v-card-title class="text-h5">Site access control</v-card-title>
    <v-divider />

    <v-card-text>
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
                  and guests of the system. By default, all related datastreams
                  will also be public, but can be made private from the
                  datastreams table on the Site Details page.
                </p>
                <p v-else style="max-width: 25rem">
                  Setting your site to private will make it and all related
                  datastreams visible to only you and other owners of your site.
                </p>
              </template>
            </v-tooltip>
          </h6>
        </v-col>
      </v-row>

      <v-row v-if="thing">
        <v-col cols="auto" class="py-0">
          <v-switch
            v-model="thing.isPrivate"
            :label="thing.isPrivate ? 'Site is private' : 'Site is public'"
            color="primary"
            hide-details
            @change="toggleSitePrivacy"
          />
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider />

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emitClose">Close</v-btn-cancel>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useThingStore } from '@/store/thing'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api'

const emits = defineEmits(['close'])
const props = defineProps<{
  thingId: string
}>()

const { thing } = storeToRefs(useThingStore())

const isUpdating = ref(false)

async function toggleSitePrivacy() {
  try {
    isUpdating.value = true

    thing.value = await api.updateThingPrivacy(
      props.thingId,
      thing.value!.isPrivate
    )
  } catch (error) {
    console.error('Error updating thing privacy', error)
  } finally {
    isUpdating.value = false
  }
}

const emitClose = () => emits('close')
</script>
