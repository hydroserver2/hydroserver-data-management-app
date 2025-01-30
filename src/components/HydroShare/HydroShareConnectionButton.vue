<template>
  <v-btn
    v-if="!isConnected"
    color="deep-orange-lighten-1"
    prepend-icon="mdi-link"
    @click="connectHydroShare"
  >
    Connect to HydroShare
  </v-btn>

  <v-btn
    v-else
    color="deep-orange"
    variant="outlined"
    prepend-icon="mdi-close"
    @click="disconnectHydroShare"
  >
    Disconnect from HydroShare
  </v-btn>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { api } from '@/services/api'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const { user } = storeToRefs(useUserStore())

const isConnected = computed(() => {
  if (!user.value) return false
  return user.value.hydroShareConnected
})

const connectHydroShare = async () => {
  // TODO: Verify this works with AllAuth flow
  api.providerRedirect(
    'hydroshare',
    `${import.meta.env.VITE_APP_PROXY_BASE_URL}/Sites`,
    'connect'
  )
}

async function disconnectHydroShare() {
  // TODO: Add disconnect functionality
  // let response = await api.disconnectFromHydroShare()
  // if (response === null) {
  // Snackbar.info('Your HydroShare account has been disconnected.')
  // }
}
</script>
