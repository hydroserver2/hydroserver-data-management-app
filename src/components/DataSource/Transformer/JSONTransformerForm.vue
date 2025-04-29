<template>
  <v-card-text>
    <v-row>
      <v-col md="3">
        <v-text-field
          v-model="transformer.timestampKey"
          label="Timestamp key"
          density="compact"
          rounded="lg"
          prepend-inner-icon="mdi-table-column-width"
        />
      </v-col>
    </v-row>
    <v-row v-if="transformer.type === 'JSON'">
      <v-col cols="12">
        <v-card-item>
          <v-card-title>JMESPath</v-card-title>
        </v-card-item>
        <v-text-field
          v-model="transformer.JMESPath"
          label="JMESPath"
          density="compact"
          rounded="lg"
          prepend-inner-icon="mdi-file-tree"
        />
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { transformer } = storeToRefs(useETLStore())
</script>
