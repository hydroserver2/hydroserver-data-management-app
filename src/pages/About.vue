<template>
  <v-container class="d-flex flex-column justify-start">
    <v-row class="d-flex justify-start mb-6 mt-4">
      <v-col class="d-flex justify-start">
        <v-card-text class="d-flex justify-start align-center flex-column">
          <h4 class="text-h4 mb-4">{{ aboutUs.title }}</h4>
          <h5 class="text-h5">{{ aboutUs.subTitle }}</h5>
        </v-card-text>
      </v-col>
    </v-row>

    <v-row class="d-flex align-start justify-start" align="stretch">
      <v-col
        v-for="(card, index) in aboutUs.cards"
        :key="index"
        :md="getColumnSpan(aboutUs.columns)"
        cols="12"
        class="d-flex"
      >
        <v-card
          class="fill-height d-flex flex-column justify-space-between"
          style="width: 100%"
        >
          <v-card-text>
            <h5 class="text-h5 mb-4 d-flex align-center">
              <v-icon left color="grey-darken-1" class="mr-2">
                {{ card.titleIcon }}
              </v-icon>
              {{ card.title }}
            </h5>
            <div>{{ card.text }}</div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              variant="outlined"
              rounded="xl"
              :color="card.btnColor"
              :href="card.btnHref"
              :target="card.btnTarget"
            >
              {{ card.btnText }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <v-container>
    <v-divider class="mt-10 mb-16" />
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card variant="tonal">
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
import { aboutUs } from '@/config/aboutConfig'
import HydroServerIcon from '@/assets/hydroserver-icon-color.png'

/**
 * Computes the column span based on the number of desired columns.
 * Ensures the number of columns is between 1 and 4.
 */
const getColumnSpan = (columns: number) =>
  12 / Math.min(Math.max(columns, 1), 4)
</script>
