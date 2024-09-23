<template>
  <v-footer color="surface-darken-1" border>
    <v-container fluid class="py-8 text-body-2">
      <v-row class="justify-space-around">
        <v-col cols="12" md="auto" class="mb-4 block-children">
          <h5 class="text-h5 mb-4">About</h5>
          <router-link to="/about">About</router-link>
        </v-col>

        <v-col cols="12" md="auto" class="mb-4 block-children">
          <h5 class="text-h5 mb-4">Policies</h5>
          <a :href="policyConfig.termsOfUse" target="_blank"> Terms of Use </a>
          <a :href="policyConfig.privacyPolicy" target="_blank"> Privacy </a>
        </v-col>

        <v-col cols="12" md="auto" class="text-md-center mb-4">
          <h5 class="text-h5 mb-4">Developed by</h5>
          <a href="https://uwrl.usu.edu/" target="_blank">
            <v-img
              :src="uwrlLogo"
              alt="UWRL Logo"
              max-width="25rem"
              min-width="20rem"
            />
          </a>
        </v-col>

        <v-col cols="12" md="auto" class="text-md-center mb-4">
          <h5 class="text-h5 mb-4">Powered by</h5>
          <a href="https://hydroserver.org" target="_blank">
            <v-img
              :src="HydroServerLogo"
              alt="UWRL Logo"
              max-width="25rem"
              min-width="10rem"
            />
          </a>
        </v-col>
      </v-row>

      <v-row class="text-md-center">
        <v-col>
          <p class="d-inline-block text-body-2">
            &copy; Utah Water Research Laboratory (UWRL). This material is based
            on work supported by the Cooperative Institute for Research to
            Operations in Hydrology (CIROH). Funding was awarded to CIROH
            through the NOAA Cooperative Agreement with the University of
            Alabama (NA22NWS4320003).
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import uwrlLogo from '@/assets/UWRL-min.png'
import HydroServerLogo from '@/assets/hydroserver-icon-min.png'
import policyConfig from '@/config/policyConfig'

const version = import.meta.env.VITE_APP_VERSION || '0.0.1'
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
