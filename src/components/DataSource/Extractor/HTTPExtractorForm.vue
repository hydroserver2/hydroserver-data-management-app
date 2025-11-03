<template>
  <v-row align="center">
    <v-col cols="auto" class="pr-0">
      <v-card-item>
        <v-card-title> URL </v-card-title>
      </v-card-item>
    </v-col>
    <v-col class="pl-0">
      <v-icon
        :icon="mdiHelpCircleOutline"
        @click="showUrlHelp = !showUrlHelp"
        color="grey"
        small
      />
    </v-col>
  </v-row>

  <v-card-text v-if="showUrlHelp" class="pt-0">
    Specify the HTTP endpoint you’ll fetch your data from. This can be a plain
    URL or you can include placeholder variables in
    <code>{curlyBraces}</code> to make the URL dynamic:
    <ul class="ma-4">
      <li>
        <strong>Run-time variables</strong> (e.g. <code>{startTime}</code>) are
        computed when the job runs—ideal for “only fetch new data” scenarios.
      </li>
      <li>
        <strong>Per-payload variables</strong> (e.g. <code>{fileName}</code>)
        are supplied for each payload—great when you have many files to fetch
        from the same URL.
      </li>
    </ul>
    Once you’ve added at least one placeholder variable in your URL, a new “URL
    placeholder variables” section will appear below where you can configure
    each placeholder’s behavior.
  </v-card-text>

  <v-card-text>
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="httpExtractor.sourceUri"
          label="URL *"
          density="compact"
          rounded="lg"
          :prepend-inner-icon="mdiCodeBraces"
          :rules="rules.requiredAndNoSpaces"
        />
      </v-col>
    </v-row>
  </v-card-text>

  <v-card-item v-if="httpExtractor.placeholderVariables.length !== 0">
    <v-card-title> Placeholder variables </v-card-title>
  </v-card-item>
  <v-card-text>
    <v-row class="mb-2" v-for="variable in httpExtractor.placeholderVariables">
      <v-col cols="12" md="3">
        <v-chip
          variant="text"
          density="compact"
          :prepend-icon="mdiCodeBraces"
          class="ma-0"
        >
          {{ variable.name }}
        </v-chip>
      </v-col>

      <v-col cols="12" md="3">
        <v-radio-group v-model="variable.type" inline hide-details>
          <v-radio
            label="Define this variable per payload"
            value="perPayload"
          />
          <v-radio label="Fetch this variable at run-time" value="runTime" />
        </v-radio-group>
      </v-col>

      <v-col v-if="variable.type == 'runTime'">
        <v-select
          v-model="variable.runTimeValue"
          :items="runTimeOptions"
          label="Run-time source *"
          density="compact"
          rounded="lg"
          variant="outlined"
          :rules="rules.required"
          hide-details
          clearable
        />
        <div class="mt-8" v-if="variable.timestamp">
          <TimestampFormat
            :target="variable.timestamp"
            color="brown-darken-4"
          />
        </div>
      </v-col>
    </v-row>
  </v-card-text>
</template>

<script setup lang="ts">
import {
  HTTPExtractor,
  PlaceholderVariable,
  RunTimePlaceholder,
} from '@hydroserver/client'
import { useDataSourceStore } from '@/store/datasource'

import { rules } from '@/utils/rules'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import TimestampFormat from '../Timestamp/TimestampFormat.vue'
import { mdiCodeBraces, mdiHelpCircleOutline } from '@mdi/js'

const { extractor } = storeToRefs(useDataSourceStore())
const showUrlHelp = ref(false)

const runTimeOptions = [
  {
    title: 'Latest observation timestamp',
    value: 'latestObservationTimestamp',
  },
  { title: 'Job execution time', value: 'jobExecutionTime' },
]

const httpExtractor = computed<HTTPExtractor>({
  get: () => extractor.value as HTTPExtractor,
  set: (val: HTTPExtractor) => {
    extractor.value = val
  },
})

/**
 * Watch the sourceUri for any new or removed {variables}.
 * When {variable_name} is detected, we ensure it's in the placeholderVariables array.
 * Variables not found in the URL anymore are removed.
 */
watch(
  () => httpExtractor.value.sourceUri,
  (newTemplate) => {
    if (!newTemplate) {
      httpExtractor.value.placeholderVariables = []
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

    // Rebuild placeholderVariables so they remain in the correct order.
    const newVariables = matchedNames.map((name) => {
      const existingVar = httpExtractor.value.placeholderVariables.find(
        (v) => v.name === name
      )
      return existingVar
        ? existingVar
        : ({
            name,
            type: 'perPayload',
            runTimeValue: '',
          } as PlaceholderVariable)
    })

    httpExtractor.value.placeholderVariables = newVariables
  },
  { immediate: true }
)

// Whenever any variable flips to runTime, give it a default `timestamp`
// and when it flips back remove those fields
watch(
  () => httpExtractor.value.placeholderVariables.map((v) => v.type),
  () => {
    httpExtractor.value.placeholderVariables.forEach((v) => {
      if (v.type === 'runTime') {
        const rt = v as RunTimePlaceholder
        if (!rt.timestamp) {
          rt.runTimeValue = rt.runTimeValue || runTimeOptions[0].value
          rt.timestamp = {
            format: 'naive',
            timezoneMode: 'utc',
          }
        }
      } else {
        // strip runtime‐only props off perPayload ones
        if ('timestamp' in v) delete v.timestamp
      }
    })
  },
  { deep: true }
)
</script>
