import { onMounted, reactive, ref, watch } from 'vue'
import { Datastream } from '@/types'
import { useDatastreamStore } from '@/store/datastreams'
import { VForm } from 'vuetify/components'
import router from '@/router/router'
import { storeToRefs } from 'pinia'

export function useDatastreamForm(thingId: string, datastreamId: string) {
  const valid = ref(false)
  const myForm = ref<VForm>()
  const { updateDatastream, createDatastream, fetchDatastreams } =
    useDatastreamStore()
  const { datastreams } = storeToRefs(useDatastreamStore())
  const selectedDatastreamID = ref('')
  const datastream = reactive<Datastream>(new Datastream(thingId))

  watch(selectedDatastreamID, async () => {
    const sourceDatastream = Object.values(datastreams.value)
      .flat()
      .find((ds) => ds.id === selectedDatastreamID.value)
    if (!sourceDatastream) return
    Object.assign(datastream, {
      ...datastream,
      sensorId: sourceDatastream.sensorId,
      observedPropertyId: sourceDatastream.observedPropertyId,
      processingLevelId: sourceDatastream.processingLevelId,
      unitId: sourceDatastream.unitId,
      timeAggregationIntervalUnitsId:
        sourceDatastream.timeAggregationIntervalUnitsId,
      intendedTimeSpacingUnitsId: sourceDatastream.intendedTimeSpacingUnitsId,
      name: sourceDatastream.name,
      description: sourceDatastream.description,
      sampledMedium: sourceDatastream.sampledMedium,
      noDataValue: sourceDatastream.noDataValue,
      aggregationStatistic: sourceDatastream.aggregationStatistic,
      status: sourceDatastream.status,
      timeAggregationInterval: sourceDatastream.timeAggregationInterval,
      intendedTimeSpacing: sourceDatastream.intendedTimeSpacing,
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
    if (datastreamId) await updateDatastream(datastream)
    else await createDatastream(datastream)
    await router.push({ name: 'SiteDetails', params: { id: thingId } })
  }

  onMounted(async () => {
    await fetchDatastreams()
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
