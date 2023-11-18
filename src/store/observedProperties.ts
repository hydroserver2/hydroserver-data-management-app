import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ObservedProperty } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'
import { useUserStore } from './user'

export const useObservedPropertyStore = defineStore(
  'observedProperties',
  () => {
    const observedProperties = ref<ObservedProperty[]>([])
    const loaded = ref(false)

    const userStore = useUserStore()

    const ownedOP = computed(() => {
      if (!userStore.user.email) return []
      return observedProperties.value.filter(
        (op) => op.owner === userStore.user.email
      )
    })

    const sortObservedProperties = () => {
      observedProperties.value.sort((a, b) => a.name.localeCompare(b.name))
    }

    const fetchObservedProperties = async () => {
      try {
        observedProperties.value = await api.fetch(
          ENDPOINTS.OBSERVED_PROPERTIES
        )
        sortObservedProperties()
        loaded.value = true
      } catch (error) {
        console.error('Error fetching observed properties from DB', error)
      }
    }

    const createObservedProperty = async (
      observedProperty: ObservedProperty
    ) => {
      try {
        const data = await api.post(
          ENDPOINTS.OBSERVED_PROPERTIES,
          observedProperty
        )
        observedProperties.value.push(data)
        sortObservedProperties()
        return data
      } catch (error) {
        console.error('Error creating observed property', error)
      }
    }

    const updateObservedProperty = async (
      observedProperty: ObservedProperty
    ) => {
      try {
        await api.patch(
          ENDPOINTS.OBSERVED_PROPERTIES.ID(observedProperty.id),
          observedProperty
        )
        const index = observedProperties.value.findIndex(
          (op) => op.id === observedProperty.id
        )
        if (index !== -1) {
          observedProperties.value[index] = observedProperty
        }
        sortObservedProperties()
      } catch (error) {
        console.error('Error updating observed property', error)
      }
    }

    const deleteObservedProperty = async (id: string) => {
      try {
        await api.delete(ENDPOINTS.OBSERVED_PROPERTIES.ID(id))
        observedProperties.value = observedProperties.value.filter(
          (op) => op.id !== id
        )
        sortObservedProperties()
      } catch (error) {
        console.error('Error deleting observed property', error)
      }
    }

    const getById = (id: string) => {
      const op = observedProperties.value.find((op) => op.id === id)
      if (!op) throw new Error(`Observed Property with id ${id} not found`)
      return op
    }

    return {
      observedProperties,
      loaded,
      ownedOP,
      sortObservedProperties,
      fetchObservedProperties,
      createObservedProperty,
      updateObservedProperty,
      deleteObservedProperty,
      getById,
    }
  }
)
