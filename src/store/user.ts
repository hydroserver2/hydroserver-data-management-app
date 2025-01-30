import { defineStore } from 'pinia'
import { User } from '@/types'
import { ref } from 'vue'
// import Storage from '@/utils/storage'
// export const userStorage = new Storage<User>('user')

export const useUserStore = defineStore('user', () => {
  const user = ref<User>(new User())

  return {
    user,
  }
})
