<template>
  <v-card elevation="2">
    <v-card-text>
      <v-row>
        <v-col cols="auto" class="align-self-center">
          <v-card-title>Filter By</v-card-title>
        </v-col>

        <v-col cols="4" class="align-self-center">
          <v-autocomplete
            v-model="selectedOrganizations"
            :items="organizations"
            label="Organizations"
            multiple
            clearable
            hide-details
            rounded
            density="compact"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip
                v-if="selectedOrganizations.length === 1"
                color="green"
                rounded
              >
                <span>{{ truncateText(item.title, 25) }}</span>
              </v-chip>

              <span v-else-if="index === 0">
                Organizations
                <v-chip color="green" rounded>
                  {{ selectedOrganizations.length }}
                </v-chip>
              </span>
            </template>
          </v-autocomplete>
        </v-col>

        <v-col cols="4" class="align-self-center">
          <v-autocomplete
            v-model="selectedSiteTypes"
            :items="siteTypes"
            label="Site Types"
            multiple
            clearable
            rounded
            hide-details
            density="compact"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip
                v-if="selectedSiteTypes.length === 1"
                color="green"
                rounded
              >
                <span>{{ truncateText(item.title, 25) }}</span>
              </v-chip>

              <span v-else-if="index === 0">
                Types
                <v-chip color="green" rounded>
                  {{ selectedSiteTypes.length }}
                </v-chip>
              </span>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Ref } from 'vue'
import { Thing } from '@/types'
import { siteTypes } from '@/vocabularies'

const selectedSiteTypes: Ref<string[]> = ref([])
const selectedOrganizations: Ref<string[]> = ref([])

const emit = defineEmits(['filter'])
const props = defineProps({
  things: {
    type: Array as () => Thing[],
    required: true,
  },
})

const organizations = computed(() =>
  Array.from(
    new Set(
      props.things
        .flatMap((t) => t.owners.map((owner) => owner.organizationName))
        .filter((name): name is string => Boolean(name))
    )
  ).sort((a, b) => a.localeCompare(b))
)

const isOrgValid = (thing: Thing) =>
  selectedOrganizations.value.length === 0 ||
  thing.owners.some(
    (o) =>
      o.isPrimaryOwner &&
      o.organizationName &&
      selectedOrganizations.value.includes(o.organizationName)
  )

const isTypeValid = (thing: Thing) =>
  selectedSiteTypes.value.length === 0 ||
  selectedSiteTypes.value.includes(thing.siteType)

const emitFilteredThings = () => {
  const filteredThings = props.things.filter(
    (thing) => isOrgValid(thing) && isTypeValid(thing)
  )
  emit('filter', filteredThings)
}

watch([selectedSiteTypes, selectedOrganizations], emitFilteredThings)

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
</script>
