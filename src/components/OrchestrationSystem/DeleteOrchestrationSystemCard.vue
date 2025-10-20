<template>
  <v-card>
    <v-toolbar flat color="red-darken-4">
      <v-card-title class="text-h5">
        <v-icon>mdi-alert</v-icon> Confirm orchestration system deletion
      </v-card-title>
    </v-toolbar>

    <v-card-text v-if="relatedSources.length > 0">
      <v-alert>
        Before you remove <strong> {{ orchestrationSystem.name }} </strong> as
        an orchestration system, you must delete all of its related data
        sources.
      </v-alert>
    </v-card-text>

    <v-card-text>
      <v-card
        variant="outlined"
        class="pa-4 rounded-lg"
        color="delete"
        elevation="0"
      >
        <strong>Note:</strong> You'll need to uninstall the Streaming Data
        Loader software from your machine before removing it here, otherwise
        your machine will re-register itself the next time it's scheduled to
        run.
      </v-card>
    </v-card-text>

    <v-card-text>
      Please type the orchestration system name (<strong>{{
        orchestrationSystem?.name
      }}</strong
      >) to confirm deletion:
      <v-form>
        <v-text-field
          class="pt-2"
          v-model="deleteInput"
          label="Orchestration system name"
          solo
          @keydown.enter.prevent="onDelete"
        ></v-text-field>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn-cancel @click="emit('close')">Cancel</v-btn-cancel>
      <v-btn-delete color="delete" @click="onDelete" :disabled="!canDelete">
        Delete
      </v-btn-delete>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { DataSource, OrchestrationSystem } from '@hydroserver/client'
import hs from '@hydroserver/client'
import { Snackbar } from '@/utils/notifications'
import { computed, ref } from 'vue'

const emit = defineEmits(['delete', 'close'])
const props = defineProps({
  orchestrationSystem: {
    type: Object as () => OrchestrationSystem,
    required: true,
  },
  dataSources: { type: Object as () => DataSource[], required: true },
})

const deleteInput = ref('')

const relatedSources = computed(() =>
  props.dataSources.filter(
    (ds) => ds.orchestrationSystem.id === props.orchestrationSystem.id
  )
)

const canDelete = computed(
  () =>
    relatedSources.value.length === 0 &&
    deleteInput.value.trim().toLowerCase() ===
      props.orchestrationSystem.name.toLowerCase()
)

const onDelete = async () => {
  if (
    deleteInput.value.toLowerCase() !==
    props.orchestrationSystem.name.toLowerCase()
  ) {
    Snackbar.warn('Name does not match.')
    return
  }
  if (relatedSources.value.length > 0) {
    Snackbar.warn(
      `Before you remove ${props.orchestrationSystem.name} as an orchestration system, you must delete all of its related data sources.`
    )
    return
  }

  try {
    await hs.orchestrationSystems.delete(props.orchestrationSystem.id)
    emit('delete')
  } catch (err: any) {
    console.error('Error deleting orchestration system', err)
    Snackbar.error(err.message)
  }
  emit('close')
}
</script>
