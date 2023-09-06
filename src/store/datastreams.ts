import { defineStore } from 'pinia'
import { Datastream } from '@/types'
import { createPatchObject } from '@/utils/api'

export const useDatastreamStore = defineStore('datastreams', {
  state: () => ({
    datastreams: {} as Record<string, Datastream[]>,
    loaded: false,
  }),
  getters: {
    getDatastreamsByParameter:
      (state) =>
      (parameter_name: keyof Datastream, parameter_id: string | number) => {
        const datastreams = Object.values(state.datastreams).flat()
        return datastreams.filter((ds) => ds[parameter_name] === parameter_id)
      },
    primaryOwnedDatastreams: (state) => {
      const allDatastreams = Object.values(state.datastreams).flat()
      return allDatastreams.filter((ds) => ds.isPrimaryOwner)
    },
  },
  actions: {
    async fetchDatastreams() {
      try {
        const { data } = await this.$http.get('/data/datastreams')
        let newDatastreams: Record<string, Datastream[]> = {}
        data.forEach((datastream: Datastream) => {
          if (!newDatastreams[datastream.thingId]) {
            newDatastreams[datastream.thingId] = []
          }
          newDatastreams[datastream.thingId].push(datastream)
        })
        this.$patch({ datastreams: newDatastreams })
        this.loaded = true
      } catch (error) {
        console.error('Error fetching datastreams from DB', error)
      }
    },
    async fetchDatastreamsByThingId(id: string) {
      // if (this.datastreams[id]) return
      try {
        const { data } = await this.$http.get(`/data/datastreams/${id}`)
        this.datastreams[id] = data
      } catch (error) {
        console.error(
          `Error fetching datastreams for thing with id ${id} from DB`,
          error
        )
      }
    },
    async updateDatastream(datastream: Datastream) {
      try {
        const patchData = createPatchObject(
          this.getDatastreamById(datastream.id),
          datastream
        )
        const { data } = await this.$http.patch(
          `/data/datastreams/patch/${datastream.id}`,
          patchData
        )
        const datastreamsForThing = this.datastreams[data.thingId]
        const index = datastreamsForThing.findIndex((ds) => ds.id === data.id)
        if (index !== -1) datastreamsForThing[index] = data
      } catch (error) {
        console.error('Error updating datastream', error)
      }
    },
    async createDatastream(newDatastream: Datastream) {
      try {
        const { data } = await this.$http.post(
          `/data/datastreams/${newDatastream.thingId}`,
          newDatastream
        )
        if (!this.datastreams[newDatastream.thingId]) {
          this.datastreams[newDatastream.thingId] = []
        }
        this.datastreams[newDatastream.thingId].push(data)
      } catch (error) {
        console.error('Error creating datastream', error)
      }
    },
    async deleteDatastream(id: string, thingId: string) {
      try {
        const response = await this.$http.delete(`/data/datastreams/${id}/temp`)
        if (response && response.status == 200) {
          const datastreams = this.datastreams[thingId].filter(
            (datastream) => datastream.id !== id
          )
          this.$patch({
            datastreams: { ...this.datastreams, [thingId]: datastreams },
          })
        }
      } catch (error) {
        console.error(`Error deleting datastream with id ${id}`, error)
      }
    },
    async setVisibility(id: string, visibility: boolean) {
      try {
        const { data } = await this.$http.patch(
          `/data/datastreams/patch/${id}`,
          {
            isVisible: visibility,
          }
        )
        const datastreamIndex = this.datastreams[data.thingId].findIndex(
          (ds) => ds.id === id
        )
        if (datastreamIndex !== -1)
          this.datastreams[data.thingId][datastreamIndex] = data
        else {
          console.error(
            `Datastream with id ${id} not found in the datastreams list`
          )
        }
      } catch (error) {
        console.error(
          `Error toggling visibility for datastream with id ${id}`,
          error
        )
      }
    },
    getDatastreamForThingById(
      thingId: string,
      datastreamId: string
    ): Datastream | null {
      const thingDatastreams = this.datastreams[thingId]
      if (thingDatastreams) {
        const datastream = thingDatastreams.find((ds) => ds.id === datastreamId)
        return datastream ? datastream : null
      }
      return null
    },
    getDatastreamById(datastreamId: string): Datastream | null {
      for (const thingId in this.datastreams) {
        const thingDatastreams = this.datastreams[thingId]
        const datastream = thingDatastreams.find((ds) => ds.id === datastreamId)
        if (datastream) {
          return datastream
        }
      }
      return null
    },
  },
})
