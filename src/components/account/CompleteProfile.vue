<template>
  <v-container>
    <AccountForm :has-cancel-button="false">
      <template v-slot:header>
        <v-card-title>Finish Account Setup</v-card-title>
        <v-card-subtitle
          >We need more information to create your account.</v-card-subtitle
        >
      </template>
    </AccountForm>
  </v-container>
</template>

<script setup lang="ts">
import AccountForm from '@/components/account/AccountForm.vue'
</script>
