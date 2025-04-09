<template>
  <v-row>
    <v-col>
      <v-card-item>
        <v-card-title>Payload structure</v-card-title>
      </v-card-item>
      <v-card-text>
        <v-row>
          <v-col>
            <v-radio-group
              class="mt-1"
              v-model="transformer.identifierType"
              inline
            >
              <v-radio
                label="Identify columns by name (recommended)"
                :value="IdentifierType.Name"
              />
              <v-radio
                label="Identify columns by index"
                :value="IdentifierType.Index"
                class="ml-2"
              />
            </v-radio-group>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              :disabled="transformer.identifierType === IdentifierType.Index"
              v-model.number="(transformer as CSVTransformer).headerRow"
              label="File header row number *"
              hint="Enter the line number of the row that contains file headers (1-based)."
              type="number"
              clearable
              :rules="[
                ...rules.greaterThan(0),
                ...rules.lessThan(
                  (transformer as CSVTransformer).dataStartRow,
                  'the data start row'
                ),
              ]"
            />
          </v-col>
          <v-col>
            <v-text-field
              v-model.number="(transformer as CSVTransformer).dataStartRow"
              label="Data start row number *"
              hint="Enter the line number of the row the data starts on (1-based)."
              type="number"
              :rules="[
                ...rules.greaterThan(0),
                ...rules.greaterThan(
                  (transformer as CSVTransformer).headerRow || 0,
                  'the file header row'
                ),
              ]"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-select
              v-model="(transformer as CSVTransformer).delimiter"
              label="File delimiter *"
              hint="Select the type of delimiter used for this data file."
              :items="CSV_DELIMITER_OPTIONS"
              variant="outlined"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-col>
    <v-col md="6">
      <v-card-item>
        <v-card-title>Payload timestamp</v-card-title>
      </v-card-item>
      <v-card-text>
        <v-row>
          <v-col>
            <v-text-field
              v-model="transformer.timestampKey"
              :label="`Timestamp column ${
                transformer.identifierType === IdentifierType.Name
                  ? 'name'
                  : 'index'
              } *`"
              density="compact"
              rounded="lg"
              :type="`${
                transformer.identifierType === IdentifierType.Name
                  ? 'text'
                  : 'number'
              }`"
              prepend-inner-icon="mdi-table-column-width"
              :rules="
                transformer.identifierType === IdentifierType.Name
                  ? rules.requiredAndMaxLength150
                  : rules.requiredNumber
              "
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col class="pt-0">
            <v-radio-group
              v-model="timestampFormatType"
              label="Timestamp format"
            >
              <v-radio
                label="UTC (YYYY-MM-DD hh:mm:ss)"
                value="utc"
                @click="
                  ;(transformer as CSVTransformer).timestampFormat = 'utc'
                "
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
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useETLStore } from '@/store/etl'
import { rules } from '@/utils/rules'
import {
  CSV_DELIMITER_OPTIONS,
  CSVTransformer,
  IdentifierType,
  TIMEZONE_OFFSETS,
} from '@/models/dataSource'

const { transformer } = storeToRefs(useETLStore())

const timestampFormatType = ref('ISO8601')

const openStrftimeHelp = () =>
  window.open('https://devhints.io/strftime', '_blank', 'noreferrer')

watch(
  () => transformer.value.identifierType,
  (newType) => {
    transformer.value.timestampKey =
      newType === IdentifierType.Name ? 'timestamp' : '1'
  },
  { immediate: true }
)
</script>
