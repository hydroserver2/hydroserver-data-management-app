import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ResultQualifier } from '@/types'
import { api } from '@/services/api'

export const useResultQualifierStore = defineStore('resultQualifiers', () => {
  const resultQualifiers = ref<ResultQualifier[]>([])
  const loaded = ref(false)

  const ownedResultQualifiers = computed(() =>
    resultQualifiers.value.filter((rq) => rq.owner != null)
  )

  const sortResultQualifiers = () => {
    resultQualifiers.value.sort((a, b) => a.code.localeCompare(b.code))
  }

  const fetchResultQualifiers = async () => {
    try {
      resultQualifiers.value = await api.fetchResultQualifiers()
      sortResultQualifiers()
      loaded.value = true
    } catch (error) {
      console.error('Error fetching result qualifiers from DB', error)
    }
  }

  const updateResultQualifier = async (resultQualifier: ResultQualifier) => {
    try {
      await api.updateResultQualifier(resultQualifier)
      const index = resultQualifiers.value.findIndex(
        (rq) => rq.id === resultQualifier.id
      )
      if (index !== -1) resultQualifiers.value[index] = resultQualifier
      sortResultQualifiers()
    } catch (error) {
      console.error(`Error updating result qualifier with id`, error)
    }
  }

  const createResultQualifier = async (resultQualifier: ResultQualifier) => {
    try {
      const data = await api.createResultQualifier(resultQualifier)
      resultQualifiers.value.push(data)
      sortResultQualifiers()
      return data
    } catch (error) {
      console.error('Error creating result qualifier', error)
    }
  }

  const deleteResultQualifier = async (id: string) => {
    try {
      await api.deleteResultQualifier(id)
      resultQualifiers.value = resultQualifiers.value.filter(
        (rq) => rq.id !== id
      )
      sortResultQualifiers()
    } catch (error) {
      console.error('Error deleting result qualifier', error)
    }
  }

  const getById = (id: string) => {
    const resultQualifier = resultQualifiers.value.find(
      (rq) => rq.id.toString() === id.toString()
    )
    if (!resultQualifier)
      throw new Error(`Result Qualifier with id ${id} not found`)
    return resultQualifier
  }

  return {
    resultQualifiers,
    loaded,
    ownedResultQualifiers,
    sortResultQualifiers,
    fetchResultQualifiers,
    updateResultQualifier,
    createResultQualifier,
    deleteResultQualifier,
    getById,
  }
})
