<template>
  <div class="mx-4">
    <ETLTimeline />
    <ExtractorForm v-if="selectedETLStep === 'extractor'" />
    <TransformerForm v-else-if="selectedETLStep === 'transformer'" />
    <LoaderForm v-else-if="selectedETLStep === 'loader'" />
  </div>
</template>

<script setup lang="ts">
import ETLTimeline from './ETLTimeline.vue'
import ExtractorForm from './ExtractorForm.vue'
import TransformerForm from './TransformerForm.vue'
import LoaderForm from './LoaderForm.vue'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'

const { selectedETLStep } = storeToRefs(useETLStore())
</script>
