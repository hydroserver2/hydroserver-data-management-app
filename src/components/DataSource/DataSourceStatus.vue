<template>
  <v-container class="pa-0">
    <v-chip v-if="props.status === 'ok'" color="green">
      Up-To-Date
    </v-chip>
    <v-chip v-if="props.status === 'pending'" color="blue">
      Pending
    </v-chip>
    <v-chip v-if="props.status === 'bad'" color="red">
      Needs Attention
    </v-chip>
    <v-chip v-if="props.status === 'stale'" color="orange">
      Behind Schedule
    </v-chip>
    <v-chip v-if="props.status === 'unknown'" color="gray">
      Unknown
    </v-chip>
    <v-chip style="margin-left: 7px" v-if="props.paused === true">
      Loading Paused
    </v-chip>
  </v-container>
</template>

<script setup>
const props = defineProps(['status', 'paused'])

</script>

<style scoped>

</style>