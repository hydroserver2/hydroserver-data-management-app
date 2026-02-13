<template>
  <v-card>
    <v-toolbar :color="local.type === 'expression' ? 'deep-purple' : 'teal'">
      <v-card-title
        >{{ isEdit ? 'Edit' : 'Add' }} data transformation</v-card-title
      >
    </v-toolbar>
    <v-divider />

    <v-form
      ref="myForm"
      v-model="valid"
      validate-on="input"
      @submit.prevent="onSubmit"
    >
      <v-card-text>
        <v-radio-group v-model="local.type" inline>
          <v-radio label="Expression" value="expression" />
          <v-radio label="Rating curve" value="rating_curve" />
        </v-radio-group>

        <template v-if="local.type === 'expression'">
          <v-alert
            color="deep-purple"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-6"
          >
            Apply an expression to each incoming data point independently. Enter
            a single-line Python expression using
            <code>x</code> for the incoming value.
            <div class="mt-4">
              For example, if you wanted a unit conversion from degrees
              Fahrenheit (deg F) to Celsius (deg C), you'd type in '(x - 32) *
              5/9'.
            </div>
            <div class="mt-4">
              <strong>Allowed operators:</strong>
              <span class="d-inline-flex flex-wrap ml-2">
                <v-chip
                  v-for="op in ALLOWED_OPS"
                  :key="op"
                  size="small"
                  variant="tonal"
                  class="mr-1 mb-1"
                >
                  {{ op }}
                </v-chip>
              </span>
            </div>
          </v-alert>

          <v-text-field
            v-model="local.expression"
            label="Output = *"
            placeholder="eg. (x - 32) * 5/9"
            :rules="[
              ...rules.required,
              exprContainsX,
              exprAllowedTokens,
              exprBalancedParens,
            ]"
            auto-grow
          />
        </template>

        <template v-else>
          <v-alert
            color="teal"
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            Select the site (Thing) first, then choose one of that site's rating
            curve files.
          </v-alert>

          <template v-if="canSelectThing">
            <v-autocomplete
              v-model="selectedThingId"
              :items="thingOptions"
              item-title="title"
              item-value="value"
              label="Thing *"
              clearable
              :loading="thingsLoading"
              :rules="rules.required"
              class="mb-3"
              @update:model-value="onThingSelected"
            />

            <v-select
              v-model="selectedAttachmentId"
              :items="attachmentOptions"
              item-title="title"
              item-value="value"
              label="Select rating curve *"
              clearable
              :disabled="!selectedThingId"
              :loading="attachmentsLoading"
              :rules="rules.required"
              class="mb-2"
              @update:model-value="onAttachmentSelected"
            />

            <div
              v-if="selectedThingId && !attachmentsLoading && !attachmentOptions.length"
              class="text-caption text-medium-emphasis mb-3"
            >
              No rating curves found for this site.
            </div>

            <v-alert
              v-if="previewError"
              type="warning"
              variant="tonal"
              density="compact"
              class="mb-2"
            >
              {{ previewError }}
            </v-alert>

            <div v-if="selectedAttachment" class="mb-4">
              <div class="d-flex align-center mb-2">
                <span class="text-subtitle-2">Preview</span>
              </div>

              <div v-if="previewCurvePoints.length" class="rating-curve-preview">
                <svg
                  class="rating-curve-preview-svg"
                  :viewBox="`0 0 ${PREVIEW_SVG_WIDTH} ${PREVIEW_SVG_HEIGHT}`"
                  preserveAspectRatio="none"
                >
                  <path
                    v-if="previewSparklinePath"
                    class="rating-curve-line"
                    :d="previewSparklinePath"
                    fill="none"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
              <div
                v-if="previewRanges"
                class="text-caption text-medium-emphasis mt-1"
              >
                Showing {{ previewCurvePoints.length }} numeric points. x:
                {{ formatPreviewNumber(previewRanges.xMin) }} to
                {{ formatPreviewNumber(previewRanges.xMax) }}. y:
                {{ formatPreviewNumber(previewRanges.yMin) }} to
                {{ formatPreviewNumber(previewRanges.yMax) }}.
              </div>
              <div v-else class="text-caption text-medium-emphasis">
                No numeric preview rows available.
              </div>
            </div>
          </template>

          <v-alert v-else type="info" variant="tonal" density="compact">
            Select a workspace to choose a Thing and rating curve.
          </v-alert>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer />
        <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
        <v-btn-primary type="submit">{{
          isEdit ? 'Update' : 'Save'
        }}</v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { VForm } from 'vuetify/components'
