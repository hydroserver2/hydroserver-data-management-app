import '@/styles/global.scss'
import 'ol/ol.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import vuetify from '@/plugins/vuetify'
import { createPinia } from 'pinia'
import { injectClarity } from '@/plugins/clarity'
import { settings } from '@/config/settings'
import { createHydroServer } from '@hydroserver/client'

const app = createApp(App)
const pinia = createPinia()

async function initializeApp() {
  app.use(pinia)

  // The session must be initialized before the router because some of the routes
  // depend on the session state for access control - and after the Pinia plugin
  // is installed because the function is kept in a Pinia store.
  await createHydroServer({ host: 'http://127.0.0.1:8000' })

  app.use(router)
  app.use(vuetify)
  settings.analyticsConfiguration.enableClarityAnalytics &&
    settings.analyticsConfiguration.clarityProjectId &&
    injectClarity(settings.analyticsConfiguration.clarityProjectId)
  app.mount('#app')
}

initializeApp()
