import { describe, it, expect } from 'vitest'
import router from '@/router/router'
import { mount } from '@vue/test-utils'
import Footer from '@/components/base/Footer.vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const testVuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = require('resize-observer-polyfill')

const TestComponent = {
  components: { Footer },
  template: `
  <v-app>
    <v-main>
      <Footer />
    </v-main>
  </v-app>
  `,
}

describe('load footer', () => {
  const wrapper = mount(TestComponent, {
    global: { plugins: [testVuetify, router] },
  })

  it('should load', async () => {
    expect(wrapper.text()).toContain('Contact Us')
  })
})
