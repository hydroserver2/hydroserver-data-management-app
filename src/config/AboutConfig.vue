<template>
  <v-container>
    <h4 class="text-h4 my-6">About us</h4>
    <h5 class="text-h5 my-6">Lorem ipsum</h5>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>

    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>

    <h5 class="text-h5 my-6">Lorem ipsum</h5>
    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>

    <AboutCards :cards="cards" :num-cols="4" />

    <p class="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
      velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
      cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
      est laborum.
    </p>
  </v-container>

  <AboutHydroServer />
</template>

<script setup lang="ts">
import AboutCards from '@/components/About/AboutCards.vue'
import AboutHydroServer from '@/components/About/AboutHydroServer.vue'
/**
 * This configurable component is meant to be edited by the deployment admin
 * running a specific instance of Hydroserver. This frontend web app uses Vuetify 3 and Vue 3
 * so any of their components can be imported and used here or you can just use the default
 * layout and replace the lorem ipsum text with your own.
 */

const cards = [
  {
    title: 'Email Us',
    // titleIcon: 'mdi-email',
    text: 'Please contact us at support@example.com.',
    btnText: 'Send an email',
    btnColor: 'secondary',
    btnHref: 'mailto:support@example.com',
  },
  {
    title: 'Connect With Us on GitHub',
    titleIcon: 'mdi-github',
    text: 'All of our software development activities are open source and available on GitHub.',
    btnText: 'Go to GitHub',
    btnColor: 'primary',
    btnHref: 'https://github.com/example',
    btnTarget: '_blank',
  },
  {
    title: 'Connect With Us on GitHub',
    titleIcon: 'mdi-github',
    text: 'All of our software development activities are open source and available on GitHub.',
    btnText: 'Go to GitHub',
    btnColor: 'brown',
    btnHref: 'https://github.com/example',
    btnTarget: '_blank',
  },
  {
    title: 'Connect With Us on GitHub',
    titleIcon: 'mdi-github',
    text: 'All of our software development activities are open source and available on GitHub.',
    btnText: 'Go to GitHub',
    btnColor: 'orange',
    btnHref: 'https://github.com/example',
    btnTarget: '_blank',
  },
  {
    title: 'Connect With Us on GitHub',
    titleIcon: 'mdi-github',
    text: 'All of our software development activities are open source and available on GitHub.',
    btnText: 'Go to GitHub',
    btnColor: 'primary',
    btnHref: 'https://github.com/example',
    btnTarget: '_blank',
  },
]
</script>
