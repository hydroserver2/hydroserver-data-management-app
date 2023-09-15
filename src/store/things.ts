import { defineStore } from 'pinia'
import { Thing, ThingMetadata } from '@/types'
import { api } from '@/utils/api/apiMethods'

export const useThingStore = defineStore('things', {
  state: () => ({
    things: {} as Record<string, Thing>,
    POMetadata: {} as Record<string, ThingMetadata>,
    loaded: false,
  }),
  getters: {
    primaryOwnedThings(): Thing[] {
      return Object.values(this.things).filter((thing) => thing.isPrimaryOwner)
    },
    ownedThings(): Thing[] | any {
      return Object.values(this.things).filter((thing) => thing.ownsThing)
    },
  },
  actions: {
    async fetchThings() {
      if (this.loaded) return
      const data = await api.fetch('/data/things')
      if (!data) return
      this.$patch({
        things: Object.fromEntries(
          data.map((thing: Thing) => [thing.id, thing])
        ),
        loaded: true,
      })
    },
    async fetchThingById(id: string) {
      if (this.things[id]) return
      const data = await api.fetch(`/data/things/${id}`)
      if (!data) return
      this.$patch({ things: { ...this.things, [id]: data } })
    },
    async createThing(newThing: Thing) {
      const data = await api.post(`/data/things`, newThing)
      if (!data) return
      console.log('back from backend', data)
      this.$patch({ things: { ...this.things, [data.id]: data } })
      return data
    },
    async updateThing(updatedThing: Thing) {
      const data = await api.patch(
        `/data/things/${updatedThing.id}`,
        updatedThing,
        this.things[updatedThing.id]
      )
      if (!data) return
      this.things[updatedThing.id] = data as Thing
    },
    async updateThingPrivacy(id: string, thingPrivacy: boolean) {
      const data = await api.patch(`/data/things/${id}/privacy`, {
        isPrivate: thingPrivacy,
      })
      if (!data) return
      this.things[id] = data as Thing
    },
    async deleteThing(thingId: string) {
      const data = await api.delete(`/data/things/${thingId}`)
      if (!data) return
      delete this.things[thingId]
    },
    async addSecondaryOwner(thingId: string, email: string) {
      const data = await api.patch(`/data/things/${thingId}/ownership`, {
        email: email,
        makeOwner: true,
      })
      if (!data) return
      this.things[thingId] = data
    },
    async transferPrimaryOwnership(thingId: string, email: string) {
      const data = await api.patch(`/data/things/${thingId}/ownership`, {
        email: email,
        transferPrimary: true,
      })
      if (!data) return
      this.things[thingId] = data
    },
    async removeOwner(thingId: string, email: string) {
      const data = await api.patch(`/data/things/${thingId}/ownership`, {
        email: email,
        removeOwner: true,
      })
      if (!data) return
      this.things[thingId] = data
    },
    async fetchPrimaryOwnerMetadataByThingId(id: string) {
      const data = await api.fetch(`/data/things/${id}/metadata`)
      if (!data) return
      this.$patch({ POMetadata: { ...this.POMetadata, [id]: data } })
    },
  },
})
