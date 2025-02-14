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
          icon: 'mdi-card-account-details',
          label: 'ID',
          value: thing.value.id,
        },
        {
          icon: 'mdi-barcode',
          label: 'Site code',
          value: thing.value.samplingFeatureCode,
        },
        {
          icon: 'mdi-map',
          label: 'Latitude',
          value: thing.value.latitude,
        },
        {
          icon: 'mdi-map',
          label: 'Longitude',
          value: thing.value.longitude,
        },
        {
          icon: 'mdi-image-filter-hdr',
          label: 'Elevation',
          value: thing.value.elevation_m,
        },
        {
          icon: 'mdi-file-document-outline',
          label: 'Description',
          value: thing.value.description,
        },
        {
          icon: 'mdi-pine-tree',
          label: 'Site type',
          value: thing.value.siteType,
        },
        {
          icon: 'mdi-car-back',
          label: 'County/District',
          value: thing.value.county,
        },
        {
          icon: 'mdi-plane-train',
          label: 'State/Province/Region',
          value: thing.value.state,
        },
        {
          icon: 'mdi-earth',
          label: 'Country',
          value: thing.value.country,
        },
        {
          icon: thing.value.isPrivate ? 'mdi-lock' : 'mdi-lock-open-variant',
          label: 'Privacy',
          value: 'Public',
        },
        {
          icon: 'mdi-tag-multiple-outline',
          label: 'Additional metadata',
          value: tags.value || [],
        },
      ]
    : []
})

const tagProperty = computed(() => {
  return {
    icon: 'mdi-tag-multiple-outline',
    label: 'Additional metadata',
    value: tags.value || [],
  }
})
</script>
