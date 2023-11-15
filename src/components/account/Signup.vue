<template>
  <v-container>
    <v-row justify="center" align="center" class="mt-2">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title align="center" class="mb-2 signup-title"
            >Sign Up</v-card-title
          >
          <v-card-text align="center" class="my-2"
            >Note that all provided information besides your password will be
            publicly viewable. This helps with communication and data
            integrity.</v-card-text
          >
          <v-divider></v-divider>
          <v-form
            @submit.prevent="createUser"
            v-model="valid"
            ref="myForm"
            validate-on="blur"
          >
            <v-card-text>
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
                <v-col cols="auto">
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
              <div v-if="user.organization && showOrg">
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
                      :rules="
                        user.organization.link ? rules.maxLength(2000) : []
                      "
                    ></v-text-field>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="user.organization.description"
                      label="Organization Description"
                      :rules="
                        user.organization.description
                          ? rules.maxLength(2000)
                          : []
                      "
                    ></v-text-field>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="text-body-1">
              <v-spacer></v-spacer>
              <v-btn-primary type="submit">Create User</v-btn-primary>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-6">
      <span class="mr-2">Already have an account?</span>
      <router-link to="/login">Sign In</router-link>
    </v-row>

    <OAuth />

    <div class="mb-10"></div>
  </v-container>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { Organization, User } from '@/types'
import { userTypes } from '@/vocabularies'
import { VForm } from 'vuetify/components'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'
import OAuth from '@/components/account/OAuth.vue'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'
import router from '@/router/router'
import { useUserStore } from '@/store/user'

const valid = ref(false)
const confirmPassword = ref('')
const myForm = ref<VForm>()
const user = reactive<User>(new User())
const showOrg = ref(false)
const { resetState, setTokens } = useAuthStore()
const { setUser } = useUserStore()

watch(showOrg, (newVal) => {
  if (newVal && !user.organization) user.organization = new Organization()
  else if (!newVal) user.organization = null
})

const phoneMask = { mask: '(###) ###-####' }

async function createUser() {
  if (!valid.value) return
  try {
    resetState()
    const data = await api.post(ENDPOINTS.USER, user)
    setUser(data.user)
    setTokens(data.access, data.refresh)
    await router.push({ name: 'VerifyEmail' })
  } catch (error) {
    console.error('Error creating user', error)
  }
}
</script>
