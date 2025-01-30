import { defineStore } from 'pinia'
import { ref } from 'vue'
import { OAuthProvider } from '@/types'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import router from '@/router/router'

export const useAuthStore = defineStore('authentication', () => {
  const isAuthenticated = ref(false)
  const isAccountPending = ref(false)

  /**
   * Determines if signing up on the website is available at all.
   * Some organizations will want an admin signing up for their users
   * to be the only way to create an account.
   *
   * Not to be confused with `oAuthProviders.signupEnabled` that tells us if
   * that particular OAuth service can be used to create an account.
   */
  const signupEnabled = ref(false)

  /**
   * An array of OAuth providers that the user can use to authenticate.
   * In some cases, such as HydroShare, this allows connecting to the provider
   * for data archival instead of direct authentication.
   *
   * This array determines which buttons are available on the login and signup pages.
   */
  const oAuthProviders = ref<OAuthProvider[]>([])

  const login = async () => {
    try {
      Snackbar.success('You have logged in!')
      await router.push({ name: 'Sites' })
    } catch (e) {
      console.log('Failed to fetch user info')
    }
  }

  async function logout() {
    try {
      await api.logout()
      isAuthenticated.value = false
      localStorage.clear()
      sessionStorage.clear()
      await router.push({ name: 'Login' })
    } catch (error) {
      console.error('Error logging out.', error)
    }
  }

  return {
    oAuthProviders,
    signupEnabled,
    isAuthenticated,
    isAccountPending,
    login,
    logout,
  }
})
