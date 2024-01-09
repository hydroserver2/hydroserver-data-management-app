import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/base/Footer.vue'
import { wrapTestComponent, renderOptions } from '@/utils/test/testUtils'
import { RouterLink } from 'vue-router'

describe('Footer Component', () => {
  const wrapper = mount(wrapTestComponent(Footer), renderOptions())

  it('should contain "Contact Us" heading', async () => {
    expect(wrapper.text()).toContain('Contact Us')
  })

  it('should render the UWRL logo', () => {
    const logo = wrapper.find('[alt="UWRL Logo"]')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('/src/assets/UWRL-min.png')
  })

  it('should navigate correctly on internal router links', () => {
    const contactLink = wrapper.findComponent(RouterLink)
    expect(contactLink.exists()).toBe(true)
    expect(contactLink.props('to')).toBe('/contact')
  })
})
