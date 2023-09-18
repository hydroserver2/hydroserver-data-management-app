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
      try {
        const data = await api.fetch('/data/things')
        this.$patch({
          things: Object.fromEntries(
            data.map((thing: Thing) => [thing.id, thing])
          ),
          loaded: true,
        })
      } catch (error) {
        console.error('Error fetching things', error)
      }
    },
    async fetchThingById(id: string) {
      if (this.things[id]) return
      try {
        const data = await api.fetch(`/data/things/${id}`)
        this.$patch({ things: { ...this.things, [id]: data } })
      } catch (error) {
        console.error('Error fetching thing by id', error)
      }
    },
    async createThing(newThing: Thing) {
      try {
        const data = await api.post(`/data/things`, newThing)
        console.log('back from backend', data)
        this.$patch({ things: { ...this.things, [data.id]: data } })
        return data
      } catch (error) {
        console.error('Error creating thing', error)
      }
    },
    async updateThing(updatedThing: Thing) {
      try {
        const data = await api.patch(
          `/data/things/${updatedThing.id}`,
          updatedThing,
          this.things[updatedThing.id]
        )
        this.things[updatedThing.id] = data as Thing
      } catch (error) {
        console.error('Error updating thing', error)
      }
    },
    async updateThingPrivacy(id: string, thingPrivacy: boolean) {
      try {
        const data = await api.patch(`/data/things/${id}/privacy`, {
          isPrivate: thingPrivacy,
        })
        this.things[id] = data as Thing
      } catch (error) {
        console.error('Error fetching thing privacy', error)
      }
    },
    async deleteThing(thingId: string) {
      try {
        await api.delete(`/data/things/${thingId}`)
        delete this.things[thingId]
      } catch (error) {
        console.error('Error deleting thing', error)
      }
    },
    async addSecondaryOwner(thingId: string, email: string) {
      try {
        const data = await api.patch(`/data/things/${thingId}/ownership`, {
          email: email,
          makeOwner: true,
        })
        this.things[thingId] = data
      } catch (error) {
        console.error('Error adding secondary owner', error)
      }
    },
    async transferPrimaryOwnership(thingId: string, email: string) {
      try {
        const data = await api.patch(`/data/things/${thingId}/ownership`, {
          email: email,
          transferPrimary: true,
        })
        this.things[thingId] = data
      } catch (error) {
        console.error('Error transferring thing ownership', error)
      }
    },
    async removeOwner(thingId: string, email: string) {
      try {
        const data = await api.patch(`/data/things/${thingId}/ownership`, {
          email: email,
          removeOwner: true,
        })
        this.things[thingId] = data
      } catch (error) {
        console.error('Error removing owner from thing', error)
      }
    },
    async fetchPrimaryOwnerMetadataByThingId(id: string) {
      try {
        const data = await api.fetch(`/data/things/${id}/metadata`)
        this.$patch({ POMetadata: { ...this.POMetadata, [id]: data } })
      } catch (error) {
        console.error('Error fetching primary owner metadata', error)
      }
    },
  },
})
