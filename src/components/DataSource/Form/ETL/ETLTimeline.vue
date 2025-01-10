<template>
  <v-timeline direction="horizontal" side="start">
    <v-timeline-item
      v-for="step in steps"
      :key="step.name"
      :dot-color="selectedETLStep === step.name ? step.color : 'grey'"
      :icon="step.icon"
      fill-dot
      style="cursor: pointer"
      @click="toggleETLProcess(step.name)"
    >
      <v-card>
        <v-card-title :class="['text-h6', `bg-${step.color}`]">
          {{ step.title }}
          <span>
            :
            <template v-if="step.name === 'extractor'">
              {{ extractorConfig.type }}
            </template>
            <template v-else-if="step.name === 'transformer'">
              {{ transformerConfig.type }}
            </template>
            <template v-else-if="step.name === 'loader'">
              {{ loaderConfig.type }}
            </template>
          </span>
        </v-card-title>
      </v-card>
    </v-timeline-item>
  </v-timeline>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { selectedETLStep, extractorConfig, transformerConfig, loaderConfig } =
  storeToRefs(useETLStore())

const steps = [
  {
    name: 'extractor',
    color: 'red-lighten-2',
    icon: 'mdi-database-export',
    title: 'Extractor',
  },
  {
    name: 'transformer',
    color: 'green-lighten-1',
    icon: 'mdi-table-pivot',
    title: 'Transformer',
  },
  {
    name: 'loader',
    color: 'indigo-lighten-2',
    icon: 'mdi-database-import',
    title: 'Loader',
  },
]

function toggleETLProcess(value: string) {
  selectedETLStep.value = selectedETLStep.value === value ? '' : value
}
</script>
