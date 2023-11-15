import { defineStore } from 'pinia'
import { User } from '@/types'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User>(new User())
    const $reset = () => setUser(new User())
    const setUser = (userData: User) => (user.value = userData)

    return {
      user,
      $reset,
      setUser,
    }
  },
  { persist: true }
)