import hs, {
  RATING_CURVE_ATTACHMENT_TYPE,
  type DataTransformation,
  type Thing,
  type ThingFileAttachment,
  type RatingCurvePreviewRow,
} from '@hydroserver/client'

import { rules } from '@/utils/rules'
import { Snackbar } from '@/utils/notifications'
import {
  getRatingCurveReference,
  setRatingCurveReference,
} from '@/utils/orchestration/ratingCurve'

const props = defineProps<{
  transformation?: DataTransformation
  workspaceId?: string | null
}>()

const emit = defineEmits<{
  (e: 'created', t: DataTransformation): void
  (e: 'updated', t: DataTransformation): void
  (e: 'close'): void
}>()

type ExpressionTransformationDraft = {
  type: 'expression'
  expression: string
}

type RatingCurveTransformationDraft = {
  type: 'rating_curve'
  ratingCurveUrl: string
}

type LocalTransformationDraft =
  | ExpressionTransformationDraft
  | RatingCurveTransformationDraft

const ALLOWED_OPS = ['+', '-', '*', '/', '**', '(', ')']
const isEdit = computed(() => !!props.transformation)
const canSelectThing = computed(() => !!props.workspaceId)

function makeInitial(): LocalTransformationDraft {
  if (props.transformation?.type === 'expression') {
    return {
      type: 'expression',
      expression: props.transformation.expression ?? '',
    }
  }

  if (props.transformation?.type === 'rating_curve') {
    return {
      type: 'rating_curve',
      ratingCurveUrl: getRatingCurveReference(props.transformation),
    }
  }

  return { type: 'expression', expression: '' }
}

const local = ref<LocalTransformationDraft>(makeInitial())
const valid = ref<boolean | null>(null)
const myForm = ref<VForm>()

const things = ref<Thing[]>([])
const thingsLoading = ref(false)
const selectedThingId = ref<string | null>(null)

const attachments = ref<ThingFileAttachment[]>([])
const attachmentsLoading = ref(false)
const selectedAttachmentId = ref<string | number | null>(null)

const previewRows = ref<RatingCurvePreviewRow[]>([])
const previewError = ref('')
const PREVIEW_SVG_WIDTH = 320
const PREVIEW_SVG_HEIGHT = 120

const thingOptions = computed(() =>
  things.value.map((thing) => ({
    title: thing.name,
    value: thing.id,
  }))
)

const attachmentOptions = computed(() =>
  attachments.value.map((attachment) => ({
    title: attachment.description
      ? `${attachment.name} - ${attachment.description}`
      : attachment.name,
    value: attachment.id,
  }))
)

const selectedAttachment = computed(() =>
  attachments.value.find(
    (attachment) => String(attachment.id) === String(selectedAttachmentId.value)
  )
)

type RatingCurvePoint = { x: number; y: number }
type RatingCurveRange = { xMin: number; xMax: number; yMin: number; yMax: number }

