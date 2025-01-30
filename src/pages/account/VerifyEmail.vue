<template>
  <v-container class="d-flex align-center justify-center my-8">
    <v-card width="50rem">
      <v-toolbar flat color="secondary">
        <v-card-title color="secondary"> Verify Your Email </v-card-title>
      </v-toolbar>

      <v-card-text v-if="verifying">
        Verifying your email address...
      </v-card-text>
      <v-card-text v-else-if="verified">
        Your email has been verified! You can now continue using HydroServer.
      </v-card-text>
      <v-card-text v-else-if="verificationError">
        <p class="text-error">Your email could not be verified.</p>
        <p>Please try resending or contact support.</p>
      </v-card-text>
      <v-card-text v-else>
        Before you continue, we need to verify the email address you provided
        for your account. We've sent an email with a verification code to
        {{ user.email }}. Please enter the code below.
        <v-text-field
          v-model="verificationCode"
          label="Verification Code"
          type="text"
          :rules="rules.required"
          class="mt-4"
        />
        <v-btn :disabled="verifying || resending" @click="verifyCode">
          Verify Code
        </v-btn>
        <v-divider class="my-4" />

        <span class="mr-2">Didn't receive a verification email?</span>
        <v-btn
          :disabled="resending"
          color="primary"
          variant="text"
          @click="resend"
        >
          Resend Email
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'
import { rules } from '@/utils/rules'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/authentication'

const router = useRouter()

const { user } = storeToRefs(useUserStore())
const { isAuthenticated } = storeToRefs(useAuthStore())

const verifying = ref(false)
const verified = ref(false)
const verificationError = ref(false)
const verificationCode = ref('')
const resending = ref(false)

const verifyCode = async () => {
  if (!verificationCode.value) {
    Snackbar.error('Please enter the verification code.')
    return
  }

  try {
    verifying.value = true
    const response = await api.verifyEmailWithCode(verificationCode.value)
    console.log('verify email response', response)
    user.value = response.data.user.account
    isAuthenticated.value = response.meta.is_authenticated
    verified.value = true
    Snackbar.success('Your email has been verified.')
    router.push({ name: 'Sites' })
  } catch (e) {
    console.error('Error verifying email:', e)
    verificationError.value = true
  } finally {
    verifying.value = false
  }
}

async function resend() {
  try {
    resending.value = true
    const response = await api.sendVerificationEmail(user.value.email)
    Snackbar.success('Verification email resent.')
  } catch (err) {
    console.error('Error sending verification email:', err)
    Snackbar.error('Failed to resend verification email.')
  } finally {
    resending.value = false
  }
}
</script>
