<template>
  <v-card-item>
    <v-card-title>Payload timestamp</v-card-title>
  </v-card-item>
  <v-card-text class="pb-0">
    <v-row>
      <v-col>
        <v-text-field
          v-model="transformer.timestamp.key"
          placeholder="timestamp"
          :label="timestampKeyLabel"
          density="compact"
          rounded="lg"
          :type="timestampInputType"
          prepend-inner-icon="mdi-table-column-width"
          :rules="timestampKeyRules"
        />
      </v-col>
    </v-row>
  </v-card-text>
  <v-card-text>
    <TimestampFormat :target="transformer.timestamp" color="green-darken-4" />
  </v-card-text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CSVTransformer, IdentifierType } from '@/models/dataSource'
import { storeToRefs } from 'pinia'
import { useETLStore } from '@/store/etl'
import { rules } from '@/utils/rules'
import TimestampFormat from './TimestampFormat.vue'

const { transformer } = storeToRefs(useETLStore())

const isCSV = (t?: any | null) => !!t && t.type === 'CSV'

const timestampKeyLabel = computed(() => {
  const t = transformer.value
  if (isCSV(t)) {
    return `Timestamp column ${
      (t as CSVTransformer).identifierType === IdentifierType.Name
        ? 'name'
        : 'index'
    } *`
  }
  return 'Timestamp key *'
})

const timestampInputType = computed(() => {
  if (isCSV(transformer.value)) {
    return (transformer.value as CSVTransformer).identifierType ===
      IdentifierType.Index
      ? 'number'
      : 'text'
  }
  return 'text'
})

const timestampKeyRules = computed(() => {
  const t = transformer.value
  if (isCSV(t)) {
    return (t as CSVTransformer).identifierType === IdentifierType.Name
      ? rules.requiredAndMaxLength150
      : rules.requiredNumber
  }
  return rules.requiredAndMaxLength150
})
</script>
