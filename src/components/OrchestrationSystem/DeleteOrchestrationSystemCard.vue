<template>
  <v-card>
    <v-toolbar flat color="red-darken-4">
      <v-card-title class="text-h5">
        <v-icon>mdi-alert</v-icon> Confirm orchestration system deletion
      </v-card-title>
    </v-toolbar>

    <v-card-text>
      Removing <strong> {{ orchestrationSystem.name }} </strong> as an
      orchestration system will also delete all associated data sources.
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
      <v-btn-delete color="delete" @click="onDelete"> Delete </v-btn-delete>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { OrchestrationSystem } from '@/models/dataSource'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { ref } from 'vue'

const emit = defineEmits(['delete', 'close'])
const props = defineProps({
  orchestrationSystem: {
    type: Object as () => OrchestrationSystem,
    required: true,
  },
})

const deleteInput = ref('')

const onDelete = async () => {
  if (
    deleteInput.value.toLowerCase() !==
    props.orchestrationSystem.name.toLowerCase()
  ) {
    Snackbar.warn('Name does not match.')
    return
  }

  try {
    await api.deleteOrchestrationSystem(props.orchestrationSystem.id)
    emit('delete')
  } catch (err: any) {
    console.error('Error deleting orchestration system', err)
    Snackbar.error(err.message)
  }
  emit('close')
}
</script>
