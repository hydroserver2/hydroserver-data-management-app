<template>
  <v-container class="d-flex align-center justify-center my-8">
    <v-card width="50rem">
      <v-toolbar flat color="secondary">
        <v-card-title color="secondary"> Verify Your Email </v-card-title>
      </v-toolbar>
      <v-divider />

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
        for your account. We've sent an email to {{ user.email }}. Click on the
        link in that message to verify your email address.
        <p>NOTE: The verification email may take several minutes to arrive.</p>

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
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'

const route = useRoute()
const router = useRouter()

const { user, setUser } = useUserStore()

const verifying = ref(false)
const verified = ref(false)
const verificationError = ref(false)

// Resend email status
const resending = ref(false)

onMounted(async () => {
  const key = route.params.key as string | undefined
  if (!key) return

  verifying.value = true
  try {
    const response = await api.verifyEmail(key)
    setUser(response.data.user.profile)
    verified.value = true
    Snackbar.success('Your email has been verified.')
    router.push({ name: 'Sites' })
  } catch (e) {
    console.error('Error verifying email:', e)
    verificationError.value = true
  } finally {
    verifying.value = false
  }
})

async function resend() {
  try {
    resending.value = true
    await api.sendVerificationEmail()
    Snackbar.success('Verification email sent successfully.')
  } catch (err) {
    console.error('Error sending verification email:', err)
    Snackbar.error('Failed to resend verification email.')
  } finally {
    resending.value = false
  }
}
</script>
