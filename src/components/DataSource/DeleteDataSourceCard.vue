<template>
  <v-card>
    <v-toolbar flat color="red-darken-4">
      <v-card-title class="text-h5">
        <v-icon>mdi-alert</v-icon> Confirm data source deletion
      </v-card-title>
    </v-toolbar>

    <v-card-text>
      This action will permanently delete the datasource
      <strong> {{ itemName }} </strong>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn-cancel @click="emit('close')">Cancel</v-btn-cancel>
      <v-btn-delete color="red" @click="onDelete"> Delete </v-btn-delete>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
const emit = defineEmits(['delete', 'close'])
defineProps({ itemName: String })

const onDelete = () => {
  emit('delete')
  emit('close')
}
</script>
