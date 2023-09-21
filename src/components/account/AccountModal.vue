<template>
  <v-card>
    <v-card-text>
      <v-form
        ref="myForm"
        v-model="valid"
        validate-on="blur"
        @submit.prevent="updateUser"
      >
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="user.firstName"
              label="First Name *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="user.middleName"
              label="Middle Name"
              :rules="rules.name"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="user.lastName"
              label="Last Name *"
              :rules="rules.requiredName"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row v-if="!user.isVerified">
          <v-col>
            <v-text-field
              v-model="user.email"
              label="Email"
              :rules="rules.email"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="user.phone"
              v-maska:[phoneMask]
              label="Phone Number"
              :rules="rules.phoneNumber"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field v-model="user.address" label="Address"></v-text-field>
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
          <v-col>
            <v-text-field
              v-model="user.link"
              label="User's Link (URL)"
              :rules="user.link ? rules.urlFormat : []"
            >
            </v-text-field>
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
                :rules="user.organization.link ? rules.urlFormat : []"
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

        <v-card-actions v-if="isModal">
          <v-spacer></v-spacer>
          <v-btn-cancel @click="closeDialog">Cancel</v-btn-cancel>
          <v-btn type="submit">Update</v-btn>
        </v-card-actions>
        <v-card-actions v-else>
          <v-spacer></v-spacer>
          <v-btn type="submit">Save</v-btn>
        </v-card-actions>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { reactive, ref, onMounted, defineProps, watch } from 'vue'
import { useAuthStore } from '@/store/authentication'
import { userTypes } from '@/vocabularies'
import { VForm } from 'vuetify/components'
import { vMaska } from 'maska'
import { organizationTypes } from '@/vocabularies'
import { Organization, User } from '@/types'

const phoneMask = { mask: '(###) ###-####' }
const authStore = useAuthStore()
const props = defineProps({
  isModal: { type: Boolean, required: false, default: true },
})

let user = reactive<User>(JSON.parse(JSON.stringify(authStore.user)))
const showOrg = ref(!!user.organization)

watch(showOrg, (newVal) => {
  if (newVal && !user.organization) user.organization = new Organization()
  else if (!newVal) user.organization = null
})

const valid = ref(false)
const myForm = ref<VForm>()

const emit = defineEmits(['close'])
const closeDialog = () => emit('close')

const updateUser = async () => {
  await myForm.value?.validate()
  if (!valid.value) return
  await authStore.updateUser(user)
  emit('close')
}

onMounted(async () => await myForm.value?.validate())
</script>
