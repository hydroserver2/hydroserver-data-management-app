<template>
  <v-card>
    <slot name="header">
      <v-card-title>Edit Profile</v-card-title>
    </slot>
    <v-divider class="my-4"></v-divider>
    <!-- <p v-for="error of validator.instance.$errors" :key="error.$uid">
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
              v-bind="validator.attrs('firstName')"
              v-on="validator.handlers('firstName')"
              label="First Name"
            >
            </v-text-field>
          </v-col>

          <!-- MIDDLE NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.middleName"
              v-bind="validator.attrs('middleName')"
              v-on="validator.handlers('middleName')"
              label="Middle Name"
            ></v-text-field>
          </v-col>

          <!-- LAST NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.lastName"
              v-bind="validator.attrs('lastName')"
              v-on="validator.handlers('lastName')"
              label="Last Name"
            ></v-text-field>
          </v-col>

          <!-- EMAIL -->
          <v-col>
            <v-text-field
              :readonly="user.isVerified"
              v-model="state.email"
              v-bind="validator.attrs('email')"
              v-on="validator.handlers('email')"
              label="Email"
              :append-inner-icon="
                user.isVerified ? 'mdi-pencil-off' : undefined
              "
            ></v-text-field>
          </v-col>

          <!-- USER TYPE -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              v-model="state.type"
              label="User Type"
              :items="userTypes"
              v-bind="validator.attrs('type')"
              v-on="validator.handlers('type')"
            ></v-autocomplete>
          </v-col>

          <!-- PHONE NUMBER -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.phone"
              v-maska:[phoneMask]
              label="Phone Number"
              v-bind="validator.attrs('phone')"
              v-on="validator.handlers('phone')"
            ></v-text-field>
          </v-col>

          <!-- USER'S LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.link"
              label="User's Link (URL)"
              v-bind="validator.attrs('link')"
              v-on="validator.handlers('link')"
            >
            </v-text-field>
          </v-col>

          <!-- ADDRESS -->
          <v-col cols="12">
            <v-text-field
              v-model="state.address"
              label="Address"
              v-bind="validator.attrs('address')"
              v-on="validator.handlers('address')"
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
              v-bind="validator.attrs('organizationName')"
              v-on="validator.handlers('organizationName')"
              label="Organization Name"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION CODE -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.organization.code"
              v-bind="validator.attrs('organizationCode')"
              v-on="validator.handlers('organizationCode')"
              label="Organization Code"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION TYPE -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              :items="organizationTypes"
              v-model="state.organization.type"
              v-bind="validator.attrs('organizationType')"
              v-on="validator.handlers('organizationType')"
              label="Organization Type"
            />
          </v-col>

          <!-- ORGANIZATION LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.organization.link"
              v-bind="validator.attrs('organizationLink')"
              v-on="validator.handlers('organizationLink')"
              label="Organization Link"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION DESCRIPTION -->
          <v-col cols="12">
            <v-textarea
              v-model="state.organization.description"
              v-bind="validator.attrs('organizationDescription')"
              v-on="validator.handlers('organizationDescription')"
              label="Organization Description"
              auto-grow
              :rows="1"
            ></v-textarea>
          </v-col>
        </v-row>
      </form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <span class="text-caption text-medium-emphasis">(*) Required fields</span>
      <v-spacer />
      <v-btn v-if="hasCancelButton" @click="emit('close')">Cancel</v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :disabled="validator.instance.value.$invalid || isSaving"
        @click="submit"
        >{{ isSaving ? 'Saving Changes...' : 'Save Changes' }}</v-btn
      >
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
// import { rules } from '@/utils/rules'
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { userTypes } from '@/vocabularies'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'
import { Organization, User } from '@/types'
import { helpers } from '@vuelidate/validators'
import {
  required,
  email,
  maxLength,
  url,
  requiredIf,
} from '@vuelidate/validators'
import { HsFormValidator } from '@/utils/rules'

const phoneMask = { mask: '(###) ###-####' }
const phoneRegex = helpers.regex(/^\(\d{3}\) \d{3}-\d{4}/)

const authStore = useAuthStore()
defineProps({
  hasCancelButton: { type: Boolean, required: false, default: true },
})

const user = reactive<User>({ ...authStore.user })
const showOrg = ref(!!user.organization)
const isSaving = ref(false)

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
  link: { url },
  type: { required },
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

const validator = new HsFormValidator(rules, state)

onMounted(() => {
  validator.validate()
})

const emit = defineEmits(['close'])

const submit = async () => {
  const isValid = await validator.validate()
  if (isValid) {
    const data = {
      ...state,
      organization: showOrg.value ? state.organization : undefined,
    }
    isSaving.value = true
    await authStore.updateUser(data)
    isSaving.value = false
    emit('close')
  }
}
</script>

<style scoped lang="scss"></style>
