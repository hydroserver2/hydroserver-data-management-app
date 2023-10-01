import { defineStore } from 'pinia'
import {ProcessingLevel, Sensor} from '@/types'
import { api } from '@/utils/api/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useSensorStore = defineStore('sensor', {
  state: () => ({ sensors: [] as Sensor[], loaded: false }),
  getters: {
    ownedSensors(): Sensor[] {
      return this.sensors.filter((sensor) => sensor.owner != null)
    },
    unownedSensors(): Sensor[] {
      return this.sensors.filter((sensor) => sensor.owner == null)
    },
  },
  actions: {
    sortSensors() {
      this.sensors.sort((a, b) => a.name.localeCompare(b.name))
    },
    async fetchSensors() {
      if (this.sensors.length > 0) return
      try {
        const data = await api.fetch(ENDPOINTS.SENSORS)
        this.sensors = data
        this.sortSensors()
        this.loaded = true
      } catch (error) {
        console.error('Error fetching units from DB', error)
      }
    },
    async updateSensor(sensor: Sensor) {
      try {
        const data = await api.patch(
          ENDPOINTS.SENSORS.ID(sensor.id),
          sensor,
          this.getSensorById(sensor.id)
        )
        const index = this.sensors.findIndex((s) => s.id === sensor.id)
        if (index !== -1 && data) this.sensors[index] = data
        this.sortSensors()
      } catch (error) {
        console.error('Error updating sensor', error)
      }
    },
    async createSensor(sensor: Sensor) {
      try {
        const data = await api.post(ENDPOINTS.SENSORS, sensor)
        this.sensors.push(data)
        this.sortSensors()
        return data
      } catch (error) {
        console.error('Error creating sensor', error)
      }
    },
    async deleteSensor(id: string) {
      try {
        await api.delete(ENDPOINTS.SENSORS.ID(id))
        this.sensors = this.sensors.filter((sensor) => sensor.id !== id)
        this.sortSensors()
      } catch (error) {
        console.error('Error deleting sensor', error)
      }
    },
    getSensorById(id: string) {
      const sensor = this.sensors.find((sensor) => sensor.id === id)
      if (!sensor) throw new Error(`Processing Level with id ${id} not found`)
      return sensor
    },
  },
})
