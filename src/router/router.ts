import {
  RouteLocationNormalized,
  RouteRecordNormalized,
  createRouter,
  createWebHistory,
} from 'vue-router'
import { routes } from '@/router/routes'
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { api } from '@/services/api'
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
    const { isAuthenticated, isAccountPending } = storeToRefs(useAuthStore())

    if (isAuthenticated.value) {
      if (isAccountPending.value && to.name !== 'CompleteProfile') {
        return { name: 'CompleteProfile' }
      } else if (!isAccountPending.value && to.name === 'CompleteProfile') {
        console.log('redirecting to sites')
        return { name: 'Sites' }
      }

      // Prevent navigation to login and signup page if we're already logged in
      if (to.meta.requiresLoggedOut) return { name: 'PageNotFound' }
    } else {
      if (to.meta.requiresAuth) {
        return { name: 'Login', query: { next: to.fullPath } }
      }
    }

    if (to.meta.requiresThingOwnership) {
      const thing = await api.fetchThing(to.params.id as string)
      if (!thing?.ownsThing) return { name: 'PageNotFound' }
    }
  }
)

router.afterEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    updateDocumentTitle(to.matched)
  }
)

export default router
