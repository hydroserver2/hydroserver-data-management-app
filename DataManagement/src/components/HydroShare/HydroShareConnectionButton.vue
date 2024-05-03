<template>
  <v-btn
    v-if="!hydroShareConnected"
    color="deep-orange-lighten-1"
    prepend-icon="mdi-link"
    @click="OAuthLogin(OAuthProvider.hydroshare)"
  >
    Connect to HydroShare
  </v-btn>

  <v-btn
    v-else
    color="deep-orange"
    variant="outlined"
    prepend-icon="mdi-close"
    @click="disconnectFromHydroShare"
  >
    Disconnect from HydroShare
  </v-btn>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { api } from '@/services/api'
import { OAuthProvider } from '@shared/types'
import { OAUTH_ENDPOINT } from '@/services/api'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { Snackbar } from '@/utils/notifications'

const { user } = storeToRefs(useUserStore())

const OAuthLogin = async (provider: OAuthProvider) => {
  let token = await api.connectToHydroShare()
  window.location.href = OAUTH_ENDPOINT(provider, token.uid, token.token)
}

async function disconnectFromHydroShare() {
  let response = await api.disconnectFromHydroShare()
  if (response === null) {
    user.value.hydroShareConnected = false
    Snackbar.info('Your HydroShare account has been disconnected.')
  }
}

const hydroShareConnected = computed(() => {
  if (!user.value) return false
  return user.value.hydroShareConnected
})
</script>
