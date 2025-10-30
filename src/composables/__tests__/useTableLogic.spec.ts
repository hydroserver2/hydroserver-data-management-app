import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import { useTableLogic } from '../useTableLogic'
import { Unit } from '@hydroserver/client'
import unitFixtures from '@/utils/test/fixtures/unitFixtures'

const defaultFetchFunction = (wsId: string): Promise<Unit[]> =>
  Promise.resolve(JSON.parse(JSON.stringify(unitFixtures)))

const defaultDeleteFunction = (id: string): Promise<void> => Promise.resolve()

const createDummyComponent = ({
  apiFetchFunction = defaultFetchFunction,
  apiDeleteFunction = defaultDeleteFunction,
} = {}) =>
  defineComponent({
    setup() {
      const workspaceId = ref('test-workspace')
      return useTableLogic(
        apiFetchFunction,
        apiDeleteFunction,
        Unit,
        workspaceId
      )
    },
    template: '<div>{{ items }}</div>',
  })

describe('useTableLogic', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('fetches items on component mount', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()
    expect(wrapper.vm.items).toEqual(unitFixtures)
  })

  it('opens edit dialog and sets the item correctly', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()

    wrapper.vm.openDialog(unitFixtures[0], 'edit')
    expect(wrapper.vm.openEdit).toBe(true)
    expect(wrapper.vm.item).toEqual(unitFixtures[0])
  })

  it('opens delete dialog and sets the item correctly', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()

    wrapper.vm.openDialog(unitFixtures[1], 'delete')
    expect(wrapper.vm.openDelete).toBe(true)
    expect(wrapper.vm.item).toEqual(unitFixtures[1])
  })

  it('opens access control dialog and sets the item correctly', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()

    wrapper.vm.openDialog(unitFixtures[2], 'accessControl')
    expect(wrapper.vm.openAccessControl).toBe(true)
    expect(wrapper.vm.item).toEqual(unitFixtures[2])
  })

  it('updates an item correctly', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()

    const updatedItem = { ...unitFixtures[0], name: 'Updated' }
    wrapper.vm.onUpdate(updatedItem)
    expect(wrapper.vm.items).toContainEqual(updatedItem)
  })

  it('deletes an item correctly', async () => {
    const wrapper = mount(createDummyComponent())
    await flushPromises()

    wrapper.vm.openDialog(unitFixtures[0], 'delete')
    await wrapper.vm.onDelete()
    await flushPromises()

    expect(wrapper.vm.items).not.toContainEqual(unitFixtures[0])
    expect(wrapper.vm.openDelete).toBe(false)
  })
})
