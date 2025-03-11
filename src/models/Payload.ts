export interface DataTransformation {
  operation: string
  doSaveRawDataCopy: boolean
  rawTargetIdentifier: string | number
}

export class SourceTargetMapping {
  sourceIdentifier: string | number
  targetIdentifier: string | number
  dataTransformation: DataTransformation | null

  constructor(init?: Partial<SourceTargetMapping>) {
    // Initialize fields with defaults
    this.sourceIdentifier = init?.sourceIdentifier ?? ''
    this.targetIdentifier = init?.targetIdentifier ?? ''
    this.dataTransformation = init?.dataTransformation ?? null
  }

  toggleDataTransformation(): void {
    this.dataTransformation = !!this.dataTransformation
      ? null
      : {
          operation: '',
          doSaveRawDataCopy: false,
          rawTargetIdentifier: '',
        }
  }

  getTitle(): string {
    if (this.sourceIdentifier !== 0 && !this.sourceIdentifier)
      return 'New mapping'
    return `${this.sourceIdentifier} - ${this.targetIdentifier}`
  }
}

export class Payload {
  id: string
  dataSourceId: string
  name: string
  mappings: SourceTargetMapping[]

  constructor(init?: Partial<Payload>) {
    this.id = init?.id ?? ''
    this.dataSourceId = init?.dataSourceId || ''
    this.name = init?.name ?? ''

    const incomingMap = init?.mappings ?? []
    this.mappings = incomingMap.map((m) => new SourceTargetMapping(m))
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
