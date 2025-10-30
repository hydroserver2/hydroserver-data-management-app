<template>
  <v-form ref="localForm" v-model="isValid" validate-on="input">
    <v-alert
      v-if="showErrors && noMappingsError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
    >
      At least one source target mapping is required.
    </v-alert>
    <div class="swimlanes">
      <div class="head">Source (CSV column name/index or JSON key)</div>
      <div class="head">Data transformations</div>
      <div class="head">Target</div>

      <template v-for="(m, mi) in payload.mappings" :key="mi">
        <template v-for="(p, pi) in m.paths" :key="pi">
          <div class="cell source" :class="{ 'source-empty': pi !== 0 }">
            <template v-if="pi === 0" class="d-flex align-center w-100">
              <v-text-field
                v-model="m.sourceIdentifier"
                placeholder="e.g., water_level_ft"
                density="compact"
                label="Source *"
                color="blue"
                :rules="rules.requiredAndMaxLength150"
              />
            </template>
          </div>

          <div class="cell transforms">
            <div class="transform-row d-flex flex-wrap w-100">
              <v-chip
                v-if="!p.dataTransformations?.length"
                size="small"
                variant="tonal"
                color="grey"
              >
                no transform
              </v-chip>
              <v-chip
                v-for="t in p.dataTransformations"
                :key="tKey(t)"
                size="small"
                :color="t.type === 'expression' ? 'deep-purple' : 'teal'"
                variant="tonal"
                rounded="xl"
                closable
                @click.stop="openTransformEditor(p, t)"
                @click:close.stop="removeTransformObj(p, t)"
              >
                <v-icon size="14" class="mr-1">
                  {{
                    t.type === 'expression'
                      ? 'mdi-function-variant'
                      : 'mdi-table-search'
                  }}
                </v-icon>
                {{
                  t.type === 'expression'
                    ? t.expression || 'expression()'
                    : `lookup: ${t.lookupTableId ?? 'select table'}`
                }}
              </v-chip>

              <v-spacer />

              <v-btn
                variant="text"
                size="small"
                color="green-darken-2"
                class="ms-auto"
                @click="openNewTransform(p)"
              >
                <v-icon start>mdi-plus-circle</v-icon>
                Add transformation
              </v-btn>
            </div>
          </div>

          <div class="cell d-flex align-center w-100">
            <template class="d-flex align-center w-100">
              <v-chip
                v-if="!p.targetIdentifier"
                size="small"
                :color="hasTargetError(mi, pi) ? 'error' : 'green-lighten-1'"
                class="mr-4"
                :class="{ 'chip-error': hasTargetError(mi, pi) }"
                variant="outlined"
                @click="openTargetSelector(mi, pi)"
                prepend-icon="mdi-import"
                >Select target datastream
              </v-chip>
              <v-chip v-else class="text-caption">
                <span
                  @click="openTargetSelector(mi, pi)"
                  class="font-weight-medium"
                  >{{ String(p.targetIdentifier) }}</span
                >&nbsp;&ndash;&nbsp;
                <span class="text-medium-emphasis">
                  {{
                    linkedDatastreams.find((d) => d.id == p.targetIdentifier)
                      ?.name ||
                    draftDatastreams.find((d) => d.id == p.targetIdentifier)
                      ?.name
                  }}
                </span>
              </v-chip>
              <div
                v-if="hasTargetError(mi, pi)"
                class="text-error text-caption mt-1"
              >
                Target is required
              </div>

              <v-btn
                icon
                variant="text"
                color="red-darken-3"
                class="ms-auto"
                title="Remove target path"
                @click="removeMappingRow(mi, pi)"
              >
                <v-icon size="18">mdi-trash-can-outline</v-icon>
              </v-btn>
            </template>
          </div>
        </template>
        <div class="mapping-actions">
          <v-btn
            size="small"
            variant="text"
            color="red-darken-3"
            :title="`Remove mapping`"
            @click.stop="removeMapping(mi)"
            prepend-icon="mdi-trash-can-outline"
          >
            Delete source
          </v-btn>

          <v-btn
            size="small"
            prepend-icon="mdi-source-branch"
            variant="text"
            @click="onAddMapping"
          >
            Add source
          </v-btn>

          <v-btn-add size="small" variant="text" @click="onAddPath(mi)">
            Add target path
          </v-btn-add>
        </div>
        <v-divider
          v-if="mi < payload.mappings.length - 1"
          class="mapping-actions"
        />
      </template>
    </div>

    <div class="mapping-actions" v-if="payload.mappings.length === 0">
      <v-btn
        size="small"
        prepend-icon="mdi-source-branch"
        variant="text"
        @click="onAddMapping"
      >
        Add source
      </v-btn>
    </div>
  </v-form>

  <v-dialog v-model="transformOpen" width="40rem">
    <DataTransformationForm
      :transformation="editingTransform || undefined"
      @created="onCreateTransform"
      @updated="onUpdateTransform"
      @close="transformOpen = false"
    />
  </v-dialog>

  <v-dialog v-model="datastreamSelectorOpen" width="75rem">
    <DatastreamSelectorCard
      card-title="Select a target datastream"
      @selected-datastream="onTargetSelected"
      @close="datastreamSelectorOpen = false"
      enforce-unique-selections
      :draft-datastreams="draftDatastreams"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import type {
  DataTransformation,
  Mapping,
  MappingPath,
  Payload,
} from '@hydroserver/client'
import DataTransformationForm from './DataTransformationForm.vue'
import { ref } from 'vue'
import DatastreamSelectorCard from '@/components/Datastream/DatastreamSelectorCard.vue'
import { storeToRefs } from 'pinia'
import { useDataSourceStore } from '@/store/datasource'
import { DatastreamExtended } from '@hydroserver/client'
import { rules } from '@/utils/rules'
import { VForm } from 'vuetify/components'

