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
      <div class="head">
        {{
          isAggregationTask
            ? 'Source datastream'
            : 'Source (CSV column name/index or JSON key)'
        }}
      </div>
      <div class="head">
        {{ isAggregationTask ? 'Aggregation statistic' : 'Data transformations' }}
      </div>
      <div class="head">
        {{ isAggregationTask ? 'Target datastream' : 'Target' }}
      </div>

      <template v-for="(m, mi) in task.mappings" :key="mi">
        <template v-for="(p, pi) in m.paths" :key="pi">
          <div class="cell source" :class="{ 'source-empty': pi !== 0 }">
            <template v-if="pi === 0" class="d-flex align-center w-100">
              <v-autocomplete
                v-if="isAggregationTask"
                v-model="m.sourceIdentifier"
                :items="workspaceDatastreamOptions"
                item-title="title"
                item-value="value"
                density="compact"
                label="Source datastream *"
                color="blue"
                :rules="rules.required"
              />
              <v-text-field
                v-else
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
            <v-select
              v-if="isAggregationTask"
              :model-value="getAggregationStatistic(p)"
              :items="aggregationStatisticOptions"
              item-title="title"
              item-value="value"
              label="Aggregation statistic *"
              density="compact"
              :rules="rules.required"
              @update:model-value="setAggregationStatistic(p, $event)"
            />

            <div v-else class="transform-row d-flex flex-wrap w-100">
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
                <v-icon
                  :icon="
                    t.type == 'expression' ? mdiFunctionVariant : mdiTableSearch
                  "
                  size="14"
                  class="mr-1"
                />
                {{
                  t.type === 'expression'
                    ? t.expression || 'expression()'
                    : getRatingCurveReference(t)
                    ? 'rating curve'
                    : 'select rating curve'
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
                <v-icon :icon="mdiPlusCircle" start />
                Add transformation
              </v-btn>
            </div>
          </div>

          <div class="cell d-flex align-center w-100">
            <template class="d-flex align-center w-100">
              <v-autocomplete
                v-if="isAggregationTask"
                v-model="p.targetIdentifier"
                :items="workspaceDatastreamOptions"
                item-title="title"
                item-value="value"
                label="Target datastream *"
                density="compact"
                :rules="rules.required"
              />

              <v-btn
                v-else-if="!p.targetIdentifier"
                size="small"
                variant="outlined"
                :color="hasTargetError(mi, pi) ? 'error' : 'green-lighten-1'"
                class="mr-4 target-selector-btn text-none"
                :class="{ 'target-selector-btn-error': hasTargetError(mi, pi) }"
                @click="openTargetSelector(mi, pi)"
                :prepend-icon="mdiImport"
              >
                Select target datastream
              </v-btn>

              <v-btn
                v-else
                size="small"
                variant="tonal"
                color="green-darken-2"
                class="mr-4 target-selector-btn target-selector-btn-selected text-none"
                :prepend-icon="mdiImport"
                @click="openTargetSelector(mi, pi)"
              >
                <span class="target-selector-content">
                  <span class="target-id">{{ String(p.targetIdentifier) }}</span>
                  <span class="target-name">
                    {{
                      linkedDatastreams.find((d) => d.id == p.targetIdentifier)
                        ?.name ||
                      draftDatastreams.find((d) => d.id == p.targetIdentifier)
                        ?.name
                    }}
                  </span>
                </span>
              </v-btn>

              <div
                v-if="!isAggregationTask && hasTargetError(mi, pi)"
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
                <v-icon :icon="mdiTrashCanOutline" size="18" />
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
            :prepend-icon="mdiTrashCanOutline"
          >
            Delete source
          </v-btn>

          <v-btn
            v-if="!isAggregationTask"
            size="small"
            :prepend-icon="mdiSourceBranch"
            variant="text"
            @click="onAddMapping"
          >
            Add source
          </v-btn>

          <v-btn-add
            v-if="!isAggregationTask"
            size="small"
            variant="text"
            @click="onAddPath(mi)"
          >
            Add target path
          </v-btn-add>
        </div>
        <v-divider
          v-if="mi < task.mappings.length - 1"
          class="mapping-actions"
        />
      </template>
    </div>

    <div class="mapping-actions" v-if="task.mappings.length === 0">
      <v-btn
        size="small"
        :prepend-icon="mdiSourceBranch"
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
      :workspace-id="resolvedWorkspaceId"
      @created="onCreateTransform"
      @updated="onUpdateTransform"
      @close="transformOpen = false"
    />
  </v-dialog>

  <v-dialog v-if="!isAggregationTask" v-model="datastreamSelectorOpen" width="75rem">
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
  Task,
} from '@hydroserver/client'
import DataTransformationForm from './DataTransformationForm.vue'
import { computed, ref, watch } from 'vue'
import DatastreamSelectorCard from '@/components/Datastream/DatastreamSelectorCard.vue'
import { storeToRefs } from 'pinia'
import { DatastreamExtended } from '@hydroserver/client'
import { rules } from '@/utils/rules'
import { VForm } from 'vuetify/components'
import {
  getRatingCurveReference,
  setRatingCurveReference,
} from '@/utils/orchestration/ratingCurve'
import {
  mdiFunctionVariant,
  mdiImport,
  mdiPlusCircle,
  mdiSourceBranch,
  mdiTableSearch,
  mdiTrashCanOutline,
} from '@mdi/js'
import { useOrchestrationStore } from '@/store/orchestration'

const task = defineModel<Task>('task', { required: true })
const props = defineProps<{
  workspaceId?: string | null
}>()
const { linkedDatastreams, draftDatastreams, workspaceDatastreams } = storeToRefs(
  useOrchestrationStore()
)
const isAggregationTask = computed(
  () => ((task.value as any)?.type ?? 'ETL') === 'Aggregation'
)
const aggregationStatisticOptions = [
  { title: 'Simple mean', value: 'simple_mean' },
  { title: 'Time-weighted daily mean', value: 'time_weighted_daily_mean' },
  { title: 'Last value of day', value: 'last_value_of_day' },
]
const workspaceDatastreamOptions = computed(() =>
  workspaceDatastreams.value.map((ds) => ({
    title: `${ds.name} (${ds.id})`,
    value: ds.id,
  }))
)
const resolvedWorkspaceId = computed(() => {
  return (
    props.workspaceId ||
    (task.value as any)?.workspaceId ||
    (task.value as any)?.workspace?.id ||
    null
  )
})

const localForm = ref<VForm>()
const isValid = ref(true)
const showErrors = ref(false)
const missingTargetKeys = ref<Set<string>>(new Set())
const noMappingsError = ref(false)

function hasTargetError(mi: number, pi: number) {
  return showErrors.value && missingTargetKeys.value.has(`${mi}:${pi}`)
}

function ensureAggregationTransformation(path: MappingPath): any {
  if (!Array.isArray(path.dataTransformations)) path.dataTransformations = []
  const existing = path.dataTransformations.find(
    (t: any) => t?.type === 'aggregation'
  ) as any
  const transform =
    existing ??
    ({
      type: 'aggregation',
      aggregationStatistic: 'simple_mean',
      timezoneMode: 'fixedOffset',
      timezone: '-0700',
    } as any)

  if (!existing) path.dataTransformations = [transform]
  return transform
}

function getAggregationStatistic(path: MappingPath) {
  return ensureAggregationTransformation(path).aggregationStatistic || 'simple_mean'
}

function setAggregationStatistic(path: MappingPath, value: string) {
  const transform = ensureAggregationTransformation(path)
  transform.aggregationStatistic = value || 'simple_mean'
  path.dataTransformations = [transform]
}

function enforceAggregationShape() {
  if (!isAggregationTask.value) return

  if (!task.value.mappings?.length) {
    task.value.mappings = [
      {
        sourceIdentifier: '',
        paths: [{ targetIdentifier: '', dataTransformations: [] }],
      } as Mapping,
    ]
  }

  if (task.value.mappings.length > 1) {
    task.value.mappings = [task.value.mappings[0]]
  }

  const mapping = task.value.mappings[0] as any
  if (!Array.isArray(mapping.paths) || mapping.paths.length === 0) {
    mapping.paths = [{ targetIdentifier: '', dataTransformations: [] }]
  }
  if (mapping.paths.length > 1) mapping.paths = [mapping.paths[0]]
  ensureAggregationTransformation(mapping.paths[0])
}

async function validate() {
  const vuetify = await localForm.value?.validate()
  let ok = (vuetify?.valid ?? isValid.value) === true

  showErrors.value = true
  noMappingsError.value = task.value.mappings.length === 0
  if (noMappingsError.value) ok = false

  if (isAggregationTask.value) {
    missingTargetKeys.value = new Set<string>()
    return ok
  }

  const nextMissingKeys = new Set<string>()

  task.value.mappings.forEach((m, mi) => {
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

if (task.value.mappings.length === 0) {
  onAddMapping()
}
enforceAggregationShape()

const transformOpen = ref(false)
const editingPath = ref<MappingPath | null>(null)
const editingTransform = ref<DataTransformation | null>(null)
const datastreamSelectorOpen = ref(false)
const activeMi = ref<number | null>(null)
const activePi = ref<number | null>(null)

function openTargetSelector(mi: number, pi: number) {
  if (isAggregationTask.value) return
  activeMi.value = mi
  activePi.value = pi
  datastreamSelectorOpen.value = true
}

function referencedTargetIds(): Set<string> {
  const ids = new Set<string>()
  for (const m of task.value.mappings) {
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
  const m = task.value.mappings[mi]
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
    delete (t as any).ratingCurveUrl
  } else {
    ;(t as any).type = 'rating_curve'
    setRatingCurveReference(t, getRatingCurveReference(updated))
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
  const mappings = task.value.mappings
  if (!Array.isArray(mappings) || mi < 0 || mi >= mappings.length) return
  mappings.splice(mi, 1)
  syncDraftDatastreams()
}

function removeMappingRow(mi: number, pi: number) {
  const mappings = task.value.mappings
  const m = mappings[mi]
  if (!m) return

  m.paths.splice(pi, 1)
  if (m.paths.length === 0) mappings.splice(mi, 1)
  syncDraftDatastreams()
}

function onAddPath(mi: number) {
  if (isAggregationTask.value) return
  const m = task.value.mappings[mi]
  if (!m) return
  if (!Array.isArray(m.paths)) (m as any).paths = []
  m.paths.push({
    targetIdentifier: '',
    dataTransformations: [],
  } as MappingPath)
}

function onAddMapping() {
  if (!task.value.mappings) (task.value as any).mappings = []
  if (isAggregationTask.value && task.value.mappings.length >= 1) return

  const newMapping: Mapping = {
    sourceIdentifier: '',
    paths: [
      {
        targetIdentifier: '',
        dataTransformations: [],
      },
    ],
  }

  if (isAggregationTask.value) {
    ensureAggregationTransformation(newMapping.paths[0])
  }
  task.value.mappings.push(newMapping)
}

watch(
  isAggregationTask,
  () => {
    enforceAggregationShape()
  },
  { immediate: true }
)
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

.target-selector-btn {
  max-width: calc(100% - 2.25rem);
  transition:
    transform 0.14s ease,
    box-shadow 0.14s ease,
    background-color 0.14s ease;
}

.target-selector-btn:hover,
.target-selector-btn:focus-visible {
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.14);
  transform: translateY(-1px);
}

.target-selector-btn-selected {
  justify-content: flex-start;
  min-width: 16rem;
}

.target-selector-content {
  align-items: center;
  display: inline-flex;
  gap: 0.4rem;
  max-width: 100%;
  overflow: hidden;
}

.target-id {
  font-weight: 600;
  white-space: nowrap;
}

.target-name {
  color: rgba(0, 0, 0, 0.66);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.target-selector-btn-error {
  box-shadow: 0 0 0 1px rgba(211, 47, 47, 0.3);
}
</style>
