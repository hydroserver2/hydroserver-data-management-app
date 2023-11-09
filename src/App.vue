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
import { setupRouteGuards } from './router/router'

const route = useRoute()
setupRouteGuards()
</script>

<style scoped lang="scss">
.v-main.is-full-screen {
  height: 100vh;
}
</style>

<style>
.is-required .v-label.v-field-label::after {
  display: inline;
  content: '*';
  margin-left: 0.15rem;
}

/* TODO: This needs to be done by overriding SASS variables.
https://vuetifyjs.com/en/features/sass-variables/#sass
https://vuetifyjs.com/en/api/v-tooltip/#sass */
/* Make tooltips easier to read */
.v-tooltip > .v-overlay__content {
  background-color: rgba(var(--v-theme-surface-variant), 1) !important;
  font-size: 1.1em !important;
}
</style>
