<template>
  <v-card>
    <v-card-title class="text-h5">HydroShare Archival</v-card-title>
    <v-divider />
    <v-card-text>
      <v-form
        ref="archiveForm"
        v-model="valid"
        validate-on="blur"
        enctype="multipart/form-data"
        @submit.prevent="archiveThing"
        :disabled="loading"
      >
        <div v-if="!thing?.hydroShareArchiveResourceId">
          <h6 class="text-h6 my-4">Resource Metadata</h6>
          <v-row>
            <v-col>
              <v-text-field
                label="Resource Title"
                v-model="archive.resourceTitle"
                :rules="rules.required"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                label="Resource Abstract"
                v-model="archive.resourceAbstract"
                :rules="rules.required"
              ></v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-combobox
                label="Resource Keywords"
                v-model="archive.resourceKeywords"
                multiple
                chips
                closable-chips
                :rules="rules.minLength(1)"
              ></v-combobox>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <h6 class="text-h6 my-4">Update HydroShare Archive</h6>
          <v-row>
            <v-col>
              <p>
                A HydroShare archive resource has been created for this site and can be accessed
                <a
                  :href="`https://www.hydroshare.org/resource/${thing?.hydroShareArchiveResourceId}/`"
                  target="_blank"
                >
                  here.
                </a>
              </p><br>
              <p class="text-break">
                Use this form if you want to re-upload updated datastreams from HydroServer to HydroShare. Otherwise,
                please use the HydroShare link above to make any other changes to the resource.
              </p>
            </v-col>
          </v-row>
        </div>
        <h6 class="text-h6 my-4">Included Datastreams</h6>
        <v-row>
          <v-col>
            <v-autocomplete
              label="Datastreams"
              v-model="archive.datastreams"
              :items="datastreams"
              :item-title="datastreamTitle"
              chips
              closable-chips
              multiple
              :rules="rules.minLength(1)"
            ></v-autocomplete>
          </v-col>
        </v-row>
        <div v-if="!thing?.hydroShareArchiveResourceId">
          <h6 class="text-h6 my-4">Resource Sharing Status</h6>
          <v-row>
            <v-col cols="auto" class="py-0">
              <v-switch
                v-model="archive.publicResource"
                :label="archive.publicResource ? 'Public Resource' : 'Private Resource'"
                color="primary"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>
        </div>
      </v-form>
    </v-card-text>
    <v-divider />
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emitClose">Close</v-btn-cancel>
      <v-btn-primary @click="archiveThing" :loading="loading">Save</v-btn-primary>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useThingStore } from '@/store/thing'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { onMounted, reactive, ref } from 'vue'
import { Datastream, ThingArchive } from '@/types'
import { api } from '@/services/api'
import { VForm } from 'vuetify/components'
import { rules } from '@/utils/rules'
import Notification from '@/utils/notifications'

const { user } = storeToRefs(useUserStore())
const emits = defineEmits(['close'])
const props = defineProps<{
  thingId: string
}>()

const { thing } = storeToRefs(useThingStore())
const datastreams = ref<Datastream[]>([])
const valid = ref(false)
const loading = ref(false)
const archiveForm = ref<VForm>()
const archive = reactive<ThingArchive>(new ThingArchive())

const datastreamTitle = (item: Datastream) => `${item.description} - ${item.id}`

async function populateArchive() {

  let keywords = [] as string[]

  datastreams.value.forEach((datastream) => {
    if (
      keywords.indexOf(datastream.sampledMedium) === -1 &&
      !['Not applicable', 'Unknown', 'Other'].includes(datastream.sampledMedium)
    ) {
      keywords.push(datastream.sampledMedium)
    }
  })

  Object.assign(archive, {
    resourceTitle: `HydroServer Archive: ${thing.value?.name}`,
    resourceAbstract: `This HydroShare resource serves as an archive for monitoring data collected at ` +
      `${thing.value?.name}. The datasets contained herein represent a collection of hydrologic observations ` +
      `collected at this location. The purpose of this archive is to provide a centralized repository for the ` +
      `hydrologic data recorded at this site, facilitating accessibility, analysis, and collaboration among ` +
      `researchers and stakeholders.`,
    resourceKeywords: ['HydroServer Site Archive', thing.value?.siteType, ...keywords],
    publicResource: !thing.value?.isPrivate,
    datastreams: datastreams.value
  })
}

async function archiveThing() {
  await archiveForm.value?.validate()
  if (!valid.value) return

  if (archive && thing.value !== undefined) {
    try {
      loading.value = true
      thing.value.hydroShareArchiveResourceId = await api.postHydroShareArchive(thing.value.id, archive)
      loading.value = false
      Notification.toast({
        message: 'Finished uploading site data to HydroShare.',
        type: 'success'
      })
      emitClose()
    } catch (error) {
      console.error('Error creating HydroShare archive.')
      loading.value = false
      Notification.toast({
        message: 'Failed to upload site data to HydroShare.',
        type: 'error'
      })
    }
  }
}

onMounted(async () => {
  datastreams.value = await api.fetchDatastreamsForThing(props.thingId)
  await populateArchive()
})

const emitClose = () => emits('close')
</script>
