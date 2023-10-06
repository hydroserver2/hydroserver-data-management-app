<template>
  <v-app>
    <Navbar v-if="!route.meta.hideNavBar" />

    <v-main
      class="flex-grow-1"
      :class="{ 'is-full-screen': route.meta.isFullScreen }"
      ><router-view
    /></v-main>

    <Footer v-if="!route.meta.hideFooter" class="flex-grow-0" />
    <Notifications />
    <link
      href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900"
      rel="stylesheet"
    />
  </v-app>
</template>

<script setup lang="ts">
import Navbar from '@/components/base/Navbar.vue'
import Footer from '@/components/base/Footer.vue'
import Notifications from '@/components/base/Notifications.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/store/authentication'
import { onMounted, onUnmounted } from 'vue'
import { setupRouteGuards } from './router/router'

const route = useRoute()
setupRouteGuards()

// Check the refresh token every 600,000 milliseconds = 10 minutes
// Logout if the refresh token is expired
const authStore = useAuthStore()
let interval: any

// TODO: this is bad practice. This behavior should be replaced with vue-idle (https://www.npmjs.com/package/idle-vue) and token refresh backend support
onMounted(() => {
  interval = setInterval(() => {
    console.log('Checking token')
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

:deep(.is-required .v-label.v-field-label)::after {
  display: inline;
  content: '*';
  margin-left: 0.15rem;
}
</style>

<style>
/* TODO: This needs to be done by overriding SASS variables.
https://vuetifyjs.com/en/features/sass-variables/#sass
https://vuetifyjs.com/en/api/v-tooltip/#sass */
/* Make tooltips easier to read */
.v-tooltip > .v-overlay__content {
  background-color: rgba(var(--v-theme-surface-variant), 1) !important;
  font-size: 1.1em !important;
}
</style>
