<template>
  <v-footer class="mt-10" color="background" border>
    <v-container fluid class="py-2 text-body-2">
      <v-row class="justify-space-around" align="center">
        <v-col v-if="hasPolicies" cols="12" md="auto">
          <router-link v-if="showAbout" to="/about"> About </router-link>
          <span v-if="!!termsOfUse && showAbout" class="text-h6 mx-1">|</span>
          <a v-if="!!termsOfUse" :href="termsOfUse" target="_blank">
            Terms of use
          </a>
          <span v-if="!!privacyPolicy" class="text-h6 mx-1">|</span>
          <a v-if="!!privacyPolicy" :href="privacyPolicy" target="_blank">
            Privacy policy
          </a>
        </v-col>

        <v-col cols="12" md="auto">
          <div class="d-flex">
            <span class="align-self-center">Developed by</span>
            <a href="https://uwrl.usu.edu/" target="_blank" class="ml-4">
              <v-img
                :src="uwrlLogo"
                alt="UWRL Logo"
                max-width="20rem"
                min-width="16rem"
              />
            </a>
          </div>
        </v-col>

        <v-col cols="12" md="auto">
          <div class="d-flex">
            <span class="align-self-center">Powered by</span>
            <a href="https://hydroserver.org" target="_blank" class="ml-4">
              <v-img
                :src="HydroServerLogo"
                alt="UWRL Logo"
                max-width="15rem"
                min-width="8rem"
              />
            </a>
          </div>
        </v-col>
      </v-row>

      <v-row v-if="!!copyright">
        <v-col cols="12" class="text-center">
          <p class="d-inline-block text-body-2">{{ copyright }}</p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import uwrlLogo from '@/assets/UWRL-min.png'
import HydroServerLogo from '@/assets/hydroserver-icon-min.png'
import footerConfig from '@/config/footerConfig'

const { termsOfUse, showAbout, privacyPolicy, copyright } = footerConfig
const hasPolicies = !!termsOfUse || !!privacyPolicy || showAbout
</script>

<style scoped>
p {
  max-width: 75rem;
}

.block-children > * {
  display: block;
  margin-bottom: 1rem;
}
</style>
