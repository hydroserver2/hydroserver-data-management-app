<template>
  <v-container class="d-flex align-center justify-center my-8">
    <v-card width="50rem">
      <v-card-title>Verify Your Email</v-card-title>
      <v-divider />

      <v-card-text>
        <!-- If we're verifying right now -->
        <div v-if="verifying">
          <p>Verifying your email address...</p>
        </div>

        <!-- If verification succeeded -->
        <div v-else-if="verified">
          <p>Your email has been verified!</p>
          <p>You can now continue using HydroServer.</p>
        </div>

        <!-- If verification failed -->
        <div v-else-if="verificationError">
          <p class="text-error">Your email could not be verified.</p>
          <p>Please try resending or contact support.</p>
        </div>

        <!-- If we're just telling them to check their email (no key) -->
        <div v-else>
          <p>
            Before you continue, we need to verify the email address you
            provided for your account. We've sent an email to
            <b>{{ user.email }}</b
            >.
          </p>
          <p>Click on the link in that message to verify your email address.</p>
          <p>
            NOTE: The verification email may take several minutes to arrive.
          </p>

          <v-divider class="my-4" />

          <p class="text-body-2 text-medium-emphasis">
            <span class="mr-2">Didn't receive a verification email?</span>
            <v-btn
              :disabled="resending"
              color="default"
              variant="text"
              @click="resend"
            >
              Resend Email
            </v-btn>
          </p>
        </div>
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
    const result = await api.verifyEmail(key)
    // TODO: AllAuth will make the user
    // login again after verification.
    // modify so that this message is still shown.

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
