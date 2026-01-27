<template>
  <v-card :loading="updating">
    <template v-slot:loader="{ isActive }">
      <v-progress-linear color="primary" :active="isActive" indeterminate />
    </template>

    <div class="mx-4 mb-4 mt-6">
      <div ref="plotContainer" class="plotly-popup h-[600px] w-full" />
    </div>

    <div
      class="flex flex-wrap items-center justify-between gap-2 px-2 pb-3 pt-2 max-[600px]:w-full max-[600px]:flex-col max-[600px]:items-stretch max-[600px]:justify-start"
    >
      <div
        class="flex min-w-0 flex-1 flex-wrap items-center gap-3 max-[600px]:w-full"
      >
        <div
          class="flex items-center pl-2 max-[600px]:w-full max-[600px]:justify-center"
        >
          <v-chip-group
            class="gap-1 max-[600px]:[&_.v-slide-group__content]:justify-center"
            :model-value="selectedDateBtnId"
            selected-class="bg-primary text-white"
            @update:model-value="handlePresetChange"
          >
            <v-chip
              v-for="option in dateOptions"
              :key="option.id"
              :value="option.id"
              class="min-h-[24px] rounded px-2 text-[0.75rem]"
              size="small"
              label
            >
              {{ option.label }}
            </v-chip>
          </v-chip-group>
        </div>
        <div
          class="flex flex-wrap gap-3 max-[600px]:w-full max-[600px]:flex-col"
        >
          <div class="min-w-[160px] max-[600px]:w-full max-[600px]:min-w-0">
            <DatePickerField
              :active="isCustomRangeActive"
              :model-value="beginDate"
              placeholder="Begin Date"
              class="w-full"
              @update:model-value="setDateRange({ begin: $event })"
            />
          </div>
          <div class="min-w-[160px] max-[600px]:w-full max-[600px]:min-w-0">
            <DatePickerField
              :active="isCustomRangeActive"
              :model-value="endDate"
              placeholder="End Date"
              class="w-full"
              @update:model-value="setDateRange({ end: $event })"
            />
          </div>
        </div>
      </div>
      <div
        class="flex flex-none flex-wrap items-center justify-end gap-2 max-[600px]:w-full max-[600px]:justify-center"
      >
        <v-btn
          color="grey"
          variant="outlined"
          @click="$emit('close')"
          class="max-[600px]:w-full max-[600px]:max-w-[260px]"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          :append-icon="mdiArrowRight"
          :to="{
            name: 'VisualizeData',
            query: getDatastreamQueryParams(datastream),
          }"
          class="max-[600px]:w-full max-[600px]:max-w-[260px]"
        >
          Visualize data page
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { Datastream, GraphSeries } from '@hydroserver/client'
import DatePickerField from '@/components/VisualizeData/DatePickerField.vue'
import { createPlotlyOption, PlotlyOptions } from '@/utils/plotting/plotly'
import { onMounted, ref, nextTick, onBeforeUnmount, computed } from 'vue'
import { useObservationStore } from '@/store/observations'
import { mdiArrowRight } from '@mdi/js'

const { fetchGraphSeries } = useObservationStore()

const props = defineProps({
  datastream: {
    type: Object as () => Datastream,
    required: true,
  },
})
defineEmits(['close'])

const plotlyOptions = ref<PlotlyOptions | undefined>()
const graphSeries = ref<GraphSeries | undefined>()
const updating = ref(false)
const endDate = ref<Date>(
  props.datastream.phenomenonEndTime
    ? new Date(props.datastream.phenomenonEndTime)
    : new Date()
)
const oneMonthBack = (end: Date) =>
  new Date(end.getFullYear(), end.getMonth() - 1, end.getDate())
const beginDate = ref<Date>(oneMonthBack(endDate.value))
const selectedDateBtnId = ref(0)
const plotContainer = ref<HTMLDivElement | null>(null)
const plotlyRef = ref<(HTMLDivElement & { [key: string]: any }) | null>(null)
let plotlyApi: any | null = null

const ensurePlotly = async () => {
  if (plotlyApi) return plotlyApi
  const PlotlyModule = await import('plotly.js-dist')
  plotlyApi = (PlotlyModule as any).default ?? PlotlyModule
  return plotlyApi
}

const dateOptions = [
  {
    id: 0,
    label: '1m',
    calculateBeginDate: (end: Date) => oneMonthBack(end),
  },
  {
    id: 1,
    label: '6m',
    calculateBeginDate: (end: Date) =>
      new Date(end.getFullYear(), end.getMonth() - 6, end.getDate()),
  },
  {
    id: 2,
    label: 'YTD',
    calculateBeginDate: (end: Date) => new Date(end.getFullYear(), 0, 1),
  },
  {
    id: 3,
    label: '1y',
    calculateBeginDate: (end: Date) =>
      new Date(end.getFullYear() - 1, end.getMonth(), end.getDate()),
  },
  {
    id: 4,
    label: 'all',
    calculateBeginDate: () =>
      props.datastream.phenomenonBeginTime
        ? new Date(props.datastream.phenomenonBeginTime)
        : oneMonthBack(endDate.value),
  },
]

type Query = {
  sites: string
  datastreams: string
  selectedDateBtnId?: number
  beginDate?: string
  endDate?: string
}

const getDatastreamQueryParams = (datastream: Datastream) => {
  let query: Query = {
    sites: datastream.thingId,
    datastreams: datastream.id,
  }

  if (selectedDateBtnId.value >= 0) {
    if (selectedDateBtnId.value !== 0) {
      query.selectedDateBtnId = selectedDateBtnId.value
    }
  } else {
    query.beginDate = beginDate.value.toISOString()
    query.endDate = endDate.value.toISOString()
  }

  return query
}

