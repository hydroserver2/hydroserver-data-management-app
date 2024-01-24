import type { RouteLocationRaw, Router } from 'vue-router'
import router from '@/router/router'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import ResizeObserverPolyfill from 'resize-observer-polyfill'

const vuetify = createVuetify({
  components,
  directives,
})

global.ResizeObserver = ResizeObserverPolyfill

interface RenderOptionsArgs {
  props: Record<string, unknown>
  slots: Record<string, (...args: unknown[]) => unknown>

  router?: Router
  initialRoute: RouteLocationRaw

  initialState: Record<string, unknown>
  stubActions: boolean
}

export function renderOptions(args: Partial<RenderOptionsArgs> = {}) {
  const result = {
    props: args.props,
    slots: args.slots,
    global: {
      plugins: [vuetify, router],
    },
  }

  return result
}

export function wrapTestComponent(component: any) {
  return {
    components: { 'test-component': component },
    template: `
        <v-app>
          <v-main>
            <test-component />
          </v-main>
        </v-app>
        `,
  }
}
