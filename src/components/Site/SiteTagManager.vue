<template>
  <h6 class="text-h6 my-5">
    Add Additional Metadata
    <v-tooltip>
      <template v-slot:activator="{ props }">
        <v-icon small class="ml-2" color="grey lighten-1" v-bind="props">
          mdi-help-circle-outline
        </v-icon>
      </template>
      <template v-slot:default>
        <p>
          Use site metadata tags to add additional metadata to a site. Specify a
          key and value for each metadata property.
        </p>
        <p>
          On the 'Your Sites' page, you'll be able to filter and color your
          sites by these metadata tags. For example, you can filter by only the
          sites that have a specific key and color code the markers on the map
          by the values of that key.
        </p>
        <p>
          Additionally, if a URL is added as a value, it will be clickable from
          the Site Details page, allowing direct access to relevant links.
        </p>
      </template>
    </v-tooltip>
  </h6>

  <v-row class="mt-8" align="center">
    <v-col cols="5">
      <v-combobox
        density="comfortable"
        v-model="selectedKey"
        :items="Object.keys(workspaceTags)"
        label="Key"
        :hide-details="!isKeyUsed"
        :error-messages="
          isKeyUsed ? 'A key may only be used once per site.' : ''
        "
      />
    </v-col>
    <v-col cols="5">
      <v-combobox
        density="comfortable"
        v-model="selectedValue"
        :items="workspaceTags[selectedKey]"
        :disabled="!selectedKey || isKeyUsed"
        label="Value"
        hide-details
      >
      </v-combobox>
    </v-col>
    <v-col>
      <v-btn
        :disabled="!selectedKey || !selectedValue || isKeyUsed"
        @click="addTag"
        >Add</v-btn
      >
    </v-col>
  </v-row>

  <v-row>
    <v-col>
      <v-chip
        v-for="(tag, index) in previewTags"
        rounded="true"
        :color="materialColors[index % materialColors.length]"
        :key="tag.key"
        closable
        class="mr-1 mb-1"
        @click:close="previewTags.splice(index, 1)"
      >
        {{ tag.key }}: {{ tag.value }}
      </v-chip>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { materialColors } from '@/utils/materialColors'
import { storeToRefs } from 'pinia'
import { useTagStore } from '@/store/tags'
import { useWorkspaceTags } from '@/composables/useWorkspaceTags'

const props = defineProps({ thingId: String })
const { tags, previewTags } = storeToRefs(useTagStore())
const { tags: workspaceTags } = useWorkspaceTags()

const selectedKey = ref('')
const selectedValue = ref('')

const isKeyUsed = computed(() =>
  previewTags.value.some((tag) => tag.key === selectedKey.value)
)

const addTag = () => {
  if (selectedKey.value === '' || selectedValue.value === '') {
    return
  }
  previewTags.value.push({ key: selectedKey.value, value: selectedValue.value })
  selectedKey.value = ''
  selectedValue.value = ''
}

onMounted(async () => {
  previewTags.value = props.thingId ? [...tags.value] : []
})
</script>
