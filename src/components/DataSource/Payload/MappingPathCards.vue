<template>
  <v-card
    v-for="(p, pi) in mapping.paths"
    :key="pi"
    elevation="2"
    class="mb-4 mx-2"
  >
    <v-card-title class="py-2">
      <div class="d-flex align-center w-100">
        <div class="d-flex align-center">
          <v-icon size="16" class="mr-2">mdi-sign-direction</v-icon>
          <span class="text-subtitle-2">Path {{ pi + 1 }}</span>
        </div>
        <v-spacer />
        <v-btn
          variant="text"
          size="small"
          color="error"
          prepend-icon="mdi-trash-can-outline"
          @click="removePath(pi)"
        >
          Remove path
        </v-btn>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text class="pt-4">
      <v-row
        v-for="(t, ti) in p.dataTransformations"
        :key="ti"
        class="align-center mb-2"
      >
        <v-col cols="auto">
          <v-chip
            size="small"
            :color="t.type === 'expression' ? 'deep-purple' : 'teal'"
            variant="tonal"
          >
            <v-icon size="14" class="mr-1">
              {{
                t.type === 'expression'
                  ? 'mdi-function-variant'
                  : 'mdi-table-search'
              }}
            </v-icon>
            <span v-if="t.type === 'expression'">expression</span>
            <span v-else>lookup tbl.</span>
          </v-chip>
        </v-col>

        <v-col>
          <v-text-field
            v-if="t.type === 'expression'"
            v-model="t.expression"
            label="output ="
            placeholder="(x - 32) * 5/9"
            hide-details
          />

          <v-text-field
            v-else
            v-model="t.lookupTableId"
            placeholder="Lookup table id"
            hide-details
          />
        </v-col>

        <v-col cols="auto">
          <v-btn
            variant="text"
            prepend-icon="mdi-trash-can-outline"
            color="error"
            @click="removeTransform(p, ti)"
          >
            Remove transformation
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-menu>
          <template #activator="{ props: act }">
            <v-btn
              v-bind="act"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-plus"
              class="mx-3 my-2"
            >
              Add transform
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="addExpression(p)">
              <v-list-item-title>
                <v-icon size="16" class="mr-1">mdi-function-variant</v-icon>
                Expression
              </v-list-item-title>
            </v-list-item>
            <v-list-item @click="addLookup(p)">
              <v-list-item-title>
                <v-icon size="16" class="mr-1">mdi-table-search</v-icon>
                Lookup table
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-row>

      <v-row>
        <v-col cols="12" md="4">
          <DatastreamSelectAndDisplay
            button-name="Select target datastream"
            :datastream-id="String(p.targetIdentifier ?? '')"
            @update-selected-id="p.targetIdentifier = $event"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import DatastreamSelectAndDisplay from '@/components/Datastream/DatastreamSelectAndDisplay.vue'
import {
  MappingPath,
  ExpressionDataTransformation,
  LookupTableDataTransformation,
  Mapping,
} from '@hydroserver/client'

const mapping = defineModel<Mapping>('mapping', { required: true })

function addExpression(p: MappingPath) {
  const t: ExpressionDataTransformation = { type: 'expression', expression: '' }
  p.dataTransformations.push(t)
}

function addLookup(p: MappingPath) {
  const t: LookupTableDataTransformation = { type: 'lookup', lookupTableId: '' }
  p.dataTransformations.push(t)
}

function removeTransform(p: MappingPath, tIndex: number) {
  p.dataTransformations.splice(tIndex, 1)
}

function removePath(pathIndex: number) {
  mapping.value.paths.splice(pathIndex, 1)
  if (!mapping.value.paths.length)
    mapping.value.paths.push({ targetIdentifier: '', dataTransformations: [] })
}
</script>
