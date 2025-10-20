<template>
  <v-timeline direction="horizontal" side="start">
    <v-timeline-item
      v-for="step in steps"
      :key="step.name"
      :dot-color="step.color"
      :icon="step.icon"
      fill-dot
      style="cursor: pointer"
      @click="selectETLStep(step.name)"
    >
      <v-card :variant="selectedETLStep === step.name ? 'elevated' : 'flat'">
        <v-card-title :class="['text-header-6', `bg-${step.color}`]">
          {{ step.title }}
          <span>
            :
            <template v-if="step.name === 'extractor'">
              {{ extractor.type }}
            </template>
            <template v-else-if="step.name === 'transformer'">
              {{ transformer.type }}
            </template>
            <template v-else-if="step.name === 'loader'">
              {{ loader.type }}
            </template>
          </span>
        </v-card-title>
      </v-card>
      <template #icon>
        <v-icon v-if="step.valid">{{ step.icon }}</v-icon>
        <v-badge v-else color="error" content="Incomplete section">
          <v-icon>{{ step.icon }}</v-icon>
        </v-badge>
      </template>
    </v-timeline-item>
  </v-timeline>
</template>

<script setup lang="ts">
import { ETLStep } from '@hydroserver/client'
import { useDataSourceStore } from '@/store/datasource'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const {
  selectedETLStep,
  extractor,
  transformer,
  loader,
  isExtractorValid,
  isTransformerValid,
  isLoaderValid,
} = storeToRefs(useDataSourceStore())

const steps = computed(() => [
  {
    name: 'extractor' as ETLStep,
    color: 'brown',
    icon: 'mdi-database-export',
    title: 'Extractor',
    valid: isExtractorValid.value,
  },
  {
    name: 'transformer' as ETLStep,
    color: 'green',
    icon: 'mdi-table-pivot',
    title: 'Transformer',
    valid: isTransformerValid.value,
  },
  {
    name: 'loader' as ETLStep,
    color: 'blue-grey-darken-2',
    icon: 'mdi-database-import',
    title: 'Loader',
    valid: isLoaderValid.value,
  },
])

function selectETLStep(newSelection: ETLStep) {
  selectedETLStep.value = newSelection
}
</script>
