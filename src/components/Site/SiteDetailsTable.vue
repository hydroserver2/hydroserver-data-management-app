<template>
  <v-data-table class="elevation-2">
    <tbody>
      <tr v-for="property in thingProperties" :key="property.label">
        <td><i :class="property.icon"></i></td>
        <td>{{ property.label }}</td>
        <td>{{ property.value }}</td>
      </tr>
    </tbody>
    <template v-slot:bottom></template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'

const { thing } = storeToRefs(useThingStore())

const thingProperties = computed(() => {
  if (!thing.value) return []
  const {
    id,
    samplingFeatureCode,
    latitude,
    longitude,
    elevation_m,
    description,
    siteType,
    state,
    county,
    isPrivate,
    owners,
  } = thing.value

  return [
    { icon: 'fas fa-id-badge', label: 'ID', value: id },
    {
      icon: 'fas fa-barcode',
      label: 'Site Code',
      value: samplingFeatureCode,
    },
    { icon: 'fas fa-map', label: 'Latitude', value: latitude },
    { icon: 'fas fa-map', label: 'Longitude', value: longitude },
    { icon: 'fas fa-mountain', label: 'Elevation', value: elevation_m },
    { icon: 'fas fa-file-alt', label: 'Description', value: description },
    { icon: 'fas fa-map-pin', label: 'Site Type', value: siteType },
    { icon: 'fas fa-flag-usa', label: 'State', value: state },
    { icon: 'fas fa-flag-usa', label: 'County', value: county },
    {
      icon: isPrivate ? 'fas fa-lock' : 'fas fa-globe',
      label: 'Privacy',
      value: isPrivate ? 'Private' : 'Public',
    },
    {
      icon: 'fas fa-user',
      label: 'Site Owners',
      value: owners
        .map(
          (o) =>
            `${o.firstName} ${o.lastName} (${
              o.organizationName ? o.organizationName : 'No Organization'
            })`
        )
        .join(', '),
    },
  ]
})
</script>
