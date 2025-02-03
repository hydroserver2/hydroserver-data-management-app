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
import { api } from '@/services/api'
import { computed, onMounted, ref } from 'vue'
import { Snackbar } from '@/utils/notifications'

const connectedProviders = ref()

const hydroShareProvider = computed(() => {
  if (!connectedProviders.value?.data) return false
  return connectedProviders.value.data.find(
    (item: any) => item.provider.id === 'hydroshare'
  )
})

const isConnected = computed(() => !!hydroShareProvider.value)

const connectHydroShare = async () => {
  const callbackUrl = `${import.meta.env.VITE_APP_PROXY_BASE_URL}/profile`
  api.providerRedirect('hydroshare', callbackUrl, 'connect')
}

async function disconnectHydroShare() {
  try {
    let providerResponse = await api.deleteProvider(
      'hydroshare',
      hydroShareProvider.value?.uid
    )
    Snackbar.info('Your HydroShare account has been disconnected.')
  } catch (error) {
    console.error('Error disconnecting HydroShare account', error)
  }
}

onMounted(async () => {
  connectedProviders.value = await api.fetchConnectedProviders()
})
</script>
