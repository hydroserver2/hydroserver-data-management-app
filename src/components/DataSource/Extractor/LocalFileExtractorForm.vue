<template>
  <v-row>
    <v-col>
      <v-card-text>
        <v-text-field
          v-model="(extractor as LocalFileExtractor).path"
          label="Local file path *"
          hint="Enter the absolute path to the data source file."
          :rules="rules.requiredAndMaxLength255"
        />
      </v-card-text>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { LocalFileExtractor } from '@/models/dataSource'
import { rules } from '@/utils/rules'

const { extractor } = storeToRefs(useETLStore())
</script>
