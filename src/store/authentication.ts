import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router/router'
import Storage from '@/utils/storage'

interface JWTPayload {
  exp: number
}

export const accessTokenStorage = new Storage<string>('accessToken')
export const refreshTokenStorage = new Storage<string>('refreshToken')

export const useAuthStore = defineStore('authentication', () => {
  const accessToken = ref<string>(accessTokenStorage.get() || '')
  const refreshToken = ref<string>(refreshTokenStorage.get() || '')
  const isLoggedIn = computed(() => !!accessToken.value)

  function setTokens(access: string, refresh: string) {
    accessToken.value = access
    refreshToken.value = refresh
    accessTokenStorage.set(access)
    refreshTokenStorage.set(refresh)
  }

  async function logout() {
    try {
      setTokens('', '')
      localStorage.clear()
      sessionStorage.clear()
      router.push({ name: 'Login' })
    } catch (error) {
      console.error('Error logging out.', error)
    }
  }

  return {
    accessToken,
    refreshToken,
    isLoggedIn,
    setTokens,
    logout,
  }
})
