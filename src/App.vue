<template>
  <v-app>
    <Navbar />
    <v-main class="flex-grow-1" :class="{ 'is-full-screen': isFullScreen }"
      ><router-view
    /></v-main>
    <Footer v-if="!hideFooter" class="flex-grow-0" />
    <Notifications />
  </v-app>
</template>

<script setup lang="ts">
import Navbar from '@/components/base/Navbar.vue'
import Footer from '@/components/base/Footer.vue'
import Notifications from '@/components/base/Notifications.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { onMounted, onUnmounted } from 'vue'

const route = useRoute()

const hideFooter = computed(() => {
  return route.meta.hideFooter
})

const isFullScreen = computed(() => {
  return route.meta.isFullScreen
})

// Check the refresh token every 600,000 milliseconds = 10 minutes
// Logout if the refresh token is expired
const authStore = useAuthStore()
let interval: any
onMounted(() => {
  interval = setInterval(() => {
    authStore.checkTokenExpiry()
  }, 600000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<style scoped lang="scss">
.v-main.is-full-screen {
  height: 100vh;
}
</style>

<style>
/* Make tooltips easier to read */
.v-tooltip > .v-overlay__content {
  background-color: rgba(var(--v-theme-surface-variant), 1) !important;
  font-size: 1.1em !important;
}
</style>
