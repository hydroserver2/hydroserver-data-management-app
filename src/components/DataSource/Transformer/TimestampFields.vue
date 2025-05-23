<template>
  <v-card-item>
    <v-card-title>Payload timestamp</v-card-title>
  </v-card-item>
  <v-card-text>
    <v-row>
      <v-col>
        <v-text-field
          v-model="transformer.timestampKey"
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

    <v-row>
      <v-col class="pt-0">
        <v-radio-group v-model="timestampFormatType" label="Timestamp format">
          <v-radio
            label="UTC (YYYY-MM-DD hh:mm:ss)"
            value="utc"
            @click=";(transformer as CSVTransformer).timestampFormat = 'utc'"
          />
          <v-radio
            label="Constant Offset (YYYY-MM-DD hh:mm:ss; set offset)"
            value="constant"
            @click="
              ;(transformer as CSVTransformer).timestampFormat = 'constant'
            "
          />
          <v-radio
            label="Full ISO 8601 (YYYY-MM-DD hh:mm:ss.ssss+hh:mm)"
            value="ISO8601"
            @click="
              ;(transformer as CSVTransformer).timestampFormat = 'ISO8601'
            "
          />
          <v-radio label="Custom Format" value="custom" />
        </v-radio-group>
      </v-col>
    </v-row>

    <v-row class="mt-0" v-if="timestampFormatType === 'custom'">
      <v-col>
        <v-text-field
          v-model="(transformer as CSVTransformer).timestampFormat"
          :label="`Custom Timestamp Format *`"
          hint="Enter the timestamp format."
          :rules="timestampFormatType === 'custom' ? rules.required : []"
        >
          <template v-slot:append-inner>
            <v-btn
              size="lg"
              color="gray"
              icon="mdi-help-circle"
              @click="openStrftimeHelp"
            />
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-row v-if="timestampFormatType === 'constant'">
      <v-col>
        <v-autocomplete
          v-model="(transformer as CSVTransformer).timestampOffset"
          :label="`Timezone offset *`"
          hint="Enter an optional timezone offset to apply to the timestamp column."
          :items="TIMEZONE_OFFSETS"
        ></v-autocomplete>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  CSVTransformer,
  IdentifierType,
  TIMEZONE_OFFSETS,
} from '@/models/dataSource'
import { storeToRefs } from 'pinia'
import { useETLStore } from '@/store/etl'
import { rules } from '@/utils/rules'

const { transformer } = storeToRefs(useETLStore())

const CORE_FORMATS = ['utc', 'constant', 'ISO8601'] as const

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

const customFormatCache = ref('')
const savedFormat = (transformer.value as CSVTransformer).timestampFormat
if (savedFormat && !CORE_FORMATS.includes(savedFormat as any)) {
  customFormatCache.value = savedFormat
}

const timestampFormatType = computed({
  get() {
    const fmt = (transformer.value as CSVTransformer).timestampFormat ?? ''
    return CORE_FORMATS.includes(fmt as any) ? fmt : 'custom'
  },
  set(choice) {
    const t = transformer.value as CSVTransformer

    if (choice === 'custom') {
      t.timestampFormat = customFormatCache.value
    } else {
      if (!CORE_FORMATS.includes(t.timestampFormat as any)) {
        customFormatCache.value = t.timestampFormat
      }
      t.timestampFormat = choice
    }
  },
})

const openStrftimeHelp = () =>
  window.open('https://devhints.io/strftime', '_blank', 'noreferrer')
</script>
