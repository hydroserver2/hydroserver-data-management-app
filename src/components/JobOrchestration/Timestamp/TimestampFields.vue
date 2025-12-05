<template>
  <v-card-item>
    <v-card-title>Task timestamp</v-card-title>
  </v-card-item>
  <v-card-text class="pb-0">
    <v-row>
      <v-col>
        <v-text-field
          v-model="transformer.settings.timestamp.key"
          placeholder="timestamp"
          :label="timestampKeyLabel"
          density="compact"
          rounded="lg"
          :type="timestampInputType"
          :prepend-inner-icon="mdiTableColumnWidth"
          :rules="timestampKeyRules"
        />
      </v-col>
    </v-row>
  </v-card-text>
  <v-card-text>
    <TimestampFormat
      :target="transformer.settings.timestamp"
      color="green-darken-4"
    />
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CSVTransformer, IdentifierType } from '@hydroserver/client'
import { storeToRefs } from 'pinia'
import { useJobStore } from '@/store/job'

import { rules } from '@/utils/rules'
import TimestampFormat from './TimestampFormat.vue'
import { mdiTableColumnWidth } from '@mdi/js'

const { transformer } = storeToRefs(useJobStore())

const isCSV = (t?: any | null) => !!t && t.type === 'CSV'

const timestampKeyLabel = computed(() => {
  const t = transformer.value
  if (isCSV(t)) {
    return `Timestamp column ${
      (t as CSVTransformer).settings.identifierType === IdentifierType.Name
        ? 'name'
        : 'index'
    } *`
  }
  return 'Timestamp key *'
})

const timestampInputType = computed(() => {
  if (isCSV(transformer.value)) {
    return (transformer.value as CSVTransformer).settings.identifierType ===
      IdentifierType.Index
      ? 'number'
      : 'text'
  }
  return 'text'
})

const timestampKeyRules = computed(() => {
  const t = transformer.value
  if (isCSV(t)) {
    return (t as CSVTransformer).settings.identifierType === IdentifierType.Name
      ? rules.requiredAndMaxLength150
      : rules.requiredNumber
  }
  return rules.requiredAndMaxLength150
})
</script>
