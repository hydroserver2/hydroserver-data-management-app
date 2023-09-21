import { defineStore } from 'pinia'
import { Unit } from '@/types'
import { ENDPOINTS } from '@/constants'
import { api } from '@/utils/api/apiMethods'

export const useUnitStore = defineStore('units', {
  state: () => ({ units: [] as Unit[], loaded: false }),
  getters: {
    ownedUnits(): Unit[] {
      return this.units.filter((u) => u.personId != null)
    },
    unownedUnits(): Unit[] {
      return this.units.filter((u) => u.personId == null)
    },
    timeUnits(): Unit[] {
      return this.units.filter((u) => u.type === 'Time' && u.personId == null)
    },
  },
  actions: {
    sortUnits() {
      this.units.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchUnits() {
      if (this.units.length > 0) return
      try {
        const data = await api.fetch(ENDPOINTS.UNITS)
        this.units = data
        this.sortUnits()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching units from DB', error)
      }
    },
    async createUnit(unit: Unit) {
      try {
        const data = await api.post(ENDPOINTS.UNITS, unit)
        this.units.push(data)
        this.sortUnits()
        return data
      } catch (error) {
        console.error('Error creating unit', error)
      }
    },
    async updateUnit(unit: Unit) {
      try {
        await api.patch(
          ENDPOINTS.UNITS.ID(unit.id),
          unit,
          this.getUnitById(unit.id)
        )
        const index = this.units.findIndex((u) => u.id === unit.id)
        if (index !== -1) this.units[index] = unit
        this.sortUnits()
      } catch (error) {
        console.error('Error updating unit', error)
      }
    },
    async deleteUnit(unitId: string) {
      try {
        await api.delete(ENDPOINTS.UNITS.ID(unitId))
        this.units = this.units.filter((unit) => unit.id !== unitId)
        this.sortUnits()
      } catch (error) {
        console.error('Error deleting unit', error)
      }
    },
    getUnitById(id: string) {
      const unit = this.units.find((u) => u.id.toString() === id.toString())
      if (!unit) throw new Error(`Unit with id ${id} not found`)
      return unit
    },
  },
})