const previewCurvePoints = computed<RatingCurvePoint[]>(() =>
  previewRows.value
    .map((row) => ({
      x: Number(row.inputValue),
      y: Number(row.outputValue),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
    .sort((a, b) => a.x - b.x)
)

const previewRanges = computed<RatingCurveRange | null>(() => {
  if (!previewCurvePoints.value.length) return null

  let xMin = previewCurvePoints.value[0].x
  let xMax = previewCurvePoints.value[0].x
  let yMin = previewCurvePoints.value[0].y
  let yMax = previewCurvePoints.value[0].y

  for (const point of previewCurvePoints.value) {
    if (point.x < xMin) xMin = point.x
    if (point.x > xMax) xMax = point.x
    if (point.y < yMin) yMin = point.y
    if (point.y > yMax) yMax = point.y
  }

  if (xMin === xMax) {
    const xDelta = Math.abs(xMin || 1) * 0.1
    xMin -= xDelta
    xMax += xDelta
  }
  if (yMin === yMax) {
    const yDelta = Math.abs(yMin || 1) * 0.1
    yMin -= yDelta
    yMax += yDelta
  }

  return { xMin, xMax, yMin, yMax }
})

const previewSparklinePath = computed(() =>
  buildSparklinePath(
    previewCurvePoints.value,
    previewRanges.value,
    PREVIEW_SVG_WIDTH,
    PREVIEW_SVG_HEIGHT
  )
)

function extractThingIdFromRatingCurveUrl(reference: string): string | null {
  if (!reference) return null

  try {
    const parsed = new URL(reference, globalThis.location?.origin ?? undefined)
    const pathSegments = parsed.pathname.split('/').filter(Boolean)
    if (pathSegments.length < 5) return null
    if (pathSegments[pathSegments.length - 5] !== 'things') return null
    if (pathSegments[pathSegments.length - 3] !== 'file-attachments') return null
    if (pathSegments[pathSegments.length - 1] !== 'download') return null

    return pathSegments[pathSegments.length - 4] ?? null
  } catch {
    return null
  }
}

function clearRatingCurveSelection() {
  selectedAttachmentId.value = null
  attachments.value = []
  previewRows.value = []
  previewError.value = ''
  if (local.value.type === 'rating_curve') {
    setRatingCurveReference(local.value, '')
  }
}

function syncSelectedThingWithReference() {
  if (local.value.type !== 'rating_curve') {
    selectedThingId.value = null
    return
  }

  const thingIdFromReference = extractThingIdFromRatingCurveUrl(
    getRatingCurveReference(local.value)
  )

  if (
    thingIdFromReference &&
    things.value.some((thing) => String(thing.id) === thingIdFromReference)
  ) {
    selectedThingId.value = thingIdFromReference
  }
}

function syncSelectedAttachmentWithReference() {
  if (local.value.type !== 'rating_curve') {
    selectedAttachmentId.value = null
    return
  }

  const currentReference = getRatingCurveReference(local.value)
  const selected = attachments.value.find(
    (attachment) => attachment.link === currentReference
  )

  selectedAttachmentId.value = selected?.id ?? null
}

async function loadThings() {
  if (!props.workspaceId) {
    things.value = []
    selectedThingId.value = null
    clearRatingCurveSelection()
    return
  }

  thingsLoading.value = true
  try {
    things.value = await hs.things.listAllItems({
      workspace_id: [props.workspaceId],
      order_by: ['name'],
    })

    syncSelectedThingWithReference()

    if (selectedThingId.value) {
      await loadAttachmentsForThing(selectedThingId.value)
    }
  } catch (error: any) {
    Snackbar.error(error?.message || 'Unable to load Things.')
  } finally {
    thingsLoading.value = false
  }
}

async function loadAttachmentsForThing(thingId: string) {
  attachmentsLoading.value = true
  previewRows.value = []
  previewError.value = ''

  try {
    attachments.value = await hs.thingFileAttachments.listItems(thingId, {
      type: RATING_CURVE_ATTACHMENT_TYPE,
    })
    syncSelectedAttachmentWithReference()
  } catch (error: any) {
    attachments.value = []
    selectedAttachmentId.value = null
    Snackbar.error(error?.message || 'Unable to load rating curves.')
  } finally {
    attachmentsLoading.value = false
  }
}

function onThingSelected(thingId: string | null) {
  selectedThingId.value = thingId
  clearRatingCurveSelection()

  if (!thingId || local.value.type !== 'rating_curve') return
  void loadAttachmentsForThing(thingId)
}

function onAttachmentSelected(attachmentId: string | number | null) {
  selectedAttachmentId.value = attachmentId

  if (local.value.type !== 'rating_curve') return
  const attachment = attachments.value.find(
    (item) => String(item.id) === String(attachmentId)
  )

  if (!attachment) {
    setRatingCurveReference(local.value, '')
    previewRows.value = []
    previewError.value = ''
    return
  }

  setRatingCurveReference(local.value, attachment.link)
  void loadPreviewForAttachment(attachment)
}

function buildSparklinePath(
  points: RatingCurvePoint[],
  ranges: RatingCurveRange | null,
  width: number,
  height: number
) {
  if (!points.length || !ranges) return ''
  const scaleX = (x: number) =>
    ((x - ranges.xMin) / (ranges.xMax - ranges.xMin)) * width
  const scaleY = (y: number) =>
    (1 - (y - ranges.yMin) / (ranges.yMax - ranges.yMin)) * height

  if (points.length === 1) {
    const y = scaleY(points[0].y).toFixed(2)
    return `M0 ${y} L${width} ${y}`
  }

  return points
    .map((point, index) => {
      const x = scaleX(point.x).toFixed(2)
      const y = scaleY(point.y).toFixed(2)
      return `${index === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
}

function formatPreviewNumber(value: number) {
  if (!Number.isFinite(value)) return '-'
  const absValue = Math.abs(value)
  if ((absValue >= 1000 || absValue < 0.01) && absValue !== 0) {
    return value.toExponential(2)
  }
  return value.toFixed(3).replace(/\.?0+$/, '')
}

async function loadPreviewForAttachment(attachment: ThingFileAttachment) {
  previewError.value = ''
  try {
    const res = await hs.thingFileAttachments.fetchRatingCurvePreview(
      attachment.link,
      12
    )
    if (!res.ok) {
      previewRows.value = []
      previewError.value = res.message || 'Unable to load rating curve preview.'
      return
    }
    previewRows.value = res.data
  } catch (error: any) {
    previewRows.value = []
    previewError.value =
      error?.message || 'Unable to load rating curve preview.'
  }
}

async function onSubmit() {
  await myForm.value?.validate()
  if (!valid.value) return

  if (local.value.type === 'rating_curve') {
    if (!selectedThingId.value) {
      Snackbar.error('Select a Thing before saving this rating curve transformation.')
      return
    }

    if (!selectedAttachment.value) {
      Snackbar.error('Select a rating curve before saving this transformation.')
      return
    }

    setRatingCurveReference(local.value, selectedAttachment.value.link)
    delete (local.value as any).expression
  } else {
    delete (local.value as any).ratingCurveUrl
  }

  isEdit.value
    ? emit('updated', local.value as unknown as DataTransformation)
    : emit('created', local.value as unknown as DataTransformation)

  emit('close')
}

watch(
  () => props.workspaceId,
  () => {
    loadThings()
  }
)

watch(
  () => props.transformation,
  () => {
    local.value = makeInitial()
    selectedThingId.value = null
    selectedAttachmentId.value = null
    attachments.value = []
    previewRows.value = []
    previewError.value = ''
    loadThings()
  }
)

watch(selectedAttachment, (attachment) => {
  if (!attachment || local.value.type !== 'rating_curve') return
  if (
    getRatingCurveReference(local.value) === attachment.link &&
    previewRows.value.length
  ) {
    return
  }
  void loadPreviewForAttachment(attachment)
})

onMounted(() => {
  loadThings()
})

type Rule = (v: any) => true | string

const exprContainsX: Rule = (v) =>
  /x/.test((v ?? '') as string) || "Expression must contain input variable 'x'"

const exprAllowedTokens: Rule = (v) => {
  const s = String(v ?? '').trim()
  if (!s) return true

  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === ' ') {
      i++
      continue
    }
    if (ch === 'x') {
      i++
      continue
    }

    if (/\d/.test(ch)) {
      i++
      while (i < s.length && /\d/.test(s[i])) i++
      if (s[i] === '.') {
        i++
        while (i < s.length && /\d/.test(s[i])) i++
      }
      continue
    }

    if (ch === '(' || ch === ')') {
      i++
      continue
    }

    if (ch === '*' && s[i + 1] === '*') {
      i += 2
      continue
    }
    if (ch === '+' || ch === '-' || ch === '*' || ch === '/') {
      i++
      continue
    }

    return "Only numbers, spaces, 'x', and + - * / ** ( ) are allowed"
  }
  return true
}

const exprBalancedParens: Rule = (v) => {
  const s = String(v ?? '')
  if (!s.trim()) return true
  let depth = 0
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (ch === '(') depth++
    else if (ch === ')') {
      depth--
      if (depth < 0) return `Unmatched ')' at position ${i + 1}`
    }
  }
  return depth === 0
    ? true
    : `Missing ${depth} closing ')'${depth > 1 ? 's' : ''}`
}
</script>

<style scoped>
.rating-curve-preview {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  height: 120px;
  width: 100%;
  max-width: 360px;
}

.rating-curve-preview-svg {
  height: 100%;
  width: 100%;
}

.rating-curve-line {
  stroke: #00796b;
  stroke-width: 2;
}
</style>
