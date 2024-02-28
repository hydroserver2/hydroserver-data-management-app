import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'
import { DataPoint, GraphSeries } from '@/types'

const dispatch = d3.dispatch('timeWindow')

export function focus(graphSeriesArray: GraphSeries[]): SVGSVGElement {
  const marks: any[] = []
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10)
  const height = 300

  graphSeriesArray.forEach((series, index) => {
    const [minY, maxY] = d3.extent(series.data, (d) => d.value)!
    const yAxisAlign = index % 2 === 0 ? 'left' : 'right'
    const color = series.lineColor || colorScale(index.toString())
    const yScale = d3.scaleLinear([minY!, maxY!], [0, height])

    // Prepare the mark for each series
    marks.push(
      Plot.lineY(series.data, {
        x: 'date',
        y: (d) => yScale(d.value),
        stroke: color,
        clip: true,
      }),
      //   TODO: Make hover work
      //   Plot.dot(
      //     series.data,
      //     Plot.pointerX({ x: 'date', y: (d) => yScaled(d.value), stroke: 'grey' })
      //   ),
      Plot.axisY(yScale.ticks(), {
        color: color,
        anchor: yAxisAlign,
        label: series.yAxisLabel,
        labelAnchor: 'center',
        y: yScale,
        // TODO Make labels and ticks format well
        tickFormat: yScale.tickFormat(),
      })
    )
  })

  const spec = {
    height: height,
    grid: true,
    marginBottom: 45,
    marginLeft: 60,
    x: { type: 'utc' as any, label: 'Date/Time' },
    // y: { label: yAxisLabel, domain: [minY, maxY] },
    marks: [...marks, Plot.axisX({ labelAnchor: 'center', labelOffset: 40 })],
  }

  let chart = Plot.plot(spec)

  const wrapper = d3
    .create('svg')
    .attr('viewBox', chart.getAttribute('viewBox'))
    .node() as SVGSVGElement
  wrapper.appendChild(chart)

  const x = chart.scale('x')
  if (!x) throw new Error('Failed to get x scale from chart')
  const xDomain = x.domain! as [number, number]
  const xRange = x.range as [number, number]

  let domain = xDomain

  const redraw = () =>
    chart.replaceWith(
      (chart = Plot.plot({
        ...spec,
        x: { ...spec.x, domain },
      }))
    )

  const range = xRange

  const X0 = d3.scaleUtc(xDomain, xRange)
  const E: [[number, number], [number, number]] = [
    [range[0], 0],
    [range[1], 0],
  ]

  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent([1, 100])
    .extent(E)
    .translateExtent(E)
    .on('zoom end', (event) => {
      const { transform, sourceEvent } = event
      domain = transform.rescaleX(X0).domain()
      redraw()
      // broadcast changes if they are originated here
      if (sourceEvent) dispatch.call('timeWindow', wrapper, domain)
    })

  d3.select(wrapper).call(zoom)

  dispatch.on('timeWindow.details', function (value) {
    if (this === wrapper) return
    domain = (value == null ? x.domain : value).slice()
    d3.select(wrapper).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(xRange[0], 0)
        .scale(
          Math.min(100, (xDomain[1] - xDomain[0]) / (domain[1] - domain[0]))
        )
        .translate(-X0(domain[0]), 0)
    )
  })

  return wrapper
}

export function context(graphSeriesArray: GraphSeries[]): SVGSVGElement {
  const marks: any[] = []
  const colorScale = d3.scaleOrdinal(d3.schemeTableau10)
  const height = 65

  graphSeriesArray.forEach((series, index) => {
    const [minY, maxY] = d3.extent(series.data, (d) => d.value)!
    const color = series.lineColor || colorScale(index.toString())
    const yScale = d3.scaleLinear([minY!, maxY!], [0, height])

    // Prepare the mark for each series
    marks.push(
      Plot.lineY(series.data, {
        x: 'date',
        y: (d) => yScale(d.value),
        stroke: color,
        clip: true,
      })
    )
  })

  const chart = Plot.plot({
    height: height,
    marginTop: 5,
    marginLeft: 60,
    marks: marks,
  })

  const x = chart.scale('x')
  const y = chart.scale('y')

  if (!x || !y) throw new Error('Failed to get x scale from chart')

  const [x1, x2] = x.range as [number, number]
  const [y1, y2] = y.range as [number, number]
  let domain = x.domain as [number, number]

  const wrapper = d3
    .create('svg')
    .attr('viewBox', chart.getAttribute('viewBox'))
    .node() as SVGSVGElement
  wrapper.appendChild(chart)

  const brush: any = d3
    .brushX()
    .extent([
      [x1, y2],
      [x2, y1],
    ])
    .on('brush end', (event) => {
      const { selection, sourceEvent } = event
      domain = selection && selection.map(x.invert)

      // broadcast changes if they are originated here
      if (sourceEvent) dispatch.call('timeWindow', wrapper, domain)
    })

  d3.select(wrapper).call(brush)

  dispatch.on('timeWindow.focus', function (value) {
    if (this === wrapper) return
    if (value == null) return
    domain = value
    const b = domain.map(x.apply)
    if (b[0] === x1 && b[1] === x2) {
      d3.select(wrapper).call(brush.clear)
    } else {
      d3.select(wrapper).call(brush.move, domain.map(x.apply))
    }
  })

  return wrapper
}
