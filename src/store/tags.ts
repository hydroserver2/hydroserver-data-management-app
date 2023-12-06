import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { Tag } from '@/types'
import { api } from '@/services/api'

export const useTagStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const previewTags = ref<Tag[]>([])

  const deletedTags = computed(() =>
    tags.value.filter(
      (storedTag) => !previewTags.value.some((t) => t.id === storedTag.id)
    )
  )
  const newTags = computed(() =>
    previewTags.value.filter(
      (pt) =>
        !tags.value.some((st) => st.key === pt.key && st.value === pt.value)
    )
  )

  const uploadNewTags = async (thingId: string) => {
    if (newTags.value.length <= 0) return
    tags.value = await api.uploadSiteTags(thingId, newTags.value)
  }

  const deleteSelectedTags = async (thingId: string) => {
    for (const tag of deletedTags.value) {
      await api.deleteSiteTag(thingId, tag.id)
    }
    tags.value = tags.value.filter(
      (t) => !deletedTags.value.some((d) => d.id === t.id)
    )
  }

  const updateTags = async (thingId: string) => {
    try {
      await uploadNewTags(thingId)
      await deleteSelectedTags(thingId)
    } catch (error) {
      console.error('Error updating tags', error)
    } finally {
      tags.value = []
    }
  }

  return {
    tags,
    previewTags,
    updateTags,
  }
})
