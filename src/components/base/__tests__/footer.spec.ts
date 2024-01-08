import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/base/Footer.vue'
import { wrapTestComponent, renderOptions } from '@/utils/test/testUtils'

describe('load footer', () => {
  const wrapper = mount(wrapTestComponent(Footer), renderOptions())

  it('should load', async () => {
    expect(wrapper.text()).toContain('Contact Us')
  })
})