const payload = defineModel<Payload>('payload', { required: true })
const { linkedDatastreams, draftDatastreams } = storeToRefs(
  useDataSourceStore()
)

const localForm = ref<VForm>()
const isValid = ref(true)
const showErrors = ref(false)
const missingTargetKeys = ref<Set<string>>(new Set())
const noMappingsError = ref(false)

function hasTargetError(mi: number, pi: number) {
  return showErrors.value && missingTargetKeys.value.has(`${mi}:${pi}`)
}

async function validate() {
  const vuetify = await localForm.value?.validate()
  let ok = (vuetify?.valid ?? isValid.value) === true

  showErrors.value = true
  noMappingsError.value = payload.value.mappings.length === 0
  if (noMappingsError.value) ok = false

  const nextMissingKeys = new Set<string>()

  payload.value.mappings.forEach((m, mi) => {
    const hasAnyTarget =
      Array.isArray(m.paths) && m.paths.some((p) => !!p.targetIdentifier)
    if (!hasAnyTarget) ok = false

    m.paths?.forEach((p, pi) => {
      if (!p.targetIdentifier) nextMissingKeys.add(`${mi}:${pi}`)
    })
  })

  missingTargetKeys.value = nextMissingKeys
  return ok
}

defineExpose({ validate })

if (payload.value.mappings.length === 0) {
  onAddMapping()
}

const transformOpen = ref(false)
const editingPath = ref<MappingPath | null>(null)
const editingTransform = ref<DataTransformation | null>(null)
const datastreamSelectorOpen = ref(false)
const activeMi = ref<number | null>(null)
const activePi = ref<number | null>(null)

function openTargetSelector(mi: number, pi: number) {
  activeMi.value = mi
  activePi.value = pi
  datastreamSelectorOpen.value = true
}

function referencedTargetIds(): Set<string> {
  const ids = new Set<string>()
  for (const m of payload.value.mappings) {
    for (const p of m.paths) {
      const id = p.targetIdentifier
      if (id !== undefined && id !== null && String(id) !== '') {
        ids.add(String(id))
      }
    }
  }
  return ids
}

function syncDraftDatastreams() {
  const refIds = referencedTargetIds()
  const linkedIds = new Set(linkedDatastreams.value.map((d) => String(d.id)))
  const keepIds = new Set([...refIds].filter((id) => !linkedIds.has(id)))

  const byId = new Map<string, DatastreamExtended>()
  for (const ds of draftDatastreams.value) {
    const key = String(ds.id)
    if (keepIds.has(key) && !byId.has(key)) byId.set(key, ds)
  }

  draftDatastreams.value = [...byId.values()]
}

