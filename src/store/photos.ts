import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Photo } from '@/types'
import { api } from '@/services/api'

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<Photo[]>([])
  const newPhotos = ref<File[]>([])
  const photosToDelete = ref<string[]>([])
  const loading = ref(false)

  const uploadNewPhotos = async (thingId: string) => {
    if (!newPhotos.value.length) return

    const promises = newPhotos.value.map(async (file) => {
      const data = new FormData()
      data.append('file', file)
      return await api.uploadSitePhotos(thingId, data)
    })

    const newPhotoResponses = await Promise.all(promises)
    photos.value = [...photos.value, ...newPhotoResponses]
  }

  const deleteSelectedPhotos = async (thingId: string) => {
    if (!photosToDelete.value.length) return
    await Promise.all(
      photosToDelete.value.map((p) => api.deleteSitePhoto(thingId, p))
    )
    photos.value = photos.value.filter(
      (p) => !photosToDelete.value.includes(p.name)
    )
  }

  const updatePhotos = async (thingId: string) => {
    try {
      loading.value = true
      await uploadNewPhotos(thingId)
      await deleteSelectedPhotos(thingId)
    } catch (error) {
      console.error('Error updating photos', error)
    } finally {
      loading.value = false
      newPhotos.value = []
      photosToDelete.value = []
    }
  }

  return {
    photos,
    newPhotos,
    photosToDelete,
    loading,
    updatePhotos,
  }
})
