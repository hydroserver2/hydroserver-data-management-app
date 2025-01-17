<template>
  <v-row justify="center" v-if="showOAuthOptions">
    <v-col cols="2">
      <v-divider class="mt-3" />
    </v-col>
    <v-col cols="auto" class="text-center"> OR </v-col>
    <v-col cols="2">
      <v-divider class="mt-3" />
    </v-col>
  </v-row>

  <v-row v-for="provider in activeProviders" justify="center">
    <v-col cols="12" sm="8" md="6">
      <v-btn
        @click="OAuthLogin(provider.auth)"
        variant="outlined"
        color="primary"
        :rounded="false"
        block
        class="py-4"
      >
        <v-img
          :src="provider.img"
          class="mr-1"
          width="100%"
          max-width="1.5rem"
          :alt="`${provider.name} icon`"
        />
        Continue with {{ provider.name }}
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { OAuthProvider } from '@/types'
import googleImg from '@/assets/google.png'
import ORCIDImg from '@/assets/orcid.png'
import { computed } from 'vue'
import { api } from '@/services/api'

const disableAccountCreation =
  import.meta.env.VITE_APP_DISABLE_ACCOUNT_CREATION || 'false'
const googleOauthEnabled =
  import.meta.env.VITE_APP_GOOGLE_OAUTH_ENABLED || 'false'
const orcidOauthEnabled =
  import.meta.env.VITE_APP_ORCID_OAUTH_ENABLED || 'false'

const ORCID = { name: 'ORCID', auth: OAuthProvider.orcid, img: ORCIDImg }
const google = { name: 'Google', auth: OAuthProvider.google, img: googleImg }

const activeProviders = computed(() => {
  if (disableAccountCreation === 'true') return []
  const providers = []
  if (googleOauthEnabled === 'true') providers.push(google)
  if (orcidOauthEnabled === 'true') providers.push(ORCID)
  return providers
})

const showOAuthOptions = computed(
  () =>
    (googleOauthEnabled === 'true' || orcidOauthEnabled === 'true') &&
    disableAccountCreation !== 'true'
)

const OAuthLogin = (provider: OAuthProvider) => {
  api.providerRedirect(
    provider,
    `${import.meta.env.VITE_APP_PROXY_BASE_URL}/Sites`,
    'login'
  )
}
</script>
