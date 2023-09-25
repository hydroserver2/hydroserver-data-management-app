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
        const data = await api.fetch(ENDPOINTS.PHOTOS.FOR_THING(thingId))
        this.photos[thingId] = data
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
        const data = new FormData()
        newPhotos.forEach((photo) => data.append(`photos`, photo))
        photosToDelete.forEach((id) => data.append(`photosToDelete`, id))

        const photos = await api.post(
          ENDPOINTS.PHOTOS.FOR_THING(thingId),
          data,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        this.photos[thingId] = photos
      } catch (error) {
        console.error('Error updating photos', error)
      } finally {
        this.loading = false
      }
    },
  },
})
