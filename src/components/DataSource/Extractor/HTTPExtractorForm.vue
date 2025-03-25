<template>
  <v-row>
    <v-col cols="12">
      <v-card-title>URL template</v-card-title>
      <v-text-field
        v-model="httpExtractor.urlTemplate"
        label="URL template"
        density="compact"
        rounded="lg"
        prepend-inner-icon="mdi-code-braces"
      />
    </v-col>
  </v-row>

  <v-card-title v-if="httpExtractor.urlTemplateVariables.length !== 0"
    >URL template variables</v-card-title
  >
  <v-row class="mb-2" v-for="variable in httpExtractor.urlTemplateVariables">
    <!-- Variable Name -->
    <v-col cols="12" md="3">
      <v-text-field
        v-model="variable.name"
        label="Variable"
        density="compact"
        rounded="lg"
        prepend-inner-icon="mdi-code-braces"
        hide-details
        disabled
      />
    </v-col>

    <!-- Is Dynamic? -->
    <v-col cols="12" md="3">
      <v-checkbox
        v-model="variable.isDynamic"
        color="primary"
        label="Value is dynamic"
        hide-details
      />
    </v-col>

    <!-- Dynamic Value -->
    <v-col cols="12" md="4" v-if="variable.isDynamic">
      <v-select
        v-model="variable.dynamicValue"
        :items="dynamicVariables"
        label="Dynamic Value"
        density="compact"
        rounded="lg"
        variant="outlined"
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { HTTPExtractor } from '@/models/dataSource'
import { useETLStore } from '@/store/etl'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'

const { extractor } = storeToRefs(useETLStore())

const dynamicVariables = ['Loader.start_time', 'Loader.end_time', 'Now']

const httpExtractor = computed<HTTPExtractor>({
  get: () => extractor.value as HTTPExtractor,
  set: (val: HTTPExtractor) => {
    extractor.value = val
  },
})

/**
 * Watch the urlTemplate for any new or removed {variables}.
 * When {variable_name} is detected, we ensure it's in the urlTemplateVariables array.
 * Variables not found in the URL anymore are removed.
 */
watch(
  () => httpExtractor.value.urlTemplate,
  (newTemplate) => {
    if (!newTemplate) {
      httpExtractor.value.urlTemplateVariables = []
      return
    }

    // This pattern will capture variables inside {}s, EXCLUDING '{}' characters.
    // The user will create invalid expressions while typing, but we want
    // valid variables to persist. For example, if we have {one}{two}{four}
    // and the user starts typing {three} as {one}{two}{{four}, we don't want to
    // replace "four" with "{four" as the user types.
    const pattern = /\{([^{}]+)\}/g
    const matchedNames: string[] = []
    let match

    while ((match = pattern.exec(newTemplate)) !== null) {
      matchedNames.push(match[1])
    }

    // Rebuild urlTemplateVariables so they remain in the correct order.
    const newVariables = matchedNames.map((name) => {
      const existingVar = httpExtractor.value.urlTemplateVariables.find(
        (v) => v.name === name
      )
      return existingVar
        ? existingVar
        : {
            name,
            isDynamic: false,
            dynamicValue: '',
          }
    })

    httpExtractor.value.urlTemplateVariables = newVariables
  }
)
</script>
