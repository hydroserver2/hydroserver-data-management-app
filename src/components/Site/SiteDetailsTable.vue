<template>
  <v-data-table
    :items="thingProperties"
    :items-per-page="-1"
    hide-default-header
    hide-default-footer
    class="elevation-2"
  >
    <template v-slot:item.icon="{ item }">
      <v-icon :icon="item.icon"></v-icon>
    </template>

    <template v-slot:item.value="{ item }">
      <div v-if="item.label === 'Additional metadata'">
        <v-chip
          v-for="(tag, index) in tagProperty.value"
          rounded="true"
          :color="materialColors[index % materialColors.length]"
          :key="tag.key"
          class="mr-2 my-1"
        >
          {{ tag.key }}:
          <span v-if="isUrl(tag.value)">
            <a :href="tag.value" target="_blank">{{ tag.value }}</a>
          </span>
          <span v-else>{{ tag.value }}</span>
        </v-chip>
      </div>
      <p v-else>{{ item.value }}</p>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useThingStore } from '@/store/thing'
import { materialColors } from '@/utils/materialColors'
import { useTagStore } from '@/store/tags'
import {
  mdiBarcode,
  mdiCarBack,
  mdiCardAccountDetails,
  mdiEarth,
  mdiFileDocumentOutline,
  mdiImageFilterHdr,
  mdiLock,
  mdiLockOpenVariant,
  mdiMap,
  mdiPineTree,
  mdiPlaneTrain,
  mdiTagMultipleOutline,
} from '@mdi/js'

const { thing } = storeToRefs(useThingStore())
const { tags } = storeToRefs(useTagStore())

const isUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch (_) {
    return false
  }
}

const thingProperties = computed(() => {
  return thing.value
    ? [
        {
          icon: mdiCardAccountDetails,
          label: 'ID',
          value: thing.value.id,
        },
        {
          icon: mdiBarcode,
          label: 'Site code',
          value: thing.value.samplingFeatureCode,
        },
        {
          icon: mdiMap,
          label: 'Latitude',
          value: thing.value.location.latitude,
        },
        {
          icon: mdiMap,
          label: 'Longitude',
          value: thing.value.location.longitude,
        },
        {
          icon: mdiImageFilterHdr,
          label: 'Elevation',
          value: thing.value.location.elevation_m,
        },
        {
          icon: mdiFileDocumentOutline,
          label: 'Description',
          value: thing.value.description,
        },
        {
          icon: mdiPineTree,
          label: 'Site type',
          value: thing.value.siteType,
        },
        {
          icon: mdiCarBack,
          label: 'County/District',
          value: thing.value.location.adminArea2,
        },
        {
          icon: mdiPlaneTrain,
          label: 'State/Province/Region',
          value: thing.value.location.adminArea1,
        },
        {
          icon: mdiEarth,
          label: 'Country',
          value: thing.value.location.country,
        },
        {
          icon: thing.value.isPrivate ? mdiLock : mdiLockOpenVariant,
          label: 'Privacy',
          value: thing.value.isPrivate ? 'Private' : 'Public',
        },
        {
          icon: mdiTagMultipleOutline,
          label: 'Additional metadata',
          value: tags.value || [],
        },
      ]
    : []
})

const tagProperty = computed(() => {
  return {
    icon: mdiTagMultipleOutline,
    label: 'Additional metadata',
    value: tags.value || [],
  }
})
</script>
