import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Photo } from '@/types'
import { api } from '@/services/api'

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<Record<string, Array<Photo>>>({})
  const loading = ref(false)

  const fetchPhotos = async (thingId: string) => {
    try {
      photos.value[thingId] = await api.fetchSitePhotos(thingId)
    } catch (error) {
      console.error('Error fetching photos from DB', error)
    }
  }

  const updatePhotos = async (
    thingId: string,
    newPhotos: File[],
    photosToDelete: string[]
  ) => {
    try {
      loading.value = true
      if (newPhotos.length === 0 && photosToDelete.length === 0) return
      if (newPhotos.length > 0) {
        const data = new FormData()
        newPhotos.forEach((photo) => data.append('files', photo))
        photos.value[thingId] = await api.uploadSitePhotos(thingId, data)
      }
      for (const photoId of photosToDelete) {
        await api.deleteSitePhoto(thingId, photoId)
      }
      photos.value[thingId] = photos.value[thingId].filter(
        (photo) => !photosToDelete.includes(photo.id)
      )
    } catch (error) {
      console.error('Error updating photos', error)
    } finally {
      loading.value = false
    }
  }

  return {
    photos,
    loading,
    fetchPhotos,
    updatePhotos,
  }
})
