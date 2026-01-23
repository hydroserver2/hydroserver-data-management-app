import { GraphSeries } from '@hydroserver/client'
import { storeToRefs } from 'pinia'
import { useDataVisStore } from '@/store/dataVisualization'
// @ts-ignore no type definitions
import Plotly from 'plotly.js-dist'

type YAxisConfiguration = {
  index: number
  yAxisLabel: string
  color: string
}

type YAxisConfigurationMap = Map<string, YAxisConfiguration>

export type PlotlyOptions = {
  traces: any[]
  layout: any
  config: any
  xRange: { min: number; max: number } | null
}

type PlotlyBuildOptions = {
  dataZoomStart?: number
  dataZoomEnd?: number
  addLegend?: boolean
  addSummaryButton?: boolean
  addScreenshotButton?: boolean
  showRangeSlider?: boolean
  showRangeSelector?: boolean
  activeRangeSelector?: number
  uirevision?: string | number
  title?: string
}

const AXIS_SPACING = 0.06

const rangeSelectorOptions = {
  xanchor: 'left',
  x: 0,
  yanchor: 'top',
  y: -0.15,
  buttons: [
    {
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1m',
    },
    {
      step: 'month',
      stepmode: 'backward',
      count: 6,
      label: '6m',
    },
    {
      step: 'year',
      stepmode: 'todate',
      count: 1,
      label: 'YTD',
    },
    {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1y',
    },
    {
      step: 'all',
      label: 'all',
    },
  ],
}

export function createYAxisConfigurations(
  data: GraphSeries[]
): YAxisConfigurationMap {
  const yAxisConfigurations: YAxisConfigurationMap = new Map()

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

export const getXRangeBounds = (
  seriesArray: GraphSeries[]
): { min: number; max: number } | null => {
  let min = Infinity
  let max = -Infinity

  seriesArray.forEach((series) => {
    series.data.forEach((point) => {
      const ts = point.date.getTime()
      if (ts < min) min = ts
      if (ts > max) max = ts
    })
  })

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null
  }

  return { min, max }
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

const buildSummaryButton = () => {
  const { showSummaryStatistics } = storeToRefs(useDataVisStore())

  return {
    name: 'Summary Statistics',
    icon: {
      width: 512,
      height: 512,
      path: 'M64 64h384v384H64z M128 176h64v224h-64z M224 256h64v144h-64z M320 128h64v272h-64z',
    },
    click: () => {
      showSummaryStatistics.value = true
    },
  }
}

const buildScreenshotButton = () => {
  return {
    name: 'Download plot',
    icon: {
      width: 24,
      height: 24,
      path: 'M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2m8 2a5 5 0 0 0-5 5a5 5 0 0 0 5 5a5 5 0 0 0 5-5a5 5 0 0 0-5-5m0 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3Z',
    },
    click: (gd: any) => {
      Plotly.downloadImage(gd, {
        format: 'png',
        filename: 'plot',
        scale: 4,
      })
    },
  }
}

const wrapTitle = (title: string, maxLength: number) => {
  const words = title.trim().split(/\s+/)
  let line = ''
  const lines: string[] = []

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word
    if (next.length > maxLength && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  })

  if (line) lines.push(line)
  return lines.join('<br>')
}

