import { describe, it, expect, vi } from 'vitest'
import { useFormLogic } from '@/composables/useFormLogic'
import { Unit } from '@/types'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import unitFixtures from '@/utils/test/fixtures/unitFixtures'

const [unit1, unit2] = unitFixtures

const defaultCreateItem = vi.fn()
const defaultUpdateItem = vi.fn()
let defaultInitialUnit: Unit

describe('useFormLogic', () => {
  // onMounted won't work outside of the context of script setup, therefore
  // wrap composable with dummy component
  const createDummyComponent = ({
    createItem = defaultCreateItem,
    updateItem = defaultUpdateItem,
    initialUnit = defaultInitialUnit,
  } = {}) =>
    defineComponent({
      setup() {
        return useFormLogic(createItem, updateItem, Unit, initialUnit)
      },
      template: '<div>{{item}}</div>',
    })

  it('initializes correctly without initialItem', async () => {
    const wrapper = mount(createDummyComponent())
    expect(wrapper.vm.item).toBeInstanceOf(Unit)
    expect(wrapper.vm.isEdit).toBe(false)
    expect(wrapper.vm.valid).toBe(false)
  })

  it('initializes correctly with initialItem', async () => {
    let initialUnit = new Unit()
    Object.assign(initialUnit, unit1)

    const wrapper = mount(
      createDummyComponent({
        initialUnit: initialUnit,
      })
    )

    await flushPromises()
    expect(wrapper.vm.item).toEqual(initialUnit)
    expect(wrapper.vm.isEdit).toBe(true)
  })

  it('Calls update() when in edit mode', async () => {
    const wrapper = mount(
      createDummyComponent({
        updateItem: vi.fn(() => Promise.resolve(unit2)),
        initialUnit: unit2,
      })
    )

    await flushPromises()
    wrapper.vm.valid = true
    const newItem = await wrapper.vm.uploadItem()
    await nextTick()
    expect(newItem).toEqual(unit2)
  })

  it('Calls create() when in create mode', async () => {
    const wrapper = mount(
      createDummyComponent({
        createItem: vi.fn(() => Promise.resolve(unit1)),
      })
    )

    await flushPromises()
    wrapper.vm.valid = true
    const newItem = await wrapper.vm.uploadItem()
    await nextTick()
    expect(newItem).toEqual(unit1)
  })

  it('Handles errors properly', async () => {
    const mockError = new Error('Failed to fetch items')
    const wrapper = mount(createDummyComponent({}))

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    await flushPromises()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching items from DB.',
      mockError
    )

    consoleErrorSpy.mockRestore()
  })
})
