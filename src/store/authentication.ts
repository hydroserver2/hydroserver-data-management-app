import { defineStore } from 'pinia'
import { Snackbar } from '@/utils/notifications'
import router from '@/router/router'
import hs from '@hydroserver/client'

export interface AllAuthFlowItem {
  id: string
  providers?: string[]
}

export const useAuthStore = defineStore('authentication', () => {
  const login = async () => {
    try {
      Snackbar.success('You have logged in!')
      await router.push({ name: 'Sites' })
    } catch (e) {
      console.log('Failed to fetch user info')
    }
  }

  let loggingOut = false
  async function logout() {
    if (loggingOut) return
    try {
      loggingOut = true
      await hs.session.logout()
      await router.push({ name: 'Login' })
    } catch (error) {
      console.error('Error logging out.', error)
    } finally {
      loggingOut = false
    }
  }

  return {
    login,
    logout,
  }
})
