import { defineStore } from 'pinia'
import { User } from '@/types'
import { ref, computed } from 'vue'
import router from '@/router/router'
import { api } from '@/services/api'
import Storage from '@/utils/storage'

export const userStorage = new Storage<User>('user')

export const useUserStore = defineStore('user', () => {
  const user = ref(userStorage.get() || new User())
  const isLoggedIn = computed(() => !!user.value.email)

  const setUser = (userData: User) => {
    user.value = userData
    userStorage.set(userData)
  }

  async function logout() {
    try {
      await api.logout()
      localStorage.clear()
      sessionStorage.clear()
      user.value = new User()
      await router.push({ name: 'Login' })
    } catch (error) {
      console.error('Error logging out.', error)
    }
  }

  return {
    user,
    setUser,
    isLoggedIn,
    logout,
  }
})
