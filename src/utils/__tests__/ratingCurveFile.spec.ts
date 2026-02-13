import { describe, expect, it } from 'vitest'
import { parseRatingCurveCsvText } from '@/utils/orchestration/ratingCurveFile'

describe('parseRatingCurveCsvText', () => {
  it('parses numeric rows with a header row', () => {
    const parsed = parseRatingCurveCsvText(
      'input_value,output_value\n0,0\n1.5,2.25\n'
    )

    expect(parsed.hasHeader).toBe(true)
    expect(parsed.rows).toEqual([
      { inputValue: 0, outputValue: 0 },
      { inputValue: 1.5, outputValue: 2.25 },
    ])
  })

  it('rejects non-numeric values in data rows', () => {
    expect(() =>
      parseRatingCurveCsvText('input_value,output_value\nabc,2\n')
    ).toThrow(/numeric input and output values/i)
  })

  it('rejects rows with more than two populated columns', () => {
    expect(() => parseRatingCurveCsvText('0,1,2\n')).toThrow(
      /exactly two columns/i
    )
  })

  it('parses quoted values and escaped quotes', () => {
    const parsed = parseRatingCurveCsvText('"0","1"\n"2","3"\n')
    expect(parsed.rows).toEqual([
      { inputValue: 0, outputValue: 1 },
      { inputValue: 2, outputValue: 3 },
    ])
  })
})
