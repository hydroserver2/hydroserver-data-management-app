<template>
  <v-container>
    <UserInfoTable />
    <OrganizationTable />

    <v-row class="mb-8">
      <v-col v-if="isHydroShareConnectionEnabled">
        <HydroShareConnectionButton />
      </v-col>

      <v-spacer />

      <v-col cols="auto">
        <v-btn-secondary prepend-icon="mdi-pencil" @click="openForm = true">
          Edit account
        </v-btn-secondary>
      </v-col>
      <v-col cols="auto">
        <v-btn-delete prepend-icon="mdi-delete" @click="openDelete = true">
          Delete Account</v-btn-delete
        >
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="openForm" width="40rem">
    <AccountForm @close="openForm = false" :is-edit="true" />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteAccountCard @close="openDelete = false" />
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AccountForm from '@/components/account/AccountForm.vue'
import UserInfoTable from '@/components/account/UserInfoTable.vue'
import OrganizationTable from '@/components/account/OrganizationTable.vue'
import DeleteAccountCard from '@/components/account/DeleteAccountCard.vue'
import HydroShareConnectionButton from '@/components/HydroShare/HydroShareConnectionButton.vue'
import { useHydroShare } from '@/composables/useHydroShare'
import { useRoute } from 'vue-router'
import { Snackbar } from '@/utils/notifications'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { api } from '@/services/api'

const { isConnectionEnabled: isHydroShareConnectionEnabled } = useHydroShare()
const openDelete = ref(false)
const openForm = ref(false)
const { user } = storeToRefs(useUserStore())

onMounted(async () => {
  const route = useRoute()
  if (route?.query?.error === 'connected_other') {
    Snackbar.error(
      'This HydroShare account is already connected to a different HydroServer account.'
    )
  }
  try {
    user.value = await api.fetchUser()
  } catch (err: any) {
    Snackbar.error(err.message)
    console.error('Error fetching user', err)
  }
})
</script>
