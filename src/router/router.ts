import {
  RouteLocationNormalized,
  createRouter,
  createWebHistory,
} from 'vue-router'
import { routes } from '@/router/routes'
import { useAuthStore } from '@/store/authentication'
import { useThingStore } from '@/store/things'
import Notification from '@/store/notifications'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/** Guards are executed in the order they appear in this array */
const guards: ((
  to: RouteLocationNormalized,
  from?: RouteLocationNormalized,
  next?: (to?: string | object) => void
) => any | null)[] = [
  // Check if the refresh token is expired each page change
  (_to, _from, _next) => {
    const authStore = useAuthStore()
    if (authStore.isRefreshTokenExpired()) {
      authStore.resetState()
      Notification.toast({
        message: 'Session expired. Please login',
        type: 'info',
        duration: 1000,
      })
      return { name: 'Login' }
    }
    return null
  },

  // hasAuthGuard
  (to, _from, _next) => {
    if (to.meta?.hasAuthGuard) {
      const authStore = useAuthStore()

      if (!authStore.isLoggedIn) {
        return { name: 'Login', query: { next: to.name } }
      } else if (!authStore.isVerified) {
        if (!authStore.user.email) {
          return { name: 'CompleteProfile' }
        } else {
          return { name: 'VerifyEmail' }
        }
      }
    }
    return null
  },

  // hasLoggedOutGuard
  (to, _from, _next) => {
    if (to.meta?.hasLoggedOutGuard) {
      const authStore = useAuthStore()

      if (authStore.isLoggedIn) {
        return { name: 'PageNotFound' }
      }
    }
    return null
  },

  // hasUnverifiedAuthGuard
  (to, _from, _next) => {
    if (to.meta?.hasUnverifiedAuthGuard) {
      const authStore = useAuthStore()
      if (authStore.isLoggedIn && authStore.isVerified) {
        return { name: 'PageNotFound' }
      }
    }
    return null
  },

  // hasThingOwnershipGuard
  async (to, _from, _next) => {
    if (to.meta?.hasThingOwnershipGuard) {
      const thingStore = useThingStore()
      const id = to.params.id as string
      await thingStore.fetchThingById(id)
      const thing = thingStore.things[id]
      if (!thing || !thing.ownsThing) {
        return { name: 'PageNotFound' }
      }
    }
    return null
  },

  // https://www.digitalocean.com/community/tutorials/vuejs-vue-router-modify-head
  // Append head tags and update page title
  (to, from, _next) => {
    // This goes through the matched routes from last to first, finding the closest route with a title.
    // e.g., if we have `/some/deep/nested/route` and `/some`, `/deep`, and `/nested` have titles,
    // `/nested`'s will be chosen.
    const nearestWithTitle = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.title)

    // Find the nearest route element with meta tags.
    const nearestWithMeta = to.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags)

    const previousNearestWithMeta = from?.matched
      .slice()
      .reverse()
      .find((r) => r.meta && r.meta.metaTags)

    // If a route with a title was found, set the document (page) title to that value.
    if (nearestWithTitle) {
      document.title = `HydroServer | ${nearestWithTitle.meta.title}`
    } else if (previousNearestWithMeta) {
      document.title = previousNearestWithMeta.meta.title as string
    } else {
      document.title = `HydroServer`
    }

    // Remove any stale meta tags from the document using the key attribute we set below.
    Array.from(document.querySelectorAll('[data-vue-router-controlled]')).map(
      (el) => el.parentNode?.removeChild(el)
    )

    // Skip rendering meta tags if there are none.
    if (!nearestWithMeta) return null

    // Turn the meta tag definitions into actual elements in the head.
    // @ts-ignore
    nearestWithMeta.meta.metaTags
      .map((tagDef: any) => {
        const tag = document.createElement('meta')

        Object.keys(tagDef).forEach((key) => {
          tag.setAttribute(key, tagDef[key])
        })

        // We use this to track which meta tags we create so we don't interfere with other ones.
        tag.setAttribute('data-vue-router-controlled', '')

        return tag
      })
      // Add the meta tags to the document head.
      .forEach((tag: any) => document.head.appendChild(tag))

    return null
  },
]

export function setupRouteGuards() {
  guards.map((fn) => {
    router.beforeEach(async (to, from, next) => {
      const activatedRouteGuard = await fn(to, from, next)
      if (activatedRouteGuard) {
        next(activatedRouteGuard)
      } else {
        next()
      }
    })
  })
}

export default router
