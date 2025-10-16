import '@/styles/global.scss'
import 'ol/ol.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router'
import vuetify from '@/plugins/vuetify'
import { createPinia } from 'pinia'
import { injectClarity } from '@/plugins/clarity'
import { settings } from '@/config/settings'
import hs, { createHydroServer } from '@hydroserver/client'
import { useVocabularyStore } from './composables/useVocabulary'
import { useWorkspaceStore } from '@/store/workspaces'

const app = createApp(App)
const pinia = createPinia()

async function initializeApp() {
  app.use(pinia)

  // The session must be initialized before the router because some of the routes depend on the session state for access control
  await createHydroServer({ host: 'http://127.0.0.1:8000' })

  const vocabularyStore = useVocabularyStore()
  await Promise.all([vocabularyStore.fetchAllVocabularies()])

  if (hs.session.isAuthenticated) {
    try {
      const workspacesResponse = await hs.workspaces.listAllItems({
        is_associated: true,
        expand_related: true,
      })
      const { setWorkspaces } = useWorkspaceStore()
      setWorkspaces(workspacesResponse)
    } catch (error) {
      console.error('Error fetching workspaces', error)
    }
  }

  app.use(router)
  app.use(vuetify)
  settings.analyticsConfiguration.enableClarityAnalytics &&
    settings.analyticsConfiguration.clarityProjectId &&
    injectClarity(settings.analyticsConfiguration.clarityProjectId)
  app.mount('#app')
}

initializeApp()
