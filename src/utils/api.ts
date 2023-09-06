export function createPatchObject(original: any, updated: any): any {
  const differences: any = {}
  for (let key in updated) {
    if (
      original[key] &&
      typeof original[key] === 'object' &&
      updated[key] &&
      typeof updated[key] === 'object'
    ) {
      // If the value is an object, we recurse
      const nestedDiff = createPatchObject(original[key], updated[key])
      if (Object.keys(nestedDiff).length > 0) {
        differences[key] = nestedDiff
      }
    } else if (JSON.stringify(original[key]) !== JSON.stringify(updated[key])) {
      differences[key] = updated[key]
    }
  }

  return differences
}
