<template>
  <v-data-table class="elevation-3 my-6 rounded-lg">
    <template v-slot:top>
      <v-toolbar color="secondary">
        <h5 class="text-h5 ml-4">User Information</h5>
      </v-toolbar>
    </template>
    <tbody>
      <tr v-for="property in userInformation" :key="property?.label">
        <td><i :class="property?.icon"></i></td>
        <td>
          <strong>{{ property?.label }}</strong>
        </td>
        <td>{{ property?.value }}</td>
      </tr>
      <tr>
        <td><i class="fas fa-database"></i></td>
        <td>
          <strong>HydroShare Account</strong>
        </td>
        <td>
          <v-btn v-if="hydroShareConnected" class="mr-6" density="compact" variant="outlined" @click="disconnectFromHydroShare" >
            Disconnect
          </v-btn>
          <v-btn v-else class="mr-6" density="compact" variant="outlined" @click="connectToHydroShare" >
            Connect
          </v-btn>
        </td>
      </tr>
    </tbody>
    <template v-slot:bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import {api, getOAuthLoginEndpoint} from '@/services/api'
import router from "@/router/router";
import {OAuthProvider} from "@/types";
import Notification from "@/utils/notifications";

const { user } = storeToRefs(useUserStore())
const APP_URL = import.meta.env.VITE_APP_URL
let OAuthLoginController = new AbortController()

async function connectToHydroShare(callback?: () => any) {
  const handleMessage = async (event: MessageEvent) => {
    if (event.origin !== APP_URL || !event.data.hasOwnProperty('accessToken')) {
      return
    }
    try {
      Notification.toast({
        message: 'You have linked HydroServer to your HydroShare account!',
        type: 'success',
      })
      callback?.()
    } catch (e) {
      console.log('Failed to connect to HydroShare')
    }
  }

  window.open(getOAuthLoginEndpoint('hydroshare'), '_blank', 'noopener=false')

  // We need to re-instantiate the listener so that it uses current values in `handleMessage`
  OAuthLoginController.abort()
  OAuthLoginController = new AbortController()

  window.addEventListener('message', handleMessage, {
    signal: OAuthLoginController.signal, // Used to remove the listener
  })
}

async function disconnectFromHydroShare() {
  await api.disconnectFromHydroShare()
}

const hydroShareConnected = computed(() => {
  if (!user.value) return false
  return user.value.hydroShareConnected
})

const userInformation = computed(() => {
  if (!user.value) return []

  return [
    {
      icon: 'fas fa-user',
      label: 'Name',
      value: `${user.value.firstName} ${user.value.middleName || ''} ${
        user.value.lastName
      }`,
    },

    { icon: 'fas fa-envelope', label: 'Email', value: user.value.email },
    {
      icon: 'fas fa-map-marker-alt',
      label: 'Address',
      value: user.value.address,
    },
    { icon: 'fas fa-phone', label: 'Phone', value: user.value.phone },
    { icon: 'fas fa-id-badge', label: 'Type', value: user.value.type },
    { icon: 'fas fa-link', label: 'Link', value: user.value.link },
    user.value.organization
      ? {
          icon: 'fas fa-building',
          label: 'Organization Name',
          value: user.value.organization.name,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-code',
          label: 'Organization Code',
          value: user.value.organization.code,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-external-link-alt',
          label: 'Organization Link',
          value: user.value.organization.link,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-industry',
          label: 'Organization Type',
          value: user.value.organization.type,
        }
      : null,
    user.value.organization
      ? {
          icon: 'fas fa-file-alt',
          label: 'Organization Description',
          value: user.value.organization.description,
        }
      : null,
  ].filter(Boolean)
})
</script>
