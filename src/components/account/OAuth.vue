<template>
  <v-row justify="center">
    <v-col cols="2">
      <v-divider class="mt-3" />
    </v-col>
    <v-col cols="auto" class="text-center"> OR </v-col>
    <v-col cols="2">
      <v-divider class="mt-3" />
    </v-col>
  </v-row>

  <v-row justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-btn
        @click="openLogInDialog(OAuthProvider.google)"
        variant="outlined"
        color="primary"
        :rounded="false"
        block
        class="py-4"
      >
        <v-img
          :src="googleImg"
          class="fill-width mr-1"
          max-width="1.5rem"
          alt="SensorThings Database Schema"
        ></v-img>
        Continue with Google
      </v-btn>
    </v-col>
  </v-row>

  <v-row justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-btn
        @click="openLogInDialog(OAuthProvider.orcid)"
        variant="outlined"
        color="primary"
        outlined
        :rounded="false"
        block
        class="py-4"
      >
        <template v-slot:prepend>
          <v-icon
            color="#afd253"
            size="1.5rem"
            class="mb-1 fa-brands fa-orcid"
          ></v-icon>
        </template>
        Continue with ORCID
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { OAuthProvider } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import { ENDPOINTS } from '@/constants'
import Notification from '@/store/notifications'
import googleImg from '@/assets/google.png'
import { useAuthStore } from '@/store/authentication'
import { useUserStore } from '@/store/user'
import { api } from '@/services/apiMethods'

const APP_URL = import.meta.env.VITE_APP_URL
let OAuthLoginController = new AbortController()

const route = useRoute()
const router = useRouter()

const { setTokens } = useAuthStore()
const { setUser } = useUserStore()

const openLogInDialog = async (provider: OAuthProvider) => {
  await OAuthLogin(provider, onLoggedIn)
}

const onLoggedIn = () => {
  if (route.query.next) {
    router.push({ name: route.query.next as string })
  } else {
    router.push({ name: 'Sites' })
  }
}

async function OAuthLogin(provider: OAuthProvider, callback?: () => any) {
  const handleMessage = async (event: MessageEvent) => {
    if (event.origin !== APP_URL || !event.data.hasOwnProperty('accessToken')) {
      return
    }

    if (event.data.accessToken) {
      setTokens(event.data.accessToken, event.data.refreshToken)
      try {
        const user = await api.fetch(ENDPOINTS.USER)
        setUser(user)

        Notification.toast({
          message: 'You have logged in!',
          type: 'success',
        })
        callback?.()
      } catch (e) {
        console.log('Failed to Log In')
      }
    } else {
      Notification.toast({
        message: 'Failed to Log In',
        type: 'error',
      })
    }
  }

  window.open(
    ENDPOINTS.ACCOUNT.OAUTH_LOGIN(provider),
    '_blank',
    'noopener=false'
  )

  console.info(`User: listening to login window...`)

  // We need to re-instantiate the listener so that it uses current values in `handleMessage`
  OAuthLoginController.abort()
  OAuthLoginController = new AbortController()
  window.addEventListener('message', handleMessage, {
    signal: OAuthLoginController.signal, // Used to remove the listener
  })
}
</script>
