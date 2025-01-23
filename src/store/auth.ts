import { defineStore } from 'pinia'
import { Auth } from '@/types'
import { ref } from 'vue'
import Storage from '@/utils/storage'

export const authStorage = new Storage<Auth>('auth')

export const useAuthStore = defineStore('auth', () => {
  const auth = ref(authStorage.get() || new Auth())

  const setAuth = (authData: Auth) => {
    auth.value = authData
    authStorage.set(authData)
  }

  return {
    auth,
    setAuth,
  }
})