const isCustomRangeActive = computed(() => selectedDateBtnId.value < 0)

const normalizeDateRange = () => {
  if (beginDate.value > endDate.value) {
    const tmp = beginDate.value
    beginDate.value = endDate.value
    endDate.value = tmp
  }
}

const updateState = async () => {
  updating.value = true
  normalizeDateRange()

  graphSeries.value = await fetchGraphSeries(
    props.datastream,
    beginDate.value.toISOString(),
    endDate.value.toISOString()
  )

  if (!graphSeries.value) {
    updating.value = false
    return
  }

  plotlyOptions.value = createPlotlyOption([graphSeries.value], {
    addLegend: false,
    addSummaryButton: false,
    showRangeSlider: false,
    showRangeSelector: false,
    title: props.datastream.name,
    titleWrapLength: 80,
  })
  if (plotlyOptions.value?.layout?.title) {
    plotlyOptions.value.layout.title.x = 0.5
    plotlyOptions.value.layout.title.xanchor = 'center'
    plotlyOptions.value.layout.title.y = 0.92
    plotlyOptions.value.layout.title.yanchor = 'top'
  }
  if (plotlyOptions.value?.layout?.margin) {
    const titleText = plotlyOptions.value.layout.title?.text
    const titleLines =
      typeof titleText === 'string' ? titleText.split('<br>').length : 1
    const extraTitleMargin = Math.max(0, titleLines - 1) * 14 + 12
    plotlyOptions.value.layout.margin.t =
      (plotlyOptions.value.layout.margin.t ?? 0) + extraTitleMargin
  }
  nextTick(() => {
    renderPlot()
  })
  updating.value = false
}

const handlePresetChange = (value: number | null) => {
  if (typeof value !== 'number') return
  selectedDateBtnId.value = value
  endDate.value = props.datastream.phenomenonEndTime
    ? new Date(props.datastream.phenomenonEndTime)
    : new Date()
  const option = dateOptions.find((item) => item.id === value)
  if (option) {
    beginDate.value = option.calculateBeginDate(endDate.value)
  }
  updateState()
}

const setDateRange = ({ begin, end }: { begin?: Date; end?: Date }) => {
  selectedDateBtnId.value = -1
  if (begin) beginDate.value = begin
  if (end) endDate.value = end
  updateState()
}

onMounted(async () => {
  await updateState()
})

const renderPlot = async () => {
  if (!plotlyOptions.value || !plotContainer.value) return

  const { traces, layout, config } = plotlyOptions.value
  const Plotly = await ensurePlotly()

  if (!plotlyRef.value) {
    plotlyRef.value = await Plotly.newPlot(
      plotContainer.value,
      traces,
      layout,
      config
    )
  } else {
    await Plotly.react(plotlyRef.value, traces, layout, config)
  }
  scheduleDragHandleStyling()
}

const scheduleDragHandleStyling = () => {
  requestAnimationFrame(() => {
    applyDragHandleStyling()
    setTimeout(applyDragHandleStyling, 0)
  })
}

const applyDragHandleStyling = () => {
  if (!plotlyRef.value) return
  const root = plotlyRef.value as unknown as HTMLElement
  const lightHandles = root.querySelectorAll<SVGElement>(
    '.draglayer .drag.cursor-ns-resize,' +
      '.draglayer .drag.cursor-n-resize,' +
      '.draglayer .drag.cursor-s-resize,' +
      '.draglayer .drag.cursor-w-resize,' +
      '.draglayer .drag.cursor-ew-resize,' +
      '.draglayer .drag.cursor-e-resize'
  )
  lightHandles.forEach((node) => {
    node.setAttribute('fill', '#f8f8f8')
    node.setAttribute('stroke', '#f8f8f8')
    node.style.fill = '#f8f8f8'
    node.style.stroke = '#f8f8f8'
  })

  const cornerHandles = root.querySelectorAll<SVGElement>(
    '.draglayer .drag.cursor-sw-resize,' +
      '.draglayer .drag.cursor-nw-resize,' +
      '.draglayer .drag.cursor-ne-resize,' +
      '.draglayer .drag.cursor-se-resize'
  )
  cornerHandles.forEach((node) => {
    node.setAttribute('fill', '#f2f2f2')
    node.setAttribute('stroke', '#f2f2f2')
    node.style.fill = '#f2f2f2'
    node.style.stroke = '#f2f2f2'
  })
}

onBeforeUnmount(() => {
  if (plotlyRef.value) {
    if (plotlyApi) {
      plotlyApi.purge(plotlyRef.value)
    }
  }
})
</script>

<style scoped>
.plotly-popup :deep(.js-plotly-plot .plotly) {
  .drag.cursor-ns-resize,
  .drag.cursor-n-resize,
  .drag.cursor-s-resize,
  .drag.cursor-w-resize,
  .drag.cursor-ew-resize,
  .drag.cursor-e-resize {
    fill: #f8f8f8 !important;
    stroke: #f8f8f8 !important;
    stroke-width: 1px !important;
  }

  .drag.cursor-sw-resize,
  .drag.cursor-nw-resize,
  .drag.cursor-ne-resize,
  .drag.cursor-se-resize {
    fill: #f2f2f2 !important;
    stroke: #f2f2f2 !important;
    stroke-width: 1px !important;
  }
}
</style>
