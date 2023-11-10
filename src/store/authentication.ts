import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { User, OAuthProvider } from '@/types'
import { Subject } from 'rxjs'
import { useResetStore } from '@/store/resetStore'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'
import Notification from './notifications'
import router from '@/router/router'

const APP_URL = import.meta.env.VITE_APP_URL
let OAuthLoginController = new AbortController()
import jwtDecode from 'jwt-decode'

interface JWTPayload {
  exp: number
}

export const useAuthStore = defineStore(
  'authentication',
  () => {
    const accessToken = ref('')
    const refreshToken = ref('')
    const user = ref<User>(new User())
    const loggedIn$ = new Subject<void>()
    let sendingVerificationEmail = false

    const isLoggedIn = computed(() => !!accessToken.value)
    const isVerified = computed(() => user.value.isVerified)

    function $reset() {
      accessToken.value = ''
      refreshToken.value = ''
      user.value = new User()
    }

    function resetState() {
      const resetStore = useResetStore()
      resetStore.all()
      localStorage.clear()
    }

    async function login(email: string, password: string) {
      try {
        resetState()
        const tokens = await api.post(ENDPOINTS.ACCOUNT.JWT_PAIR, {
          email: email,
          password: password,
        })

        accessToken.value = tokens.access
        refreshToken.value = tokens.refresh
        const data = await api.fetch(ENDPOINTS.USER)
        if (!data) return

        user.value = data
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error logging in.', error)
      }
    }

    async function logout() {
      try {
        resetState()
        router.push({ name: 'Login' })
      } catch (error) {
        console.error('Error logging out.', error)
      }
    }

    function isRefreshTokenExpired() {
      if (!isLoggedIn.value || !refreshToken.value) return false

      try {
        const decodedToken = jwtDecode(refreshToken.value) as JWTPayload
        const currentTime = Date.now() / 1000
        return decodedToken.exp < currentTime
      } catch (e) {
        console.error('Invalid refresh token:', e)
        return true
      }
    }

    async function createUser(user: User) {
      try {
        resetState()
        const data = await api.post(ENDPOINTS.USER, user)
        user = data.user
        accessToken.value = data.access
        refreshToken.value = data.refresh
        await router.push({ name: 'VerifyEmail' })
      } catch (error) {
        console.error('Error creating user', error)
      }
    }

    async function sendVerificationEmail() {
      try {
        if (sendingVerificationEmail) return
        sendingVerificationEmail = true
        await api.post(ENDPOINTS.ACCOUNT.SEND_VERIFICATION_EMAIL)
        sendingVerificationEmail = false
      } catch (error) {
        console.error('Error sending verification email', error)
      }
    }

    async function activateAccount(uid: string, token: string) {
      try {
        resetState()
        const data = await api.post(ENDPOINTS.ACCOUNT.ACTIVATE, {
          uid: uid,
          token: token,
        })
        if (!data.user.isVerified) {
          return false
        }
        user.value = data.user
        accessToken.value = data.access
        refreshToken.value = data.refresh
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error activating account', error)
        throw error
      }
    }

    async function updateUser(user: User) {
      try {
        const data = await api.patch(ENDPOINTS.USER, user, user)
        // things.organizations won't automatically update so invalidate cache
        const resetStore = useResetStore()
        resetStore.things()
        user = data as User
        if (!user.isVerified) {
          await router.push({ name: 'VerifyEmail' })
        } else {
          Notification.toast({
            message: 'Your changes have been saved.',
            type: 'success',
          })
        }
      } catch (error) {
        console.error('Error updating user', error)
      }
    }

    async function deleteAccount() {
      try {
        await api.delete(ENDPOINTS.USER)
        await logout()
      } catch (error) {
        console.error('Error deleting account', error)
      }
    }

    async function requestPasswordReset(email: String) {
      try {
        return await api.post(ENDPOINTS.USER.SEND_RESET_EMAIL, {
          email: email,
        })
      } catch (error) {
        console.error('Error requesting password reset', error)
      }
    }

    async function resetPassword(uid: string, token: string, password: string) {
      try {
        await api.post(ENDPOINTS.USER.RESET_PASSWORD, {
          uid: uid,
          token: token,
          password: password,
        })
        await router.push({ name: 'Login' })
      } catch (error) {
        console.error('Error resetting password', error)
      }
    }

    async function OAuthLogin(provider: OAuthProvider, callback?: () => any) {
      const handleMessage = async (event: MessageEvent) => {
        if (
          event.origin !== APP_URL ||
          !event.data.hasOwnProperty('accessToken')
        ) {
          return
        }

        if (event.data.accessToken) {
          accessToken.value = event.data.accessToken
          refreshToken.value = event.data.refreshToken

          try {
            const data = await api.fetch(ENDPOINTS.USER)

            if (!data) return
            user.value = data

            Notification.toast({
              message: 'You have logged in!',
              type: 'success',
            })
            loggedIn$.next()
            callback?.()
          } catch (e) {
            console.log('Failed to Log In')
          }
        } else {
          Notification.toast({
            message: 'Failed to Log In',
            type: 'error',
          })
        }
      }

      window.open(
        ENDPOINTS.ACCOUNT.OAUTH_LOGIN(provider),
        '_blank',
        'noopener=false'
      )

      console.info(`User: listening to login window...`)

      // We need to re-instantiate the listener so that it uses current values in `handleMessage`
      OAuthLoginController.abort()
      OAuthLoginController = new AbortController()
      window.addEventListener('message', handleMessage, {
        signal: OAuthLoginController.signal, // Used to remove the listener
      })
    }

    return {
      accessToken,
      refreshToken,
      user,
      isLoggedIn,
      isVerified,
      resetState,
      login,
      logout,
      isRefreshTokenExpired,
      createUser,
      sendVerificationEmail,
      activateAccount,
      updateUser,
      deleteAccount,
      requestPasswordReset,
      resetPassword,
      OAuthLogin,
      $reset,
    }
  },
  {
    persist: true,
  }
)
