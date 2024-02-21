<template>
  <v-container>
    <UserInfoTable />

    <v-btn-primary class="mr-6" @click="openForm = true">
      Edit account
    </v-btn-primary>
    <HydroShareConnectionButton />
    <v-btn-delete @click="openDelete = true"> Delete Account</v-btn-delete>
  </v-container>

  <v-dialog v-model="openForm" width="40rem">
    <AccountForm @close="openForm = false" :is-edit="true" />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteAccountCard @close="openDelete = false" />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AccountForm from '@/components/account/AccountForm.vue'
import UserInfoTable from '@/components/account/UserInfoTable.vue'
import DeleteAccountCard from '@/components/account/DeleteAccountCard.vue'
import HydroShareConnectionButton from '@/components/account/HydroShareConnectionButton.vue'

const openDelete = ref(false)
const openForm = ref(false)
</script>
