export interface DataTransformation {
  transformationType: 'expression' | 'lookup'
  expression?: string
  lookupTableUuid?: string
  operation: string
  doSaveRawDataCopy: boolean
  rawTargetIdentifier: string | number
}

export class SourceTargetMapping {
  sourceIdentifier: string | number = ''
  targetIdentifier: string | number = ''
  dataTransformation: DataTransformation | null = null

  constructor(init?: Partial<SourceTargetMapping>) {
    Object.assign(this, init)
  }

  toggleDataTransformation(): void {
    this.dataTransformation = !!this.dataTransformation
      ? null
      : {
          transformationType: 'expression',
          operation: '',
          doSaveRawDataCopy: false,
          rawTargetIdentifier: '',
        }
  }

  getTitle(): string {
    if (this.sourceIdentifier !== 0 && !this.sourceIdentifier)
      return 'New mapping'
    return `Source: ${this.sourceIdentifier} - Target: ${this.targetIdentifier}`
  }
}

export class Payload {
  id = ''
  dataSourceId = ''
  name = ''
  mappings: SourceTargetMapping[] = []

  constructor(init?: Partial<Payload>) {
    Object.assign(this, {
      ...init,
      mappings: init?.mappings?.map((m) => new SourceTargetMapping(m)) ?? [],
    })
  }

  addMapping(): void {
    this.mappings.push(new SourceTargetMapping())
  }

  removeMapping(index: number): void {
    if (index >= 0 && index < this.mappings.length) {
      this.mappings.splice(index, 1)
    }
  }
}
