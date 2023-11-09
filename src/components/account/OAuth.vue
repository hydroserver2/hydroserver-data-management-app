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
import { useAuthStore } from '@/store/authentication'
import { OAuthProvider } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import googleImg from '@/assets/google.png'
const route = useRoute()
const router = useRouter()

const openLogInDialog = async (provider: OAuthProvider) => {
  await useAuthStore().OAuthLogin(provider, onLoggedIn)
}

const onLoggedIn = () => {
  if (route.query.next) {
    router.push({ name: route.query.next as string })
  } else {
    router.push({ name: 'Sites' })
  }
}
</script>
