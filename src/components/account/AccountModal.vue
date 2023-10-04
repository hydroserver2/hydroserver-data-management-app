<template>
  <v-card>
    <v-card-subtitle
      >We need more information to create your account.</v-card-subtitle
    >
    <v-divider class="my-4"></v-divider>
    <!-- <p v-for="error of v$.$errors" :key="error.$uid">
      <strong>{{ error.$validator }}</strong>
      <small> on property</small>
      <strong>{{ error.$property }}</strong>
      <small> says:</small>
      <strong>{{ error.$message }}</strong>
    </p> -->
    <v-card-text>
      <form>
        <v-row>
          <!-- FIRST NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.firstName"
              v-bind="attrs('firstName')"
              v-on="handlers('firstName')"
              label="First Name"
            >
            </v-text-field>
          </v-col>

          <!-- MIDDLE NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.middleName"
              v-bind="attrs('middleName')"
              v-on="handlers('middleName')"
              label="Middle Name"
            ></v-text-field>
          </v-col>

          <!-- LAST NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.lastName"
              v-bind="attrs('lastName')"
              v-on="handlers('lastName')"
              label="Last Name"
            ></v-text-field>
          </v-col>

          <!-- EMAIL -->
          <v-col>
            <v-text-field
              v-if="!state.isVerified"
              v-model="state.email"
              v-bind="attrs('email')"
              v-on="handlers('email')"
              label="Email"
            ></v-text-field>
          </v-col>

          <!-- USER TYPE -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="state.userType"
              label="User Type"
              :items="userTypes"
              v-bind="attrs('userType')"
              v-on="handlers('userType')"
            ></v-autocomplete>
          </v-col>

          <!-- PHONE NUMBER -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.phone"
              v-maska:[phoneMask]
              label="Phone Number"
              v-bind="attrs('phone')"
              v-on="handlers('phone')"
            ></v-text-field>
          </v-col>

          <!-- USER'S LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.userLink"
              label="User's Link (URL)"
              v-bind="attrs('userLink')"
              v-on="handlers('userLink')"
            >
            </v-text-field>
          </v-col>

          <!-- ADDRESS -->
          <v-col cols="12">
            <v-text-field
              v-model="state.address"
              label="Address"
              v-bind="attrs('address')"
              v-on="handlers('address')"
            ></v-text-field>
          </v-col>
        </v-row>

        <v-switch
          v-model="showOrg"
          hide-details
          label="Affiliated with an Organization"
          color="primary"
        ></v-switch>

        <v-row v-if="showOrg">
          <!-- ORGANIZATION NAME -->
          <v-col cols="12" sm="8">
            <v-text-field
              v-model="state.organization.name"
              v-bind="attrs('organizationName')"
              v-on="handlers('organizationName')"
              label="Organization Name"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION CODE -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.organization.code"
              v-bind="attrs('organizationCode')"
              v-on="handlers('organizationCode')"
              label="Organization Code"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION TYPE -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              :items="organizationTypes"
              v-model="state.organization.type"
              v-bind="attrs('organizationType')"
              v-on="handlers('organizationType')"
              label="Organization Type"
            />
          </v-col>

          <!-- ORGANIZATION LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.organization.link"
              v-bind="attrs('organizationLink')"
              v-on="handlers('organizationLink')"
              label="Organization Link"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION DESCRIPTION -->
          <v-col cols="12">
            <v-textarea
              v-model="state.organization.description"
              v-bind="attrs('organizationDescription')"
              v-on="handlers('organizationDescription')"
              label="Organization Description"
              auto-grow
              :rows="1"
              :counter="2000"
            ></v-textarea>
          </v-col>
        </v-row>
      </form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <span class="text-caption">(*) Required fields</span>
      <v-spacer />
      <v-btn v-if="isModal" @click="emit('close')">Cancel</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :disabled="v$.$invalid"
        @click="submit"
        >Save Changes</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
// import { rules } from '@/utils/rules'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { userTypes } from '@/vocabularies'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'
import { Organization, User } from '@/types'
import { useVuelidate } from '@vuelidate/core'
import { helpers } from '@vuelidate/validators'
import {
  required,
  email,
  maxLength,
  url,
  requiredIf,
} from '@vuelidate/validators'
// import { phoneNumber } from '@/utils/rules'

const phoneMask = { mask: '(###) ###-####' }
const phoneRegex = helpers.regex(/^\(\d{3}\) \d{3}-\d{4}/)

const authStore = useAuthStore()
const props = defineProps({
  isModal: { type: Boolean, required: false, default: true },
})

const user = reactive<User>({ ...authStore.user })
const showOrg = ref(!!user.organization)

const rules = {
  firstName: { required, maxLength: maxLength(200) },
  middleName: { maxLength: maxLength(200) },
  lastName: { required, maxLength: maxLength(200) },
  email: { required, email },
  phone: {
    phoneRegex: helpers.withMessage(
      'Please provide a valid phone number',
      phoneRegex
    ),
  },
  address: {},
  userLink: { url },
  userType: { required },
  organizationName: {
    required: requiredIf(showOrg),
    maxLength: maxLength(200),
  },
  organizationCode: {
    required: requiredIf(showOrg),
    maxLength: maxLength(200),
  },
  organizationType: { required: requiredIf(showOrg) },
  organizationLink: { url },
  organizationDescription: { maxLength: maxLength(3000) },
}

const state = reactive<any>({
  ...user,
  organization: user.organization || new Organization(),
})
const v$ = useVuelidate(rules, state)
const emit = defineEmits(['close'])

const submit = async () => {
  const isValid = await v$.value.$validate()
  if (isValid) {
    await authStore.updateUser({
      ...state,
      organization: showOrg ? state.organization : undefined,
    })
    emit('close')
  }
}

const handlers = (name: string) => ({
  input: v$.value[name].$touch,
  blur: v$.value[name].$touch,
})

const attrs = (name: string) => ({
  'error-messages': v$.value[name].$errors.map((e: any) => e.$message),
  class: { 'is-required': v$.value[name]?.hasOwnProperty('required') },
})
</script>

<style scoped lang="scss">
:deep(.is-required .v-label)::after {
  display: inline;
  content: '*';
  margin-left: 0.15rem;
}
</style>
