<template>
  <v-container class="d-flex align-center justify-center my-8">
    <div v-if="isActivating">Verifying your email address...</div>
    <div v-if="!isActivating && !wasActivated">
      Your email could not be verified.
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'
import router from '@/router/router'
import { useUserStore } from '@/store/user'

const { resetState, setTokens } = useAuthStore()
const { setUser } = useUserStore()
const route = useRoute()
const isActivating = ref(true)
const wasActivated = ref(false)

onMounted(async () => {
  try {
    const uid = (route.query.uid as string) || ''
    const token = (route.query.token as string) || ''
    resetState()

    const data = await api.post(ENDPOINTS.ACCOUNT.ACTIVATE, {
      uid: uid,
      token: token,
    })

    if (!data.user.isVerified) return false
    setUser(data.user)
    setTokens(data.access, data.refresh)
    wasActivated.value = true
    await router.push({ name: 'Sites' })
  } catch (e) {
    console.error('Error activating account', e)
    wasActivated.value = false
  } finally {
    isActivating.value = false
  }
})
</script>
