<template>
  <v-card>
    <v-card-title class="headline">Confirm Account Deletion</v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      Are you sure you want to delete your account? This action will permanently
      remove all your information from the system including all sites,
      datastreams, and observations you have primary ownership of, user
      information, and preferences. This action cannot be undone.
    </v-card-text>
    <v-card-text v-if="primaryOwnedThings.length > 0">
      The following is a list of the sites you have primary ownership of that
      will be deleted with your account. If you have secondary owners, we
      strongly recommend transferring primary ownership to one of them before
      deleting your account. Additionally, you have the option to store your
      site data in hydroshare or download your data before deleting your
      account.
    </v-card-text>
    <v-card-text>
      <div v-for="thing in primaryOwnedThings">
        {{ thing.name }}
      </div>
    </v-card-text>

    <v-card-text>
      Please type the following text to confirm deletion:
      <strong> Delete my account and data </strong>
      <v-form>
        <v-text-field
          v-model="deleteInput"
          solo
          @keydown.enter.prevent="deleteAccount"
        ></v-text-field>
      </v-form>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn-cancel @click="cancelDeletion">Cancel</v-btn-cancel>
      <v-btn-delete @click="deleteAccount">Delete</v-btn-delete>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/things'
import { api } from '@/services/api'
import Notification from '@/store/notifications'
import { useAuthStore } from '@/store/authentication'
import { onMounted, ref } from 'vue'

const { logout } = useAuthStore()
const { fetchThings } = useThingStore()
const { primaryOwnedThings } = storeToRefs(useThingStore())
const emit = defineEmits(['delete', 'close'])
const deleteInput = ref('')

async function deleteAccount() {
  if (deleteInput.value.toLowerCase() !== 'delete my account and data') {
    Notification.toast({ message: "input doesn't match", type: 'error' })
    return
  }
  try {
    emit('close')
    await api.deleteUser()
    await logout()
  } catch (error) {
    console.error('Error deleting account', error)
  }
}

function cancelDeletion() {
  deleteInput.value = ''
  emit('close')
}

onMounted(async () => await fetchThings())
</script>
