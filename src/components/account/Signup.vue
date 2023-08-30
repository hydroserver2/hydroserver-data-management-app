<template>
  <v-container class="d-flex align-center justify-center my-8">
    <v-card width="50rem">
      <v-card-title class="mb-4 signup-title">Sign Up</v-card-title>
      <v-card-text>
        <v-form
          @submit.prevent="createUser"
          v-model="valid"
          ref="myForm"
          validate-on="blur"
        >
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="user.firstName"
                label="First Name *"
                :rules="rules.requiredName"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="user.middleName"
                label="Middle Name"
                :rules="user.middleName ? rules.name : []"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="user.lastName"
                label="Last Name *"
                :rules="rules.requiredName"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="user.email"
                label="Email (This will be your login username) *"
                :rules="rules.email"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                type="password"
                v-model="user.password"
                label="Password *"
                :rules="rules.password"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                type="password"
                v-model="confirmPassword"
                label="Confirm Password *"
                :rules="rules.passwordMatch(user.password)"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="user.address"
                label="Address"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="user.phone"
                v-maska:[phoneMask]
                label="Phone"
                :rules="user.phone ? rules.phoneNumber : []"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="user.type"
                label="User Type *"
                :items="userTypes"
                :rules="rules.required"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="user.link"
                label="User's Link (URL)"
                :rules="user.link ? rules.urlFormat : []"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-switch
                v-model="showOrg"
                hide-details
                :label="
                  showOrg
                    ? 'Affiliated with an Organization'
                    : 'No Affiliated Organization'
                "
                color="primary"
              ></v-switch>
            </v-col>
          </v-row>
          <div v-if="user && showOrg">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="user.organization.name"
                  label="Organization Name *"
                  :rules="rules.requiredName"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="user.organization.code"
                  label="Organization Code *"
                  :rules="rules.requiredName"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-autocomplete
                  :items="organizationTypes"
                  v-model="user.organization.type"
                  label="Organization Type *"
                  :rules="rules.requiredName"
                />
              </v-col>
              <v-col>
                <v-text-field
                  v-model="user.organization.link"
                  label="Organization Link"
                  :rules="user.organization.link ? rules.maxLength(2000) : []"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col>
                <v-text-field
                  v-model="user.organization.description"
                  label="Organization Description"
                  :rules="
                    user.organization.description ? rules.maxLength(2000) : []
                  "
                ></v-text-field>
              </v-col>
            </v-row>
          </div>
          <div class="mt-6">
            <v-btn-primary type="submit">Create User</v-btn-primary>
          </div>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-text class="text-body-1">
        <span class="mr-2">Already have an account?</span>
        <router-link to="/login">Sign In</router-link>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { User } from '@/types'
import { userTypes } from '@/vocabularies'
import { VForm } from 'vuetify/components'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'

const valid = ref(false)
const confirmPassword = ref('')
const myForm = ref<VForm>()
const user = reactive<User>(new User())
const phoneMask = { mask: '(###) ###-####' }
const showOrg = ref(false)

async function createUser() {
  if (!valid.value) return
  console.log('creating user', user)
  await useAuthStore().createUser(user)
}
</script>
