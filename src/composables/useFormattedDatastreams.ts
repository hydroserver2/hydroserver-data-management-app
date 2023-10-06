import { onMounted, computed } from 'vue'
import {
  useUnitGetters,
  useSensorGetters,
  useProcessingLevelGetters,
  useObservedPropertiesGetters,
} from '@/composables/useMetadataGetters'
import { useDatastreamStore } from '@/store/datastreams'

export function useFormattedDatastreams() {
  const datastreamStore = useDatastreamStore()

  const { getNameById: unitName } = useUnitGetters()
  const { getNameById: sensorName } = useSensorGetters()
  const { getNameById: PLName } = useProcessingLevelGetters()
  const { getNameById: OPName } = useObservedPropertiesGetters()

  //   TODO: We don't want a list of ALL the datastreams. Probably we want to to select a thing, then
  //   show a list of the datastreams for just that thing
  const formattedDatastreams = computed(() => {
    const flatDatastreams = Object.values(datastreamStore.datastreams).flat()

    // TODO: Temporary hack to filter down to only the datastreams the user owns.
    // If they don't have the sensorName, then they're not an owner of it
    const filteredDatastreams = flatDatastreams.filter(
      (ds) => sensorName(ds.sensorId) !== null
    )

    return filteredDatastreams.map((ds) => ({
      id: ds.id,
      title: `Sensor:${sensorName(ds.sensorId)},  Observed Property: ${OPName(
        ds.observedPropertyId
      )},  Unit: ${unitName(ds.unitId)},  Processing Level: ${PLName(
        ds.processingLevelId
      )},  Sampled Medium ${ds.sampledMedium}`,
    }))
  })

  onMounted(async () => {
    // if (datastreamStore.datastreams) return
    await datastreamStore.fetchDatastreams()
  })

  return { formattedDatastreams }
}
