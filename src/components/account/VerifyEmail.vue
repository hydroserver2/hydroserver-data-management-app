<template>
  <v-container class="d-flex align-center justify-center my-8">
    <v-card width="50rem">
      <v-card-title class="signup-title">Verify Your Email</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <p>
          Before you continue, we need to verify the email address you provided
          for your account. We've sent an email to
          <b>{{ user?.email }}</b
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
          :disabled="sendingVerificationEmail"
          color="default"
          variant="text"
          @click="sendVerificationEmail()"
        >
          Resend Email
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { ENDPOINTS } from '@/constants'
import { api } from '@/services/apiMethods'
import { storeToRefs } from 'pinia'

const { user } = storeToRefs(useUserStore())
let sendingVerificationEmail = false

async function sendVerificationEmail() {
  try {
    if (sendingVerificationEmail) return
    sendingVerificationEmail = true
    await api.post(ENDPOINTS.ACCOUNT.SEND_VERIFICATION_EMAIL)
    sendingVerificationEmail = false
  } catch (error) {
    console.error('Error sending verification email', error)
  }
}
</script>
