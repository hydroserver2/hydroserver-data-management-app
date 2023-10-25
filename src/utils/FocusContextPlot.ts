import * as Plot from '@observablehq/plot'
import * as d3 from 'd3'

interface PlotData {
  date: Date
  value: number
}

const dispatch = d3.dispatch('timeWindow')

export function focus(data: PlotData[], yAxisLabel: string): SVGSVGElement {
  const [minX, maxX] = d3.extent(data, (d) => d.date)
  const [minY, maxY] = d3.extent(data, (d) => d.value)
  const spec = {
    height: 250,
    grid: true,
    marginBottom: 45,
    x: { type: 'utc', label: 'Date/Time' },
    y: { label: yAxisLabel, domain: [minY, maxY] },
    marks: [
      Plot.axisX({ labelAnchor: 'center', labelOffset: 40 }),
      Plot.axisY({ labelAnchor: 'center' }),
      Plot.areaY(data, {
        x: 'date',
        y: 'value',
        fill: '#E8F5E9',
        stroke: '#4CAF50',
        clip: true,
      }),
      // We need to overlay a rectangle in order for the ruleX mouseover
      // to be responsive above the areaY line.
      Plot.rect([{ minX, maxX, minY, maxY }], {
        x1: (d) => d.minX,
        x2: (d) => d.maxX,
        y1: (d) => d.minY,
        y2: (d) => d.maxY,
        fillOpacity: 0,
        clip: true,
      }),
      Plot.ruleX(
        data,
        Plot.pointerX({
          x: 'date',
          py: 'value',
          stroke: 'grey',
        })
      ),
      Plot.dot(data, Plot.pointerX({ x: 'date', y: 'value', stroke: 'grey' })),
      // Plot.tip(
      //   data,
      //   Plot.pointerX({
      //     x: 'date',
      //     y: 'value',
      //   })
      // ),
      Plot.text(
        data,
        Plot.pointerX({
          px: 'date',
          py: 'value',
          dy: -17,
          frameAnchor: 'top-left',
          fontVariant: 'tabular-nums',
          text: (d) =>
            [
              `Date/Time ${Plot.formatIsoDate(d.date)}`,
              `${yAxisLabel} ${d.value.toFixed(2)}`,
            ].join('   '),
        })
      ),
    ],
  } as Plot.PlotOptions

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

export function context(data: PlotData[], width: number): SVGSVGElement {
  const [minY, maxY] = d3.extent(data, (d) => d.value)

  const chart = Plot.plot({
    height: 65,
    marginTop: 5,
    marks: [
      Plot.areaY(data, {
        x: 'date',
        y1: (d) => minY,
        y2: 'value',
        fill: '#E8F5E9',
      }),
    ],
    y: { ticks: 0, label: null, domain: [minY, maxY] },
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
