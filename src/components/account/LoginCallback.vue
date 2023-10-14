<template>
  <v-container class="d-flex justify-center py-8">
    <v-card class="login-card" width="40rem">
      <v-card-title class="mb-4 login-title">You have signed in!</v-card-title>
      <v-card-text>
        <p class="font-weight-regular text-body-1 mt-4">
          You can return to the main page. This window will be closed
          automatically...
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const APP_URL = import.meta.env.VITE_APP_URL

onMounted(async () => {
  const data = {
    accessToken: route.query.t || '',
    refreshToken: route.query.rt || '',
  }
  // window.opener references our original window from where the login popup was opened
  window.opener.postMessage(
    data,
    APP_URL // Important security measure: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
  )
  window.close()
})
</script>

<style scoped lang="scss"></style>
