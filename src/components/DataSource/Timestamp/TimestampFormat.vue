<template>
  <v-row>
    <v-col>
      <v-select
        v-model="timestampFormatType"
        :items="FORMAT_OPTIONS"
        item-title="text"
        item-value="value"
        label="Timestamp format"
      />
    </v-col>
  </v-row>

  <v-row class="mt-0" v-if="timestampFormatType === 'custom'">
    <v-col>
      <v-text-field
        v-model="target.timestampFormat"
        :label="`Custom timestamp format *`"
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
        v-model="target.timestampOffset"
        :label="`Timezone offset *`"
        hint="Enter an optional timezone offset to apply to the timestamp column."
        :items="TIMEZONE_OFFSETS"
      ></v-autocomplete>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { HasTimestamp, TIMEZONE_OFFSETS } from '@/models/timestamp'
import { rules } from '@/utils/rules'

const { target } = defineProps<{ target: HasTimestamp }>()

const FORMAT_OPTIONS = [
  { text: 'UTC (YYYY-MM-DD hh:mm:ss)', value: 'utc' },
  {
    text: 'Constant Offset (YYYY-MM-DD hh:mm:ss; set offset)',
    value: 'constant',
  },
  { text: 'Full ISO 8601 (YYYY-MM-DD hh:mm:ss.ssss+hh:mm)', value: 'ISO8601' },
  { text: 'Custom Format', value: 'custom' },
] as const

const CORE_FORMATS = FORMAT_OPTIONS.slice(0, 3).map((o) => o.value)
const customFormatCache = ref(target.timestampFormat)

const timestampFormatType = computed({
  get() {
    const fmt = target.timestampFormat ?? ''
    return CORE_FORMATS.includes(fmt as any) ? fmt : 'custom'
  },
  set(choice) {
    if (choice === 'custom') {
      target.timestampFormat = customFormatCache.value
    } else {
      if (!CORE_FORMATS.includes(target.timestampFormat as any)) {
        customFormatCache.value = target.timestampFormat
      }
      target.timestampFormat = choice
    }
  },
})

const openStrftimeHelp = () =>
  window.open('https://devhints.io/strftime', '_blank', 'noreferrer')
</script>
