import { describe, it, expect, vi } from 'vitest'
import { useFormLogic } from '@/composables/useFormLogic'
import { Unit } from '@hydroserver/client'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import unitFixtures from '@/utils/test/fixtures/unitFixtures'

const [unit1, unit2] = unitFixtures

const defaultCreateItem = vi.fn()
const defaultUpdateItem = vi.fn()

describe('useFormLogic', () => {
  // onMounted won't work outside of the context of script setup, therefore
  // wrap composable with dummy component
  const createDummyComponent = ({
    createItem = defaultCreateItem,
    updateItem = defaultUpdateItem,
    initialUnit,
  }: {
    createItem?: typeof defaultCreateItem
    updateItem?: typeof defaultUpdateItem
    initialUnit?: Unit
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
        initialUnit,
      })
    )

    await flushPromises()
    expect(wrapper.vm.item).toEqual(initialUnit)
    expect(wrapper.vm.isEdit).toBe(true)
  })
})
