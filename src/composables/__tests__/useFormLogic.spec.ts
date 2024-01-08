import { describe, it, expect, vi } from 'vitest'
import { useFormLogic } from '@/composables/useFormLogic'
import { Unit } from '@/types'
import { nextTick } from 'vue'

const unit1 = {
  id: 'unit1',
  name: 'Unit One',
  definition: 'First unit for testing.',
  symbol: 'U1',
  type: 'TestType',
  owner: 'Owner1',
}

const unit2 = {
  id: 'unit2',
  name: 'Unit Two',
  definition: 'Second unit for testing.',
  symbol: 'U2',
  type: 'TestType',
  owner: 'Owner2',
}

const unitList = [unit1, unit2]

describe('useFormLogic', () => {
  it('initializes correctly without initialItem', async () => {
    const mockFetchItems = vi.fn(() => Promise.resolve([]))
    const createItem = vi.fn()
    const updateItem = vi.fn()

    const { item, items, isEdit, valid, selectedId } = useFormLogic(
      mockFetchItems,
      createItem,
      updateItem,
      Unit
    )

    expect(item.value).toBeInstanceOf(Unit)
    expect(items.value).toEqual([])
    expect(isEdit.value).toBe(false)
    expect(valid.value).toBe(false)
    expect(selectedId.value).toBeUndefined()
  })

  it('initializes correctly with initialItem', async () => {
    let initialUnit = new Unit()
    Object.assign(initialUnit, unit1)

    const mockFetchItems = vi.fn(() => Promise.resolve(unitList))
    const createItem = vi.fn()
    const updateItem = vi.fn()

    const { item, init, items, isEdit, selectedId } = useFormLogic(
      mockFetchItems,
      createItem,
      updateItem,
      Unit,
      initialUnit
    )

    await init()

    expect(selectedId.value).toEqual(initialUnit.id)
    expect(items.value).toEqual(unitList)
    expect(item.value).toEqual(initialUnit)
    expect(isEdit.value).toBe(true)
  })

  it('updates item when selectedId changes', async () => {
    const mockFetchItems = vi.fn(() => Promise.resolve(unitList))
    const createItem = vi.fn()
    const updateItem = vi.fn()

    const { init, item, selectedId } = useFormLogic(
      mockFetchItems,
      createItem,
      updateItem,
      Unit,
      unit1
    )

    await init()
    selectedId.value = 'unit2'
    await nextTick()

    expect(item.value).toEqual(unit2)
  })
})
