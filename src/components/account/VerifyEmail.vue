<template>
  <v-container
    v-if="authStore.user.email"
    class="d-flex align-center justify-center my-8"
  >
    <v-card width="50rem">
      <v-card-title class="signup-title">Verify Your Email</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>
          Before you continue, we need to verify the email address you provided
          for your account. We've sent an email to
          <b>{{ authStore.user.email }}</b
          >.
        </p>
        <br />
        <p>
          Click on the link in that message to verify your email address and
          activate your HydroServer account.
        </p>
        <br />
        <p>
          NOTE: The verification email may take several minutes to arrive in
          your inbox.
        </p>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text class="text-body-2 text-medium-emphasis">
        <span class="mr-2">Didn't receive a verification email?</span>
        <v-btn
          :disabled="authStore.sendingVerificationEmail"
          color="default"
          variant="text"
          @click="authStore.sendVerificationEmail()"
        >
          Resend Email
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
  <v-container v-else>
    <AccountModal title="Finish Account Setup" :is-modal="false" />
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/authentication'
import AccountModal from '@/components/account/AccountModal.vue'

const authStore = useAuthStore()
</script>
