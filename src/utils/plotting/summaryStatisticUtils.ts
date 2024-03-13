import { GraphSeries } from '@/types'

export class SummaryStatistics {
  name: string
  maximum: number
  minimum: number
  arithmeticMean: number
  geometricMean: number
  standardDeviation: number
  observations: number
  coefficientOfVariation: number
  quantile10: number
  quantile25: number
  median: number
  quantile75: number
  quantile90: number
  private sortedData: number[]

  constructor(name: string, rawData: number[]) {
    const data = rawData.filter((value) => !isNaN(value))

    this.name = name
    this.observations = data.length
    this.sortedData = [...data].sort((a, b) => a - b)
    this.maximum = this.sortedData[this.observations - 1]
    this.minimum = this.sortedData[0]
    this.arithmeticMean = this.computeArithmeticMean()
    this.geometricMean = this.computeGeometricMean()
    this.standardDeviation = this.computeStandardDeviation(this.arithmeticMean)
    this.coefficientOfVariation = this.standardDeviation / this.arithmeticMean
    this.quantile10 = this.computeQuantile(0.1)
    this.quantile25 = this.computeQuantile(0.25)
    this.median = this.computeQuantile(0.5)
    this.quantile75 = this.computeQuantile(0.75)
    this.quantile90 = this.computeQuantile(0.9)
  }

  private computeArithmeticMean(): number {
    const sum = this.sortedData.reduce((a, b) => a + b, 0)
    return sum / this.observations
  }

  private computeGeometricMean(): number {
    const logSum =
      this.sortedData.reduce((sum, value) => sum + Math.log(value), 0) /
      this.observations
    return Math.exp(logSum)
  }

  private computeStandardDeviation(mean: number): number {
    const variance =
      this.sortedData.reduce(
        (sum, value) => sum + Math.pow(value - mean, 2),
        0
      ) / this.observations
    return Math.sqrt(variance)
  }

  private computeQuantile(quantile: number): number {
    const pos = (this.observations - 1) * quantile
    const base = Math.floor(pos)
    const rest = pos - base
    if (base + 1 < this.sortedData.length)
      return (
        this.sortedData[base] +
        rest * (this.sortedData[base + 1] - this.sortedData[base])
      )
    else return this.sortedData[base]
  }
}

export const calculateSummaryStatistics = (seriesArray: GraphSeries[]) =>
  seriesArray.map(
    (series) =>
      new SummaryStatistics(
        series.name,
        series.data.map((dp) => dp.value)
      )
  )
