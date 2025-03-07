<template>
  <v-timeline direction="horizontal" side="start">
    <v-timeline-item
      v-for="step in steps"
      :key="step.name"
      :dot-color="step.color"
      :icon="step.icon"
      fill-dot
      style="cursor: pointer"
      @click="toggleETLProcess(step.name)"
    >
      <v-card :variant="selectedETLStep === step.name ? 'elevated' : 'flat'">
        <v-card-title :class="['text-header-6', `bg-${step.color}`]">
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
    color: 'brown',
    icon: 'mdi-database-export',
    title: 'Extractor',
  },
  {
    name: 'transformer',
    color: 'green',
    icon: 'mdi-table-pivot',
    title: 'Transformer',
  },
  {
    name: 'loader',
    color: 'blue-grey-darken-2',
    icon: 'mdi-database-import',
    title: 'Loader',
  },
]

function toggleETLProcess(value: string) {
  selectedETLStep.value = selectedETLStep.value === value ? '' : value
}
</script>
