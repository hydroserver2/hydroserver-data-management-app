<template>
  <h6 class="text-h6 my-4">Add Additional Metadata</h6>

  <v-row class="mt-8">
    <v-col cols="5">
      <v-combobox
        density="comfortable"
        v-model="formKey"
        :items="keyList"
        label="Key"
      />
    </v-col>
    <v-col cols="7">
      <v-combobox
        density="comfortable"
        v-model="formValue"
        :items="valueList"
        label="Value"
      >
        <template v-slot:append>
          <v-btn @click="addTag">Add</v-btn>
        </template>
      </v-combobox>
    </v-col>
  </v-row>

  <v-chip
    v-for="(tag, index) in previewTags"
    rounded="true"
    :color="materialColors[index % materialColors.length]"
    :key="tag.id"
    closable
    class="mr-1 mb-1"
    @click:close="removeTag(index)"
  >
    {{ tag.key }}: {{ tag.value }}
  </v-chip>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { materialColors } from '@/utils/materialColors'
import { storeToRefs } from 'pinia'
import { useTagStore } from '@/store/tags'
import { useUserTags } from '@/composables/useUserTags'

const props = defineProps({ thingId: String })
const { tags, previewTags } = storeToRefs(useTagStore())
const { formKey, formValue, keyList, valueList } = useUserTags()

const addTag = () => {
  if (formKey.value === '' || formValue.value === '') {
    return
  }
  previewTags.value.push({ key: formKey.value, value: formValue.value, id: '' })
  formKey.value = ''
  formValue.value = ''
}

const removeTag = (index: number) => previewTags.value.splice(index, 1)

onMounted(async () => {
  previewTags.value = props.thingId ? [...tags.value] : []
})
</script>
