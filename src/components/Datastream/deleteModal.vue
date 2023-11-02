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
        some of your datastreams. Before deletion, all related datastreams need
        to be removed or reassigned to another {{ itemName }}. The following
        datastreams are currently linked to this {{ itemName }}:

        <div
          class="my-4"
          v-for="datastream in datastreamsForItem"
          :key="datastream.id"
        >
          <p><strong>DatastreamID:</strong> {{ datastream.id }}</p>
          <p>
            <strong>Observed Property:</strong>
            {{ OPName(datastream.observedPropertyId) }}
          </p>
          <p><strong>Unit:</strong> {{ unitName(datastream.unitId) }}</p>
          <p>
            <strong>Processing Level:</strong>
            {{ PLName(datastream.processingLevelId, 'code') }}
          </p>
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
      <v-btn @click="emit('close')">Cancel</v-btn>
      <v-btn v-if="!hasDatastreams" color="delete" @click="emit('delete')"
        >Delete</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Datastream } from '@/types'
import { computed, onMounted } from 'vue'
import { useDatastreamStore } from '@/store/datastreams'
import {
  useUnitGetters,
  useProcessingLevelGetters,
  useObservedPropertiesGetters,
} from '@/composables/useMetadataGetters'

const { getNameById: unitName } = useUnitGetters()
const { getNameById: PLName } = useProcessingLevelGetters()
const { getNameById: OPName } = useObservedPropertiesGetters()

const datastreamStore = useDatastreamStore()
const emit = defineEmits(['delete', 'close'])
const props = defineProps({
  itemName: String,
  itemID: String,
  parameterName: String,
})

const datastreamsForItem = computed(() => {
  if (props.itemID && props.parameterName) {
    return datastreamStore.getDatastreamsByParameter(
      props.parameterName as keyof Datastream,
      props.itemID
    )
  }
})

const hasDatastreams = computed(() => {
  return datastreamsForItem.value && datastreamsForItem.value.length > 0
})

onMounted(async () => await datastreamStore.fetchDatastreams())
</script>
