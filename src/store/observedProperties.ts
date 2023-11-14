import { defineStore } from 'pinia'
import { ObservedProperty } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'
import { useUserStore } from './user'

export const useObservedPropertyStore = defineStore('observedProperties', {
  state: () => ({
    observedProperties: [] as ObservedProperty[],
    loaded: false,
  }),
  getters: {
    ownedOP(): ObservedProperty[] {
      const { user } = useUserStore()
      if (!user?.email) return []
      return this.observedProperties.filter((op) => op.owner === user.email)
    },
    unownedOP(): ObservedProperty[] {
      return this.observedProperties.filter((op) => op.owner == null)
    },
    dataByUser(): (ownerEmail: string) => ObservedProperty[] {
      return (ownerEmail: string) =>
        this.observedProperties.filter((op) => op.owner === ownerEmail)
    },
  },
  actions: {
    sortObservedProperties() {
      this.observedProperties.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchObservedProperties() {
      // if (this.observedProperties.length > 0) return
      try {
        this.observedProperties = await api.fetch(ENDPOINTS.OBSERVED_PROPERTIES)
        this.sortObservedProperties()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching observed properties from DB', error)
      }
    },
    async createObservedProperty(observedProperty: ObservedProperty) {
      try {
        const data = await api.post(
          ENDPOINTS.OBSERVED_PROPERTIES,
          observedProperty
        )
        this.observedProperties.push(data)
        this.sortObservedProperties()
        return data
      } catch (error) {
        console.error('Error creating observed property', error)
      }
    },
    async updateObservedProperty(observedProperty: ObservedProperty) {
      try {
        await api.patch(
          ENDPOINTS.OBSERVED_PROPERTIES.ID(observedProperty.id),
          observedProperty,
          this.getById(observedProperty.id)
        )
        const index = this.observedProperties.findIndex(
          (op) => op.id === observedProperty.id
        )
        if (index !== -1) {
          this.observedProperties[index] = observedProperty
        }
        this.sortObservedProperties()
      } catch (error) {
        console.error('Error updating observed property', error)
      }
    },
    async deleteObservedProperty(id: string) {
      try {
        await api.delete(ENDPOINTS.OBSERVED_PROPERTIES.ID(id))
        this.observedProperties = this.observedProperties.filter(
          (op) => op.id !== id
        )
        this.sortObservedProperties()
      } catch (error) {
        console.error('Error deleting observed property', error)
      }
    },
    getById(id: string) {
      const op = this.observedProperties.find((op) => op.id === id)
      if (!op) throw new Error(`Observed Property with id ${id} not found`)
      return op
    },
  },
})
