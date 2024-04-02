import { EChartsOption, YAXisComponentOption, SeriesOption } from 'echarts'
import { GraphSeries } from '@/types'
import { storeToRefs } from 'pinia'
import { useDataVisStore } from '@/store/dataVisualization'

type yAxisConfigurationMap = Map<
  string,
  { index: number; yAxisLabel: string; color: string }
>

/**
Function that processes an array of GraphSeries and returns a map for Y-Axis configurations in order 
to allow multiple series to share the same Y-Axis if yAxisLabels are the same.
Colors axis black if multiple series use it.
*/
export function createYAxisConfigurations(
  data: GraphSeries[]
): yAxisConfigurationMap {
  const yAxisConfigurations: yAxisConfigurationMap = new Map()

  data.forEach((series) => {
    if (!yAxisConfigurations.has(series.yAxisLabel)) {
      yAxisConfigurations.set(series.yAxisLabel, {
        index: yAxisConfigurations.size,
        yAxisLabel: series.yAxisLabel,
        color: series.lineColor,
      })
    } else {
      const existingEntry = yAxisConfigurations.get(series.yAxisLabel)
      if (existingEntry && existingEntry.color !== 'black') {
        yAxisConfigurations.set(series.yAxisLabel, {
          ...existingEntry,
          color: 'black',
        })
      }
    }
  })

  return yAxisConfigurations
}

export function generateYAxisOptions(
  yAxisConfigurations: yAxisConfigurationMap
): YAXisComponentOption[] {
  return Array.from(yAxisConfigurations.values()).map((yAxisConfig, index) => ({
    name: yAxisConfig.yAxisLabel,
    nameLocation: 'middle',
    nameGap: 60,
    type: 'value',
    position: yAxisConfig.index === 0 ? 'left' : 'right',
    offset: yAxisConfig.index > 0 ? (yAxisConfig.index - 1) * 85 : 0,
    axisLine: { lineStyle: { color: yAxisConfig.color } },
  }))
}

export function generateSeriesOptions(
  seriesArray: GraphSeries[],
  yAxisConfigurations: yAxisConfigurationMap
): SeriesOption[] {
  return seriesArray.map((series) => ({
    name: series.name,
    type: 'line',
    data: series.data.map((dp) => [dp.date.getTime(), dp.value]),
    yAxisIndex: yAxisConfigurations.get(series.yAxisLabel)?.index,
    itemStyle: {
      color: series.lineColor,
    },
    sampling: 'lttb',
    showSymbol: false,
  }))
}

export function generateToolboxOptions() {
  const { showSummaryStatistics } = storeToRefs(useDataVisStore())
  return {
    feature: {
      mySummaryStatistics: {
        show: true,
        title: 'Summary Statistics',
        icon: 'path://M3,2 L17,2 L21,6 L21,22 L3,22 L3,2 M17,2 L17,6 L21,6',
        onclick: function () {
          showSummaryStatistics.value = true
        },
      },
      dataZoom: {
        yAxisIndex: 'none',
      },
      restore: {},
      saveAsImage: {},
    },
  }
}

export function generateDataZoomOptions() {
  const { dataZoomStart, dataZoomEnd } = storeToRefs(useDataVisStore())
  return [
    {
      type: 'slider', // Creates a 'brush/context' zoom window
      start: dataZoomStart.value,
      end: dataZoomEnd.value,
    },
    {
      type: 'inside', // For mouse scrolling in the chart
    },
  ]
}

interface CustomOptions {
  addToolbox: boolean
  initializeZoomed: boolean
  addLegend: boolean
}

export const createEChartsOption = (
  seriesArray: GraphSeries[],
  opts: Partial<CustomOptions> = {}
): EChartsOption => {
  const { addToolbox = true, initializeZoomed = true, addLegend = true } = opts

  const yAxisConfigurations = createYAxisConfigurations(seriesArray)
  const yAxisOptions = generateYAxisOptions(yAxisConfigurations)
  const seriesOptions = generateSeriesOptions(seriesArray, yAxisConfigurations)

  let gridRightPadding = 20
  if (yAxisConfigurations.size > 1)
    gridRightPadding += (yAxisConfigurations.size - 1) * 85

  let echartsOption: EChartsOption = {
    grid: {
      bottom: 80,
      right: gridRightPadding,
      top: 50 + 15 * seriesArray.length,
      left: 80,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765',
        },
      },
    },
    xAxis: {
      type: 'time',
    },
    yAxis: yAxisOptions,
    series: seriesOptions,
    dataZoom: initializeZoomed
      ? generateDataZoomOptions()
      : [
          {
            type: 'slider',
          },
          {
            type: 'inside',
          },
        ],
  }

  if (addToolbox) {
    echartsOption.toolbox = generateToolboxOptions() as {}
  }

  if (addLegend) {
    echartsOption.legend = {
      orient: 'vertical',
      left: 'auto',
    }
  }

  return echartsOption
}
