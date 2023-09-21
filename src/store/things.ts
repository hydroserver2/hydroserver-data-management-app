import { defineStore } from 'pinia'
import { Thing, ThingMetadata } from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

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
        const data = await api.fetch(ENDPOINTS.THINGS)
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
        const data = await api.fetch(ENDPOINTS.THINGS.ID(id))
        this.$patch({ things: { ...this.things, [id]: data } })
      } catch (error) {
        console.error('Error fetching thing by id', error)
      }
    },
    async createThing(newThing: Thing) {
      try {
        const data = await api.post(ENDPOINTS.THINGS, newThing)
        this.$patch({ things: { ...this.things, [data.id]: data } })
        return data
      } catch (error) {
        console.error('Error creating thing', error)
      }
    },
    async updateThing(updatedThing: Thing) {
      try {
        const data = await api.patch(
          ENDPOINTS.THINGS.ID(updatedThing.id),
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
        const data = await api.patch(ENDPOINTS.THINGS.PRIVACY(id), {
          isPrivate: thingPrivacy,
        })
        this.things[id] = data as Thing
      } catch (error) {
        console.error('Error fetching thing privacy', error)
      }
    },
    async deleteThing(thingId: string) {
      try {
        await api.delete(ENDPOINTS.THINGS.ID(thingId))
        delete this.things[thingId]
      } catch (error) {
        console.error('Error deleting thing', error)
      }
    },
    async addSecondaryOwner(thingId: string, email: string) {
      try {
        const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
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
        const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
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
        const data = await api.patch(ENDPOINTS.THINGS.OWNERSHIP(thingId), {
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
        const data = await api.fetch(ENDPOINTS.THINGS.METADATA(id))
        this.$patch({ POMetadata: { ...this.POMetadata, [id]: data } })
      } catch (error) {
        console.error('Error fetching primary owner metadata', error)
      }
    },
  },
})
