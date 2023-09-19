import { defineStore } from 'pinia'
import router from '@/router/router'
import { User } from '@/types'
import { Subject } from 'rxjs'
import Notification from './notifications'
import { useResetStore } from '@/store/resetStore'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useAuthStore = defineStore({
  id: 'authentication',
  state: () => ({
    access_token: '',
    refresh_token: '',
    user: new User(),
    sendingVerificationEmail: false,
    isLoginListenerSet: false,
    loggedIn$: new Subject<void>(),
  }),
  getters: {
    isLoggedIn: (state) => !!state.access_token,
    isVerified: (state) => state.user.isVerified,
  },
  actions: {
    resetState() {
      useResetStore().all()
      localStorage.clear()
    },
    async login(email: string, password: string) {
      try {
        this.resetState()
        const tokens = await api.post(ENDPOINTS.ACCOUNT.JWT_PAIR, {
          email: email,
          password: password,
        })

        this.access_token = tokens.access
        this.refresh_token = tokens.refresh
        const user = await api.fetch(ENDPOINTS.USER)
        if (!user) return

        this.user = user
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error logging in', error)
      }
    },
    async logout() {
      try {
        await router.push({ name: 'Login' })
        this.resetState()
      } catch (error) {
        console.error('Error logging out', error)
      }
    },
    async createUser(user: User) {
      try {
        const data = await api.post(ENDPOINTS.USER, user)
        useResetStore().things()
        this.user = data.user
        this.access_token = data.access
        this.refresh_token = data.refresh
        await router.push({ name: 'VerifyEmail' })
      } catch (error) {
        console.error('Error creating user', error)
      }
    },
    async sendVerificationEmail() {
      try {
        if (this.sendingVerificationEmail) return
        this.sendingVerificationEmail = true
        await api.post(ENDPOINTS.ACCOUNT.SEND_VERIFICATION_EMAIL)
        this.sendingVerificationEmail = false
      } catch (error) {
        console.error('Error sending verification email', error)
      }
    },
    async activateAccount(uid: string, token: string) {
      try {
        const data = await api.post(ENDPOINTS.ACCOUNT.ACTIVATE, {
          uid: uid,
          token: token,
        })
        if (!data.user.isVerified) return
        this.user = data.user
        this.access_token = data.access
        this.refresh_token = data.refresh
        await router.push({ name: 'Sites' })
      } catch (error) {
        console.error('Error activating account', error)
      }
    },
    async updateUser(user: User) {
      try {
        const data = await api.patch(ENDPOINTS.USER, user, this.user)
        // things.organizations could be affected for many things so just invalidate cache
        useResetStore().things()
        this.user = data as User
      } catch (error) {
        console.error('Error updating user', error)
      }
    },
    async deleteAccount() {
      try {
        await api.delete(ENDPOINTS.USER)
        await this.logout()
      } catch (error) {
        console.error('Error deleting account', error)
      }
    },
    async requestPasswordReset(email: String) {
      try {
        return await api.post(ENDPOINTS.USER.SEND_RESET_EMAIL, {
          email: email,
        })
      } catch (error) {
        console.error('Error requesting password reset', error)
      }
    },
    async resetPassword(uid: string, token: string, password: string) {
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
    },
    async OAuthLogin(backend: string, callback?: () => any) {
      let OAuthUrl: string = ''

      if (backend === 'google') {
        OAuthUrl = '/api/account/google/login'
      } else if (backend === 'orcid') {
        OAuthUrl = '/api/account/orcid/login'
      }

      window.open(OAuthUrl, '_blank')

      this.isLoginListenerSet = false

      if (!this.isLoginListenerSet) {
        this.isLoginListenerSet = true // Prevents registering the listener more than once
        console.info(`User: listening to login window...`)
        window.addEventListener('message', async (event: MessageEvent) => {
          console.log(event)
          if (
            // event.origin !== APP_URL ||
            !event.data.hasOwnProperty('access')
          ) {
            return
          }

          if (event.data.access) {
            console.log(event)

            this.access_token = event.data.access
            this.refresh_token = event.data.refresh
            this.user = event.data.user
            await router.push({ name: 'Sites' })

            Notification.toast({
              message: 'You have logged in!',
              type: 'success',
            })
            // await User.commit((state) => {
            //   state.isLoggedIn = true
            //   state.accessToken = event.data.accessToken
            // })
            this.loggedIn$.next()
            this.isLoginListenerSet = false
            callback?.()
          } else {
            Notification.toast({
              message: 'Failed to Log In',
              type: 'error',
            })
          }
        })
      }
    },
  },
})
