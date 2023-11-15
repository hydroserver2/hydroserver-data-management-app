import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Unit } from '@/types'

export const useUnitStore = defineStore('units', () => {
  const units = ref<Unit[]>([])
  const timeUnits = computed(() => units.value.filter((u) => u.type === 'Time'))
  const unownedUnits = computed(() => units.value.filter((u) => !u.owner))

  const $reset = () => (units.value = [])

  const sortUnits = () => {
    units.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  const setUnits = (unitData: Unit[]) => (units.value = unitData)

  const updateUnit = (unit: Unit) => {
    const index = units.value.findIndex((u) => u.id === unit.id)
    if (index !== -1) units.value[index] = unit
    else units.value.push(unit)
  }

  const deleteUnit = (unitId: string) => {
    units.value = units.value.filter((unit) => unit.id !== unitId)
  }

  const getUnitById = (id: string) => {
    const unit = units.value.find((u) => u.id === id)
    if (!unit) throw new Error(`Unit with id ${id} not found`)
    return unit
  }

  return {
    units,
    unownedUnits,
    timeUnits,
    $reset,
    setUnits,
    deleteUnit,
    updateUnit,
    getUnitById,
    sortUnits,
  }
})
