<template>
  <v-container>
    <AccountForm
      v-if="loaded"
      :has-cancel-button="false"
      :is-edit="true"
      @close="navigateToSites()"
    >
      <template v-slot:header>
        <v-card-title align="center" class="mb-2 signup-title">
          Successfully authenticated!
        </v-card-title>
        <v-card-text align="center" class="my-2">
          Just a few more details and your account will be all set.
        </v-card-text>
      </template>
    </AccountForm>
  </v-container>
</template>

<script setup lang="ts">
import AccountForm from '@/components/account/AccountForm.vue'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authentication'
import { useUserStore } from '@/store/user'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router/router'

const route = useRoute()
const { setUser } = useUserStore()
const { setTokens } = useAuthStore()
const loaded = ref(false)

const navigateToSites = async () => {
  await router.push({ name: 'Sites' })
}

onMounted(async () => {
  const accessToken = (route.query.t as string) || ''
  const refreshToken = (route.query.rt as string) || ''
  if (accessToken && refreshToken) setTokens(accessToken, refreshToken)

  try {
    const user = await api.fetchUser()
    setUser(user)
  } catch (e) {
    console.error('Error fetching user', e)
  }
  loaded.value = true
})
</script>
