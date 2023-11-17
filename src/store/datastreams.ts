import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Datastream } from '@/types'
import { api } from '@/services/api'

export const useDatastreamStore = defineStore('datastreams', () => {
  const datastreams = ref<Record<string, Datastream[]>>({})
  const loaded = ref(false)
  const fetching = ref(false)
  const loadedUsersDatastreams = ref(false)

  const fetchDatastreams = async (reload = false) => {
    // if (this.datastreams && !reload) return
    try {
      const data = await api.fetchDatastreams()
      let newDatastreams = groupDatastreamsByThingId(data)
      datastreams.value = newDatastreams
      loaded.value = true
    } catch (error) {
      console.error('Error fetching datastreams from DB', error)
    }
  }

  const fetchUsersDatastreams = async (reload = false) => {
    // if (this.fetching || (this.loadedUsersDatastreams && !reload)) return
    try {
      fetching.value = true
      const data = await api.fetchUsersDatastreams()
      let datastreamMap = groupDatastreamsByThingId(data)

      // Replace the existing datastreams with the new set for each thingId
      for (const thingId in datastreamMap) {
        datastreams.value[thingId] = datastreamMap[thingId]
      }

      loadedUsersDatastreams.value = true
    } catch (error) {
      console.error('Error fetching user datastreams from DB', error)
    } finally {
      fetching.value = false
    }
  }

  const groupDatastreamsByThingId = (datastreamsArray: Datastream[]) => {
    const grouped: Record<string, Datastream[]> = {}
    datastreamsArray.forEach((datastream) => {
      if (!grouped[datastream.thingId]) {
        grouped[datastream.thingId] = []
      }
      grouped[datastream.thingId].push(datastream)
    })
    return grouped
  }

  const fetchDatastreamsByThingId = async (id: string, reload = false) => {
    if (fetching.value) return
    fetching.value = true
    try {
      const data = await api.fetchDatastreamsForThing(id)
      datastreams.value[id] = data
      return data
    } catch (error) {
      console.error(`Error fetching datastreams by thingID`, error)
    } finally {
      fetching.value = false
    }
  }
  const updateDatastream = async (datastream: Datastream) => {
    try {
      const data = await api.updateDatastream(datastream)
      const datastreamsForThing = datastreams.value[data.thingId]
      const index = datastreamsForThing.findIndex((ds) => ds.id === data.id)
      if (index !== -1 && data) {
        datastreamsForThing[index] = data
      }
    } catch (error) {
      console.error('Error updating datastream', error)
    }
  }

  const createDatastream = async (newDatastream: Datastream) => {
    try {
      const data = await api.createDatastream(newDatastream)
      if (!datastreams.value[newDatastream.thingId]) {
        datastreams.value[newDatastream.thingId] = []
      }
      datastreams.value[newDatastream.thingId].push(data)
    } catch (error) {
      console.error('Error creating datastream', error)
    }
  }

  const deleteDatastream = async (id: string, thingId: string) => {
    try {
      await api.deleteDatastream(id)
      datastreams.value[thingId] = datastreams.value[thingId].filter(
        (ds) => ds.id !== id
      )
    } catch (error) {
      console.error(`Error deleting datastream with id ${id}`, error)
    }
  }

  return {
    datastreams,
    loaded,
    fetching,
    loadedUsersDatastreams,
    fetchDatastreams,
    fetchUsersDatastreams,
    groupDatastreamsByThingId,
    fetchDatastreamsByThingId,
    updateDatastream,
    createDatastream,
    deleteDatastream,
  }
})
