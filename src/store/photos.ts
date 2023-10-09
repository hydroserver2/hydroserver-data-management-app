import { defineStore } from 'pinia'
import { Photo } from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const usePhotosStore = defineStore({
  id: 'photos',

  state: () => ({
    // Keyed by thingId
    photos: {} as Record<string, Array<Photo>>,
    loading: false,
  }),

  actions: {
    async fetchPhotos(thingId: string) {
      try {
        this.photos[thingId] = await api.fetch(
          ENDPOINTS.PHOTOS.FOR_THING(thingId)
        )
      } catch (error) {
        console.error('Error fetching photos from DB', error)
      }
    },

    async updatePhotos(
      thingId: string,
      newPhotos: File[],
      photosToDelete: string[]
    ) {
      try {
        this.loading = true
        if (newPhotos.length === 0 && photosToDelete.length === 0) return
        if (newPhotos.length > 0) {
          const data = new FormData()
          newPhotos.forEach((photo) => data.append('files', photo))
          this.photos[thingId] = await api.post(
            ENDPOINTS.PHOTOS.FOR_THING(thingId),
            data
          )
        }
        for (const photoId of photosToDelete) {
          await api.delete(ENDPOINTS.PHOTOS.FOR_THING(thingId, photoId))
        }
        this.photos[thingId] = this.photos[thingId].filter(
          (photo) => !photosToDelete.includes(photo.id)
        )
      } catch (error) {
        console.error('Error updating photos', error)
      } finally {
        this.loading = false
      }
    },
  },
})
