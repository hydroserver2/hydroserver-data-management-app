export interface DataTransformation {
  transformationType: 'expression' | 'lookup'
  expression?: string
  lookupTableUuid?: string
  operation: string
  doSaveRawDataCopy: boolean
  rawTargetIdentifier: string | number
}

export interface SourceTargetMapping {
  sourceIdentifier: string | number
  targetIdentifier: string | number
  dataTransformation: DataTransformation | null
}

export class Payload {
  name = ''
  mappings: SourceTargetMapping[] = []
  extractorVariables: Record<string, string> = {}

  constructor(init?: Partial<Payload>) {
    Object.assign(this, init)
  }
}

// toggleDataTransformation(): void {
//   this.dataTransformation = !!this.dataTransformation
//     ? null
//     : {
//         transformationType: 'expression',
//         operation: '',
//         doSaveRawDataCopy: false,
//         rawTargetIdentifier: '',
//       }
// }

// getTitle(): string {
//   if (this.sourceIdentifier !== 0 && !this.sourceIdentifier)
//     return 'New mapping'
//   return `Source: ${this.sourceIdentifier} - Target: ${this.targetIdentifier}`
// }

export function addMapping(payload: Payload) {
  payload.mappings.push({
    sourceIdentifier: '',
    targetIdentifier: '',
    dataTransformation: null,
  })
}
