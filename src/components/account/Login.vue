<template>
  <v-container class="d-flex align-center justify-center py-8 fill-height">
    <v-card class="login-card" width="40rem">
      <v-card-title class="mb-4 login-title">Sign In</v-card-title>
      <v-card-text>
        <v-btn
          @click="openLogInDialog('google')"
          variant="outlined"
          color="primary"
          prepend-icon="mdi-google"
          :rounded="false"
          block
          class="py-4"
        >
          Continue with Google
        </v-btn>
      </v-card-text>
      <v-card-text>
        <v-btn
          @click="openLogInDialog('orcid')"
          variant="outlined"
          color="primary"
          outlined
          :rounded="false"
          block
          class="py-4"
        >
          <template v-slot:prepend>
            <v-icon class="fa-brands fa-orcid"></v-icon>
          </template>
          Continue with ORCID
        </v-btn>
      </v-card-text>
      <v-divider class="my-8"></v-divider>
      <v-card-text>
        <v-form
          class="login-form"
          ref="form"
          @submit.prevent="loginSubmit"
          v-model="valid"
        >
          <v-text-field
            class="mb-4 email-input"
            label="Email *"
            autofocus
            v-model="email"
            :rules="rules.email"
            type="email"
            name="email"
            validate-on="blur"
          ></v-text-field>
          <v-text-field
            class="mb-4 password-input"
            label="Password *"
            :rules="rules.required"
            v-model="password"
            type="password"
            name="password"
          ></v-text-field>
          <v-btn-primary
            class="login-button mr-4"
            :disabled="!valid"
            type="submit"
            >Log In</v-btn-primary
          >
        </v-form>
      </v-card-text>
      <v-divider class="login-divider"></v-divider>
      <v-card-actions class="text-body-1 signup-link-section">
        <span class="mr-2">Don't have an account?</span>
        <router-link to="/sign-up" class="light-text signup-link"
          >Sign Up</router-link
        >
        <v-spacer></v-spacer>
        <router-link
          to="/password_reset"
          class="light-text forgot-password-link"
          >Forgot your password?</router-link
        >
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import { ref } from 'vue'
import { rules } from '@/utils/rules'
import { OAuthProvider } from '@/types'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const form = ref(null)
const valid = ref(false)

const loginSubmit = async () => {
  if (!valid) return
  await useAuthStore().login(email.value, password.value)
}

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

<style scoped lang="scss"></style>