export const createPlotlyOption = (
  seriesArray: GraphSeries[],
  opts: PlotlyBuildOptions = {}
): PlotlyOptions => {
  const {
    dataZoomStart = 0,
    dataZoomEnd = 100,
    addLegend = true,
    addSummaryButton = true,
    addScreenshotButton = true,
    showRangeSlider = false,
    showRangeSelector = true,
    activeRangeSelector,
    uirevision,
    title,
  } = opts

  const yAxisConfigurations = createYAxisConfigurations(seriesArray)
  const yAxisEntries = Array.from(yAxisConfigurations.values())
  const leftCount = Math.ceil(yAxisEntries.length / 2)
  const rightCount = yAxisEntries.length - leftCount

  const xRange = getXRangeBounds(seriesArray)
  const span = xRange ? xRange.max - xRange.min : 0
  const rangeStart = xRange
    ? xRange.min + (span * clampPercent(dataZoomStart)) / 100
    : undefined
  const rangeEnd = xRange
    ? xRange.min + (span * clampPercent(dataZoomEnd)) / 100
    : undefined

  const xDomainStart = leftCount ? AXIS_SPACING * leftCount : AXIS_SPACING
  const xDomainEnd = rightCount
    ? 1 - AXIS_SPACING * rightCount
    : 1 - AXIS_SPACING

  const titleText = title
  const titleColor = seriesArray[0]?.lineColor

  const layout: any = {
    margin: { l: 60, r: 30, t: 70, b: 70 },
    showlegend: addLegend,
    legend: addLegend
      ? {
          orientation: 'h',
          x: 0,
          xanchor: 'left',
          y: 1.08,
          yanchor: 'bottom',
        }
      : undefined,
    hovermode: 'x',
    dragmode: 'pan',
    xaxis: {
      type: 'date',
      showline: true,
      showgrid: true,
      gridcolor: '#e6e6e6',
      gridwidth: 1,
      domain: [xDomainStart, xDomainEnd],
      title: { text: 'Datetime', standoff: 24 },
      automargin: true,
      range:
        rangeStart !== undefined && rangeEnd !== undefined
          ? [rangeStart, rangeEnd]
          : undefined,
      autorange: rangeStart === undefined || rangeEnd === undefined,
      rangeselector: showRangeSelector
        ? {
            ...rangeSelectorOptions,
            active: activeRangeSelector,
          }
        : null,
      rangeslider: showRangeSlider ? { visible: true } : { visible: false },
    },
    title: titleText
      ? {
          text: wrapTitle(titleText, 48),
          font: titleColor ? { color: titleColor } : undefined,
          x: 0,
          xanchor: 'left',
          y: 0.98,
        }
      : undefined,
  }
  if (uirevision !== undefined) {
    layout.uirevision = uirevision
  }

  const markerSymbols = [
    'circle',
    'square',
    'diamond',
    'triangle-up',
    'x',
  ]

  const traces = seriesArray.map((series, index) => {
    const axisConfig = yAxisConfigurations.get(series.yAxisLabel)
    const axisIndex = axisConfig?.index ?? 0
    const axisId = axisIndex === 0 ? 'y' : `y${axisIndex + 1}`
    const symbol = markerSymbols[index % markerSymbols.length]

    return {
      id: series.id,
      name: wrapTitle(series.name, 28),
      x: series.data.map((dp) => dp.date.getTime()),
      y: series.data.map((dp) => dp.value),
      yaxis: axisId,
      type: 'scattergl',
      mode: 'lines+markers',
      line: { color: series.lineColor, width: 2 },
      marker: { color: series.lineColor, size: 6, symbol },
      hoverinfo: 'y',
      hovertemplate: '<b>%{y}</b><extra></extra>',
    }
  })

  yAxisEntries.forEach((axisConfig, index) => {
    const axisKey = index === 0 ? 'yaxis' : `yaxis${index + 1}`
    const side = index < leftCount ? 'left' : 'right'
    const position =
      side === 'left'
        ? xDomainStart - AXIS_SPACING * (leftCount - 1 - index)
        : xDomainEnd + AXIS_SPACING * (index - leftCount)

    layout[axisKey] = {
      title: {
        text: axisConfig.yAxisLabel,
        font: { color: axisConfig.color },
        standoff: 12,
      },
      tickfont: { color: axisConfig.color },
      side,
      anchor: 'free',
      position,
      showline: true,
      linecolor: axisConfig.color,
      zeroline: false,
      showgrid: index === 0,
      gridcolor: '#e6e6e6',
      gridwidth: 1,
      overlaying: index === 0 ? undefined : 'y',
      autorange: true,
      automargin: true,
    }
  })

  const config: any = {
    displayModeBar: true,
    displaylogo: false,
    scrollZoom: true,
    responsive: true,
    doubleClick: false,
    modeBarButtonsToRemove: ['toImage', 'autoScale', 'lasso2d', 'select2d'],
  }

  const extraButtons = []
  if (addScreenshotButton) extraButtons.push(buildScreenshotButton())
  if (addSummaryButton) extraButtons.push(buildSummaryButton())
  if (extraButtons.length) config.modeBarButtonsToAdd = extraButtons

  return { traces, layout, config, xRange }
}
