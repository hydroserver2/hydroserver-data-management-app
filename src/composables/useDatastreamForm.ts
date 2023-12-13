import { onMounted, reactive, ref, watch } from 'vue'
import { Datastream } from '@/types'
import { VForm } from 'vuetify/components'
import router from '@/router/router'
import { api } from '@/services/api'

export function useDatastreamForm(thingId: string, datastreamId: string) {
  const valid = ref(false)
  const myForm = ref<VForm>()
  const selectedDatastreamID = ref('')
  const datastream = reactive<Datastream>(new Datastream(thingId))

  watch(selectedDatastreamID, async () => {
    const fetchedDS = await api.fetchDatastream(selectedDatastreamID.value)
    if (!fetchedDS) return
    Object.assign(datastream, {
      ...datastream,
      sensorId: fetchedDS.sensorId,
      observedPropertyId: fetchedDS.observedPropertyId,
      processingLevelId: fetchedDS.processingLevelId,
      unitId: fetchedDS.unitId,
      timeAggregationIntervalUnitsId: fetchedDS.timeAggregationIntervalUnitsId,
      intendedTimeSpacingUnitsId: fetchedDS.intendedTimeSpacingUnitsId,
      name: fetchedDS.name,
      description: fetchedDS.description,
      sampledMedium: fetchedDS.sampledMedium,
      noDataValue: fetchedDS.noDataValue,
      aggregationStatistic: fetchedDS.aggregationStatistic,
      status: fetchedDS.status,
      timeAggregationInterval: fetchedDS.timeAggregationInterval,
      intendedTimeSpacing: fetchedDS.intendedTimeSpacing,
    })
    await myForm.value?.validate()
  })

  function populateForm(id: string) {
    selectedDatastreamID.value = id
    datastream.thingId = thingId
  }

  async function uploadDatastream() {
    await myForm.value?.validate()
    if (!valid.value) return
    if (datastreamId) {
      try {
        await api.updateDatastream(datastream)
      } catch (error) {
        console.error('Error updating datastream', error)
      }
    } else {
      try {
        await api.createDatastream(datastream)
      } catch (error) {
        console.error('Error creating datastream', error)
      }
    }
    router.push({ name: 'SiteDetails', params: { id: thingId } })
  }

  onMounted(async () => {
    if (datastreamId) {
      populateForm(datastreamId)
      datastream.id = datastreamId
    }
  })

  return {
    datastream,
    selectedDatastreamID,
    uploadDatastream,
    valid,
    myForm,
  }
}
