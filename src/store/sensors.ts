import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Sensor } from '@/types'
import { api } from '@/services/apiMethods'
import { ENDPOINTS } from '@/constants'

export const useSensorStore = defineStore('sensor', () => {
  const sensors = ref<Sensor[]>([])
  const loaded = ref(false)

  const sortSensors = () => {
    sensors.value.sort((a, b) => a.name.localeCompare(b.name))
  }

  const fetchSensors = async () => {
    try {
      const data = await api.fetch(ENDPOINTS.SENSORS)
      sensors.value = data
      sortSensors()
      loaded.value = true
    } catch (error) {
      console.error('Error fetching sensors from DB', error)
    }
  }

  const updateSensor = async (sensor: Sensor) => {
    try {
      const data = await api.patch(ENDPOINTS.SENSORS.ID(sensor.id), sensor)
      const index = sensors.value.findIndex((s) => s.id === sensor.id)
      if (index !== -1 && data) sensors.value[index] = data
      sortSensors()
    } catch (error) {
      console.error('Error updating sensor', error)
    }
  }

  const createSensor = async (sensor: Sensor) => {
    try {
      const data = await api.post(ENDPOINTS.SENSORS, sensor)
      sensors.value.push(data)
      sortSensors()
      return data
    } catch (error) {
      console.error('Error creating sensor', error)
    }
  }

  const deleteSensor = async (id: string) => {
    try {
      await api.delete(ENDPOINTS.SENSORS.ID(id))
      sensors.value = sensors.value.filter((sensor) => sensor.id !== id)
      sortSensors()
    } catch (error) {
      console.error('Error deleting sensor', error)
    }
  }

  const getSensorById = (id: string) => {
    const sensor = sensors.value.find((sensor) => sensor.id === id)
    if (!sensor) throw new Error(`Sensor with id ${id} not found`)
    return sensor
  }

  return {
    sensors,
    loaded,
    sortSensors,
    fetchSensors,
    updateSensor,
    createSensor,
    deleteSensor,
    getSensorById,
  }
})
