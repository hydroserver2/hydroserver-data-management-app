<template>
  <v-card
    class="mx-4 mb-4"
    color="green-darken-4"
    variant="outlined"
    v-if="transformer.type === 'CSV'"
  >
    <v-toolbar title="Streaming Data Loader configurations" color="green" />

    <v-card-text>
      <h6 class="text-h6">Local file extractor</h6>
      <v-row>
        <v-col>
          <v-text-field
            v-model="(extractor as LocalFileExtractor).path"
            label="Local file path *"
            hint="Enter the absolute path to the data source file."
            :rules="rules.requiredAndMaxLength255"
          />
        </v-col>
      </v-row>

      <h6 class="text-h6">CSV transformer</h6>
      <v-row>
        <v-col md="3">
          <v-text-field
            v-model="transformer.timestampKey"
            label="Timestamp key *"
            density="compact"
            prepend-inner-icon="mdi-table-column-width"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col md="6">
          <v-radio-group v-model="timestampFormatType" inline>
            <v-radio
              label="ISO 8601 Format"
              @click="transformer.timestampFormat = 'ISO8601'"
            />
            <v-radio class="ml-2" label="Custom Format" value="custom" />
          </v-radio-group>
        </v-col>
      </v-row>
      <v-row class="mt-0">
        <v-col md="6">
          <v-text-field
            v-model="transformer.timestampFormat"
            :label="`Custom Timestamp Format *`"
            hint="Enter the timestamp format."
            :rules="timestampFormatType === 'custom' ? rules.required : []"
            :disabled="timestampFormatType !== 'custom'"
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

      <v-row>
        <v-col md="3">
          <v-text-field
            v-model.number="transformer.headerRow"
            label="File header row"
            hint="Enter the row that contains file headers, if any."
            type="number"
            clearable
            :rules="[
              ...rules.greaterThan(0),
              ...rules.lessThan(transformer.dataStartRow, 'the data start row'),
            ]"
          />
        </v-col>
        <v-col md="3">
          <v-text-field
            v-model.number="transformer.dataStartRow"
            label="Data start row *"
            hint="Enter the row that data starts on."
            type="number"
            :rules="[
              ...rules.greaterThan(0),
              ...rules.greaterThan(
                transformer.headerRow || 0,
                'the file header row'
              ),
            ]"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col md="3">
          <v-select
            v-model="transformer.delimiter"
            label="File delimiter *"
            hint="Select the type of delimiter used for this data file."
            :items="CSV_DELIMITER_OPTIONS"
            variant="outlined"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useETLStore } from '@/store/etl'
import { rules } from '@/utils/rules'
import { LocalFileExtractor, CSV_DELIMITER_OPTIONS } from '@/models/dataSource'

const { extractor, transformer } = storeToRefs(useETLStore())

const timestampFormatType = ref('ISO8601')

const openStrftimeHelp = () =>
  window.open('https://devhints.io/strftime', '_blank', 'noreferrer')
</script>
