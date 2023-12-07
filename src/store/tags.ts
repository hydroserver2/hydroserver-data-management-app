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
    try {
      const requests = newTags.value.map((tag) =>
        api.createSiteTag(thingId, tag)
      )
      await Promise.all(requests)
    } catch (error) {
      console.error('Failed to upload tags:', error)
    }
  }

  const deleteSelectedTags = async (thingId: string) => {
    if (deletedTags.value.length <= 0) return
    try {
      const requests = deletedTags.value.map((tag) =>
        api.deleteSiteTag(thingId, tag.id)
      )
      await Promise.all(requests)
    } catch (error) {
      console.error('Failed to upload tags:', error)
    }
  }

  const updateTags = async (thingId: string) => {
    try {
      await uploadNewTags(thingId)
      await deleteSelectedTags(thingId)
      tags.value = await api.fetchSiteTags(thingId)
    } catch (error) {
      console.error('Error updating tags', error)
    }
  }

  return {
    tags,
    previewTags,
    updateTags,
  }
})
