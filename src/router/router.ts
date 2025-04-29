import {
  RouteLocationNormalized,
  RouteRecordNormalized,
  createRouter,
  createWebHistory,
} from 'vue-router'
import { routes } from '@/router/routes'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/authentication'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Updates the document title based on the nearest route with a title meta field.
 */
function updateDocumentTitle(matched: RouteRecordNormalized[]): void {
  const nearestWithTitle = matched
    .slice()
    .reverse()
    .find((route) => route.meta && route.meta.title)

  if (nearestWithTitle) {
    document.title = `HydroServer | ${nearestWithTitle.meta.title}`
  } else {
    document.title = 'HydroServer'
  }
}

router.beforeEach(
  async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    const { isAuthenticated, inProviderSignupFlow, inEmailVerificationFlow } =
      storeToRefs(useAuthStore())
    if (inEmailVerificationFlow.value && to.name !== 'VerifyEmail') {
      if (to.name === 'ResetPassword') return { name: 'ResetPassword' }
      return { name: 'VerifyEmail' }
    }
    if (!inEmailVerificationFlow.value && to.name === 'VerifyEmail')
      return { name: 'Sites' }

    if (inProviderSignupFlow.value && to.name !== 'CompleteProfile')
      return { name: 'CompleteProfile' }
    if (!inProviderSignupFlow.value && to.name === 'CompleteProfile')
      return { name: 'Sites' }

    if (isAuthenticated.value && to.meta.requiresLoggedOut)
      return { name: 'Sites' }
    if (!isAuthenticated.value && to.meta.requiresAuth)
      return { name: 'Login', query: { next: to.fullPath } }
  }
)

router.afterEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    updateDocumentTitle(to.matched)
  }
)

export default router
