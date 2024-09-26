<template>
  <v-container>
    <v-divider class="mt-6 mb-16" />
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center" color="primary" dark>
            <v-img
              :src="HydroServerIcon"
              alt="HydroServer Logo"
              max-width="50"
              class="mr-3"
            ></v-img>
            <span class="text-h5 font-weight-medium">About HydroServer</span>
          </v-card-title>
          <v-card-text>
            <p class="text-body-1">
              HydroServer is an open-source suite of software tools designed to
              make sensor data management easier. All tools are in compliance
              with the OGC SensorThings standard. This web application is an
              instance of the HydroServer Data Management App, providing a
              user-friendly interface for managing monitoring sites and their
              metadata. For more information about HydroServer, visit
              <v-btn
                class="ma-0 pa-0"
                variant="text"
                color="primary"
                href="https://hydroserver.org"
                target="_blank"
              >
                hydroserver.org
              </v-btn>
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import HydroServerIcon from '@/assets/hydroserver-icon-color.png'
</script>
