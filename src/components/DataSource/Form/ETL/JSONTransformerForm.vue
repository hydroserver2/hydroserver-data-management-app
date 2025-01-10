<template>
  <v-row>
    <v-col cols="12">
      <v-card-title>JMESPath</v-card-title>
      <v-text-field
        v-model="transformerConfig.JMESPath"
        label="JMESPath"
        density="compact"
        rounded="lg"
        prepend-inner-icon="mdi-file-tree"
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { transformerConfig } = storeToRefs(useETLStore())
</script>
