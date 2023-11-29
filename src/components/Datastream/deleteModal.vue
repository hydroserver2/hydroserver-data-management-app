<template>
  <v-card>
    <v-card-title class="text-h5">
      {{
        hasDatastreams
          ? `Cannot delete ${itemName}`
          : `Confirm ${itemName} deletion`
      }}
    </v-card-title>

    <v-divider class="my-4"></v-divider>

    <v-card-text>
      <template v-if="hasDatastreams">
        This {{ itemName }} cannot be deleted because it's being referenced by
        some of your datastreams. Before deletion, all of the following
        datastreams need to be deleted or use a different {{ itemName }}:
        <div
          class="my-4"
          v-for="(thing, thingId) in thingsWithDatastreams"
          :key="thingId"
        >
          <p>
            <router-link :to="`/sites/${thingId}`">
              <strong>{{ thing.name }}</strong>
            </router-link>
            has the following datastreams using this {{ itemName }}:
          </p>
          <v-list>
            <v-list-item v-for="id in thing.datastreamIds" :key="id">
              <router-link :to="`/sites/${thingId}/datastreams/form/${id}`">{{
                id
              }}</router-link>
            </v-list-item>
          </v-list>
        </div>
      </template>
      <template v-else>
        This {{ itemName }} isn't being used by any datastreams and is safe to
        delete.
      </template>
    </v-card-text>

    <v-divider class="my-4"></v-divider>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="emit('close')">Cancel</v-btn-cancel>
      <v-btn-delete v-if="!hasDatastreams" @click="onDelete"
        >Delete</v-btn-delete
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Datastream, Thing } from '@/types'
import { computed, onMounted, ref } from 'vue'
import { useDatastreamStore } from '@/store/datastreams'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'

const things = ref<Thing[]>([])
const { datastreams } = storeToRefs(useDatastreamStore())

const emit = defineEmits(['delete', 'close'])
const props = defineProps({
  itemName: String,
  itemID: String,
  parameterName: String,
})

const onDelete = () => {
  emit('delete')
  emit('close')
}

const datastreamsForItem = computed(() => {
  if (!props.itemID || !props.parameterName) return
  return Object.values(datastreams.value)
    .flat()
    .filter(
      (ds) => ds[props.parameterName as keyof Datastream] === props.itemID
    )
})

const thingsWithDatastreams = computed(() => {
  if (!datastreamsForItem.value) return {}

  return datastreamsForItem.value.reduce((acc: any, datastream) => {
    const thing = things.value.find((t) => t.id === datastream.thingId)
    if (!thing) return acc
    if (!acc[thing.id]) acc[thing.id] = { name: thing.name, datastreamIds: [] }
    acc[thing.id].datastreamIds.push(datastream.id)
    return acc
  }, {})
})

const hasDatastreams = computed(() => {
  return datastreamsForItem.value && datastreamsForItem.value.length > 0
})

onMounted(async () => {
  try {
    things.value = await api.fetchThings()
  } catch (error) {
    console.error('Error fetching things', error)
  }
})
</script>
