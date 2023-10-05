<template>
  <v-container class="d-flex align-center justify-center my-8">
    <div v-if="isActivating">Verifying your email address...</div>
    <!-- <div v-if="wasActivated">Your account has been verified.</div> -->
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import { onMounted } from 'vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const isActivating = ref(false)
const wasActivated = ref(false)

onMounted(async () => {
  isActivating.value = true

  await authStore.activateAccount(
    (route.query.uid as string) || '',
    (route.query.token as string) || ''
  )
  isActivating.value = false
  wasActivated.value = true
})
</script>
