export function createPatchObject(original: any, updated: any): any {
  const differences: any = {}

  Object.keys(updated).forEach((key) => {
    if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      differences[key] = updated[key]
    }
  })

  return differences
}
