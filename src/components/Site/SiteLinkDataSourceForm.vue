<template>
  <v-container>
    <v-card flat>
      <v-card-title>
        <span class="text-h5">
          {{ formTitle }}
        </span>
      </v-card-title>
      <v-card-item v-if="formLoaded === true">
        <v-row class="pa-2">
          <v-col class="v-col-xs-12 v-col-sm-6">
            <v-autocomplete
              v-model="selectedDataSource"
              label="Data Source"
              placeholder="No Linked Data Source"
              persistent-placeholder
              hint="Select the data source for this datastream."
              persistent-hint
              clearable
              :items="dataSources"
              item-title="name"
              @update:modelValue="handleUpdateDataSource"
            />
          </v-col>
          <v-col v-if="!selectedDataSource">
            <v-text-field
              label="Datastream Column"
              hint="Enter the column name/index containing values for this datastream."
              persistent-hint
              disabled
            />
          </v-col>
          <v-col v-else>
            <v-text-field
              ref="datastreamColumnName"
              v-model="selectedColumn"
              label="Datastream Column *"
              hint="Enter the column name/index containing values for this datastream."
              :type="selectedDataSource.headerRow === 0 ? 'number' : 'text'"
              :rules="[
                (val: string) => !!val || 'Must enter the column containing the datastream.'
              ]"
              persistent-hint
            />
          </v-col>
        </v-row>
      </v-card-item>
      <v-card-item v-else>
        <v-row>
          <v-col> LOADING... </v-col>
        </v-row>
      </v-card-item>
      <v-card-actions>
        <div class="text-subtitle-2">* indicates a required field.</div>
        <v-spacer></v-spacer>
        <v-btn-cancel @click="handleCancel"> Cancel </v-btn-cancel>
        <v-btn-primary :disabled="!savable" @click="handleSave">
          Save
        </v-btn-primary>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSiteLinkDataSourceFormStore } from '@/store/datasource_link'
import { storeToRefs } from 'pinia'

const props = defineProps(['thingId', 'datastreamId', 'dataSourceId', 'column'])
const emit = defineEmits(['closeDialog'])

const { saveDataSource, fetchDatastreams, fetchDataSources, fillForm } =
  useSiteLinkDataSourceFormStore()
const {
  formLoaded,
  dataSources,
  linkedDataSource,
  selectedDataSource,
  linkedColumn,
  selectedColumn,
  savable,
} = storeToRefs(useSiteLinkDataSourceFormStore())
const datastreamColumnName = ref()

formLoaded.value = false

fetchDatastreams(props.thingId, props.datastreamId).then((datastream) => {
  fillForm(
    props.datastreamId,
    datastream.dataSourceId,
    datastream.dataSourceColumn
  )
  fetchDataSources().then(() => {
    formLoaded.value = true
  })
})

let formTitle = props.dataSourceId
  ? 'Edit Linked Data Source'
  : 'Link Data Source'

function handleUpdateDataSource() {
  if (selectedDataSource.value === (linkedDataSource.value || {}).name) {
    selectedColumn.value = linkedColumn.value
  } else {
    selectedColumn.value = undefined
  }
}

async function handleSave() {
  let valid = []
  if (datastreamColumnName.value) {
    valid = await datastreamColumnName.value.validate()
  }
  if (valid.length === 0) {
    await saveDataSource()
    emit('closeDialog')
  }
}

function handleCancel() {
  emit('closeDialog')
}
</script>

<style scoped></style>
