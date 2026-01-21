<template>
  <div v-if="isMobile" class="site-details-mobile">
    <div
      v-for="item in thingProperties"
      :key="item.label"
      class="site-details-mobile__item"
    >
      <div class="site-details-mobile__header">
        <v-icon :icon="item.icon" :color="item.iconColor"></v-icon>
        <span class="site-detail-label">{{ item.label }}</span>
      </div>
      <div class="site-details-mobile__value">
        <div v-if="item.label === 'ID'" class="d-flex align-center">
          <span class="mr-2">{{ item.value }}</span>
          <v-tooltip text="Copy ID">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="x-small"
                variant="text"
                @click.stop="copyValue(String(item.value))"
              >
                <v-icon :icon="mdiContentCopy" size="x-small" />
              </v-btn>
            </template>
          </v-tooltip>
        </div>
        <div
          v-else-if="item.label === 'Additional metadata'"
          class="metadata-chip-list"
        >
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
        <p v-else class="site-detail-text">{{ item.value }}</p>
      </div>
    </div>
  </div>
  <v-data-table
    v-else
    :items="thingProperties"
    :items-per-page="-1"
    hide-default-header
    hide-default-footer
    density="compact"
    class="elevation-2 site-details-table"
  >
    <template v-slot:item.icon="{ item }">
      <v-icon :icon="item.icon" :color="item.iconColor"></v-icon>
    </template>

    <template v-slot:item.label="{ item }">
      <span class="site-detail-label">{{ item.label }}</span>
    </template>

    <template v-slot:item.value="{ item }">
      <div v-if="item.label === 'ID'" class="d-flex align-center">
        <span class="mr-2">{{ item.value }}</span>
        <v-tooltip text="Copy ID">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              icon
              size="small"
              variant="text"
              class="site-copy-btn"
              @click.stop="copyValue(String(item.value))"
            >
              <v-icon :icon="mdiContentCopy" size="small" />
            </v-btn>
          </template>
        </v-tooltip>
      </div>
      <div v-else-if="item.label === 'Additional metadata'">
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
import { Snackbar } from '@/utils/notifications'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import {
  mdiBarcode,
  mdiCardAccountDetails,
  mdiContentCopy,
  mdiFileDocumentOutline,
  mdiLock,
  mdiLockOpenVariant,
  mdiPineTree,
  mdiTagMultipleOutline,
} from '@mdi/js'

const { thing } = storeToRefs(useThingStore())
const { tags } = storeToRefs(useTagStore())
const { smAndDown } = useDisplay()
const isMobile = computed(() => smAndDown.value)

const isUrl = (value: string): boolean => {
  try {
    new URL(value)
    return true
  } catch (_) {
    return false
  }
}

const copyValue = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    Snackbar.success('ID copied to clipboard')
  } catch {
    Snackbar.error('Failed to copy ID')
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
          icon: thing.value.isPrivate ? mdiLock : mdiLockOpenVariant,
          iconColor: thing.value.isPrivate ? 'red-darken-2' : 'green',
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

<style scoped>
.site-detail-label {
  font-weight: 600;
}

.site-details-table :deep(.v-data-table__wrapper) {
  overflow-x: hidden;
  max-height: none;
}

.site-details-mobile {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.site-details-mobile__item {
  padding: 0.4rem 0.25rem 0.6rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.site-details-mobile__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-details-mobile__value {
  margin-top: 0;
  padding-left: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.site-detail-text {
  margin: 0;
}

.metadata-chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
}

@media (max-width: 700px) {
  .site-copy-btn {
    min-width: 40px;
    min-height: 40px;
  }
}
</style>
