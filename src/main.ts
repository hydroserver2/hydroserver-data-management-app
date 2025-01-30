import '@/styles/global.scss'

import { createApp } from 'vue'
import store from './store'
import App from './App.vue'
import router from './router/router'
import vuetify from '@/plugins/vuetify'
import { useAuthStore } from '@/store/authentication'
import { api } from './services/api'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'

const app = createApp(App)

/**
 * Fetches the allowed OAuth methods for this instance of HydroServer and fetches the user.
 */
async function initializeSession() {
  console.log('Initializing session')

  const { isAuthenticated, isAccountPending, oAuthProviders, signupEnabled } =
    storeToRefs(useAuthStore())
  const {} = storeToRefs(useUserStore())

  try {
    const [authMethodsResponse, sessionResponse] = await Promise.all([
      api.fetchAuthMethods(),
      api.fetchSession(),
    ])

    // Process OAuth methods
    oAuthProviders.value = authMethodsResponse.providers
    signupEnabled.value = authMethodsResponse.hydroserverSignupEnabled

    // Process session
    isAuthenticated.value = sessionResponse?.meta?.is_authenticated

    const flows = sessionResponse?.data?.flows || []
    if (flows.length <= 0) return
    const needsProfileCompletion = flows.some(
      (f: any) => f.id === 'provider_signup'
    )

    if (sessionResponse.status === 401 && needsProfileCompletion) {
      isAccountPending.value = true
      await router.push({ name: 'CompleteProfile' })
    }
  } catch (error) {
    console.error('Failed to initialize session', error)
  }
}

async function initializeApp() {
  app.use(store)

  // The session must be initialized before the router because some of the routes
  // depend on the session state for access control.
  await initializeSession()
  app.use(router)
  app.use(vuetify)
  app.mount('#app')
}

initializeApp()