function openNewTransform(p: MappingPath) {
  if (!p.dataTransformations) p.dataTransformations = []
  editingPath.value = p
  editingTransform.value = null
  transformOpen.value = true
}

function openTransformEditor(p: MappingPath, t: DataTransformation) {
  editingPath.value = p
  editingTransform.value = t
  transformOpen.value = true
}

function onCreateTransform(created: DataTransformation) {
  if (!editingPath.value) return
  editingPath.value.dataTransformations.push(created)
  transformOpen.value = false
}

function onTargetSelected(event: DatastreamExtended) {
  const mi = activeMi.value,
    pi = activePi.value
  if (mi == null || pi == null) return
  const m = payload.value.mappings[mi]
  const p = m?.paths?.[pi]

  p.targetIdentifier = event.id
  draftDatastreams.value = [event, ...draftDatastreams.value]
  syncDraftDatastreams()

  // remove only this row’s error
  const key = `${mi}:${pi}`
  if (missingTargetKeys.value.has(key)) {
    const next = new Set(missingTargetKeys.value)
    next.delete(key)
    missingTargetKeys.value = next
  }

  activeMi.value = activePi.value = null
}

function onUpdateTransform(updated: DataTransformation) {
  const t = editingTransform.value
  if (!t) return
  if (updated.type === 'expression') {
    ;(t as any).type = 'expression'
    ;(t as any).expression = updated.expression
    delete (t as any).lookupTableId
  } else {
    ;(t as any).type = 'lookup'
    ;(t as any).lookupTableId = updated.lookupTableId
    delete (t as any).expression
  }
  transformOpen.value = false
}

const _tKeys = new WeakMap<object, string>()
function tKey(t: DataTransformation): string {
  let k = _tKeys.get(t as object)
  if (!k) {
    k = crypto.randomUUID()
    _tKeys.set(t as object, k)
  }
  return k
}

function removeTransformObj(p: MappingPath, t: DataTransformation) {
  const arr = p.dataTransformations
  if (!arr) return
  const i = arr.indexOf(t) // remove by object identity
  if (i !== -1) arr.splice(i, 1)
}

function removeMapping(mi: number) {
  const mappings = payload.value.mappings
  if (!Array.isArray(mappings) || mi < 0 || mi >= mappings.length) return
  mappings.splice(mi, 1)
  syncDraftDatastreams()
}

function removeMappingRow(mi: number, pi: number) {
  const mappings = payload.value.mappings
  const m = mappings[mi]
  if (!m) return

  m.paths.splice(pi, 1)
  if (m.paths.length === 0) mappings.splice(mi, 1)
  syncDraftDatastreams()
}

function onAddPath(mi: number) {
  const m = payload.value.mappings[mi]
  if (!m) return
  if (!Array.isArray(m.paths)) (m as any).paths = []
  m.paths.push({
    targetIdentifier: '',
    dataTransformations: [],
  } as MappingPath)
}

function onAddMapping() {
  if (!payload.value.mappings) (payload.value as any).mappings = []

  const newMapping: Mapping = {
    sourceIdentifier: '',
    paths: [
      {
        targetIdentifier: '',
        dataTransformations: [],
      },
    ],
  }

  payload.value.mappings.push(newMapping)
}
</script>

<style scoped>
.swimlanes {
  display: grid;
  grid-template-columns: 1fr 2fr 2fr;
  column-gap: 12px;
  row-gap: 8px;
  margin-bottom: 12px;
}
.head {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  padding-bottom: 6px;
}
.cell {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 6px 8px;
  min-height: 34px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.source {
  background: transparent;
  border: none;
  padding-left: 0;
}
.source-empty {
  min-height: 0;
}
.transforms.trunk {
  position: relative;
}
.transform-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.mapping-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  grid-column: 1 / -1; /* make the action row span all 3 columns */
  margin-top: 4px;
}
</style>
