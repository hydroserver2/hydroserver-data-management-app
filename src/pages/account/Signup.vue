<template>
  <v-container>
    <div width="40rem">
      <AccountForm :has-cancel-button="false">
        <template v-slot:header>
          <v-card-title align="center" class="mb-2 signup-title">
            Sign Up
          </v-card-title>
          <v-card-text align="center" class="my-2">
            Note that all provided information besides your password will be
            publicly viewable. This helps with communication and data integrity.
          </v-card-text>
        </template>
      </AccountForm>
    </div>

    <v-row justify="center" class="mt-6">
      <span class="mr-2">Already have an account?</span>
      <router-link to="/login">Sign In</router-link>
    </v-row>

    <OAuth />

    <div class="mb-10"></div>
  </v-container>
</template>

<script setup lang="ts">
import AccountForm from '@/components/account/AccountForm.vue'
import OAuth from '@/components/account/OAuth.vue'
</script>
