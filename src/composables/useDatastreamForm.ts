import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Datastream } from '@/types'
import { useDatastreamStore } from '@/store/datastreams'
import { VForm } from 'vuetify/components'
import router from '@/router/router'

export function useDatastreamForm(thingId: string, datastreamId: string) {
  const valid = ref(false)
  const myForm = ref<VForm>()
  const datastreamStore = useDatastreamStore()
  const selectedDatastreamID = ref(datastreamId)
  const datastream = reactive<Datastream>(new Datastream(thingId))

  const formattedDatastreams = computed(() => {
    return datastreamStore.primaryOwnedDatastreams.map((ds) => ({
      id: ds.id,
      title: `Sensor:${ds.sensorName},  Observed Property: ${ds.observedPropertyName},  Unit: ${ds.unitName},  Processing Level: ${ds.processingLevelName},  Sampled Medium ${ds.sampledMedium}`,
    }))
  })

  watch(selectedDatastreamID, async () => {
    const sourceDatastream = datastreamStore.getDatastreamById(
      selectedDatastreamID.value
    )
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
    Object.assign(datastream, datastreamStore.getDatastreamById(id))
    datastream.thingId = thingId
  }

  async function loadDatastreams() {
    await datastreamStore.fetchDatastreams()
    if (datastreamId) populateForm(datastreamId)
  }

  async function uploadDatastream() {
    await myForm.value?.validate()
    if (!valid.value) return
    if (datastreamId) await datastreamStore.updateDatastream(datastream)
    else await datastreamStore.createDatastream(datastream)
    await router.push({ name: 'SingleSite', params: { id: thingId } })
  }

  onMounted(async () => loadDatastreams())

  return {
    datastream,
    selectedDatastreamID,
    formattedDatastreams,
    uploadDatastream,
    valid,
    myForm,
  }
}
