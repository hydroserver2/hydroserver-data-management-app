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
              v-bind="validator.attrs(validator.instance.value.firstName)"
              v-on="validator.handlers(validator.instance.value.firstName)"
              label="First Name"
            >
            </v-text-field>
          </v-col>

          <!-- MIDDLE NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.middleName"
              v-bind="validator.attrs(validator.instance.value.middleName)"
              v-on="validator.handlers(validator.instance.value.middleName)"
              label="Middle Name"
            ></v-text-field>
          </v-col>

          <!-- LAST NAME -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.lastName"
              v-bind="validator.attrs(validator.instance.value.lastName)"
              v-on="validator.handlers(validator.instance.value.lastName)"
              label="Last Name"
            ></v-text-field>
          </v-col>

          <!-- EMAIL -->
          <v-col>
            <v-text-field
              :readonly="user.isVerified"
              v-model="state.email"
              v-bind="validator.attrs(validator.instance.value.email)"
              v-on="validator.handlers(validator.instance.value.email)"
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
              v-bind="validator.attrs(validator.instance.value.type)"
              v-on="validator.handlers(validator.instance.value.type)"
            ></v-autocomplete>
          </v-col>

          <!-- PHONE NUMBER -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.phone"
              v-maska:[phoneMask]
              label="Phone Number"
              v-bind="validator.attrs(validator.instance.value.phone)"
              v-on="validator.handlers(validator.instance.value.phone)"
            ></v-text-field>
          </v-col>

          <!-- USER'S LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.link"
              label="User's Link (URL)"
              v-bind="validator.attrs(validator.instance.value.link)"
              v-on="validator.handlers(validator.instance.value.link)"
            >
            </v-text-field>
          </v-col>

          <!-- ADDRESS -->
          <v-col cols="12">
            <v-text-field
              v-model="state.address"
              label="Address"
              v-bind="validator.attrs(validator.instance.value.address)"
              v-on="validator.handlers(validator.instance.value.address)"
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
              v-bind="
                validator.attrs(validator.instance.value.organization.name)
              "
              v-on="
                validator.handlers(validator.instance.value.organization.name)
              "
              label="Organization Name"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION CODE -->
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="state.organization.code"
              v-bind="
                validator.attrs(validator.instance.value.organization.code)
              "
              v-on="
                validator.handlers(validator.instance.value.organization.code)
              "
              label="Organization Code"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION TYPE -->
          <v-col cols="12" sm="6">
            <v-autocomplete
              :items="organizationTypes"
              v-model="state.organization.type"
              v-bind="
                validator.attrs(validator.instance.value.organization.type)
              "
              v-on="
                validator.handlers(validator.instance.value.organization.type)
              "
              label="Organization Type"
            />
          </v-col>

          <!-- ORGANIZATION LINK -->
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="state.organization.link"
              v-bind="
                validator.attrs(validator.instance.value.organization.link)
              "
              v-on="
                validator.handlers(validator.instance.value.organization.link)
              "
              label="Organization Link"
            ></v-text-field>
          </v-col>

          <!-- ORGANIZATION DESCRIPTION -->
          <v-col cols="12">
            <v-textarea
              v-model="state.organization.description"
              v-bind="
                validator.attrs(
                  validator.instance.value.organization.description
                )
              "
              v-on="
                validator.handlers(
                  validator.instance.value.organization.description
                )
              "
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
const authStore = useAuthStore()

defineProps({
  hasCancelButton: { type: Boolean, required: false, default: true },
})

const user = { ...authStore.user }
const showOrg = ref(!!user.organization)
const isSaving = ref(false)

// Should match the shape of the form state
const rules = {
  firstName: { required, maxLength: maxLength(200) },
  middleName: { maxLength: maxLength(200) },
  lastName: { required, maxLength: maxLength(200) },
  email: { required, email },
  phone: {
    phoneRegex: helpers.withMessage(
      'Please provide a valid phone number',
      helpers.regex(/^\(\d{3}\) \d{3}-\d{4}/)
    ),
  },
  address: {},
  link: { url },
  type: { required },
  organization: {
    name: {
      required: requiredIf(showOrg),
      maxLength: maxLength(200),
    },
    code: {
      required: requiredIf(showOrg),
      maxLength: maxLength(200),
    },
    type: { required: requiredIf(showOrg) },
    link: { url },
    description: { maxLength: maxLength(3000) },
  },
}

const state = reactive<any>({
  ...user,
  organization: { ...user.organization } || new Organization(),
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
