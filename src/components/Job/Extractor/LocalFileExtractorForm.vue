<template>
  <v-row>
    <v-col>
      <v-card-text>
        <v-text-field
          v-model="(extractor as LocalFileExtractor).settings.sourceUri"
          label="Local file path *"
          hint="Enter the absolute path to the job file."
          :rules="rules.requiredAndMaxLength255"
        />
      </v-card-text>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useJobStore } from '@/store/job'

import { storeToRefs } from 'pinia'
import { LocalFileExtractor } from '@hydroserver/client'
import { rules } from '@/utils/rules'

const { extractor } = storeToRefs(useJobStore())
</script>
