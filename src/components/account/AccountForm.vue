<template>
  <v-card>
    <slot name="header">
      <v-card-title>Edit Profile</v-card-title>
    </slot>
    <v-divider class="my-4"></v-divider>
    <v-card-text>
      <v-form
        ref="myForm"
        v-model="valid"
        validate-on="blur"
        @submit.prevent="onUserUpdate"
      >
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="userForm.firstName"
              label="First Name *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="userForm.middleName"
              label="Middle Name"
              :rules="rules.name"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="userForm.lastName"
              label="Last Name *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>

          <v-col cols="12" v-if="!userForm.isVerified">
            <v-text-field
              v-model="userForm.email"
              label="Email"
              :rules="rules.email"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-text-field
              v-model="userForm.phone"
              v-maska:[phoneMask]
              label="Phone Number"
              :rules="rules.phoneNumber"
            ></v-text-field>
          </v-col>

          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="userForm.type"
              label="User Type *"
              :items="userTypes"
              :rules="rules.required"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="userForm.address"
              label="Address"
            ></v-text-field>
          </v-col>

          <v-col>
            <v-text-field
              v-model="userForm.link"
              label="User's Link (URL)"
              :rules="userForm.link ? rules.urlFormat : []"
            >
            </v-text-field>
          </v-col>
        </v-row>

        <v-switch
          v-model="showOrg"
          hide-details
          label="Affiliated with an Organization"
          color="primary"
        ></v-switch>

        <v-row v-if="userForm.organization && showOrg">
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="userForm.organization.name"
              label="Organization Name *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="userForm.organization.code"
              label="Organization Code *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6">
            <v-autocomplete
              :items="organizationTypes"
              v-model="userForm.organization.type"
              label="Organization Type *"
              :rules="rules.requiredName"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="userForm.organization.link"
              label="Organization Link"
              :rules="userForm.organization.link ? rules.urlFormat : []"
            ></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="userForm.organization.description"
              label="Organization Description"
              :rules="
                userForm.organization.description ? rules.maxLength(2000) : []
              "
            ></v-textarea>
          </v-col>
        </v-row>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn-cancel v-if="hasCancelButton" @click="emit('close')"
            >Cancel</v-btn-cancel
          >
          <v-btn-primary type="submit">Save</v-btn-primary>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { reactive, ref, onMounted, watch } from 'vue'
import { userTypes } from '@/vocabularies'
import { VForm } from 'vuetify/components'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'
import { Organization, User } from '@/types'
import { useUserStore } from '@/store/user'
import router from '@/router/router'
import Notification from '@/store/notifications'
import { api } from '@/services/api'

defineProps({
  hasCancelButton: { type: Boolean, required: false, default: true },
})

const { user, setUser } = useUserStore()
let userForm = reactive<User>(JSON.parse(JSON.stringify(user)))

const phoneMask = { mask: '(###) ###-####' }
const valid = ref(false)
const myForm = ref<VForm>()
const showOrg = ref(!!userForm.organization)

watch(showOrg, (newVal) => {
  if (newVal && !userForm.organization)
    userForm.organization = new Organization()
  else if (!newVal) userForm.organization = null
})

const emit = defineEmits(['close'])

const onUserUpdate = async () => {
  await myForm.value?.validate()
  if (!valid.value) return

  try {
    userForm = await api.updateUser(userForm, user)
    setUser(userForm)
  } catch (error) {
    console.error('Error updating user', error)
  }

  if (!user?.isVerified) {
    await router.push({ name: 'VerifyEmail' })
  } else {
    Notification.toast({
      message: 'Your changes have been saved.',
      type: 'success',
    })
  }
  emit('close')
}

onMounted(async () => await myForm.value?.validate())
</script>
