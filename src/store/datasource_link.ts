import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/constants'
import { api } from '@/services/apiMethods'

export const useSiteLinkDataSourceFormStore = defineStore(
  'site-link-data-source-form-store',
  () => {
    const formLoaded = ref(false)
    const datastreamId = ref<string | undefined>()
    const dataSources = ref<any[]>([])
    const linkedDataSource = ref<any | null>(null)
    const selectedDataSource = ref<any | null>(null)
    const linkedColumn = ref<string | number | undefined>()
    const selectedColumn = ref<string | number | undefined>()

    const savable = computed(() => {
      return (
        formLoaded.value &&
        ((linkedDataSource.value || {}).name !== selectedDataSource.value ||
          linkedColumn.value !== selectedColumn.value)
      )
    })

    const fetchDatastreams = async (thingId: string, dsId: string) => {
      const response = await api.fetch(ENDPOINTS.DATASTREAMS.FOR_THING(thingId))
      return response.filter((ds: any) => ds.id === dsId)[0]
    }

    const fetchDataSources = async () => {
      dataSources.value = await api.fetch(ENDPOINTS.DATA_SOURCES)
    }

    const fillForm = (dsId: string, dataSourceId: string, column: any) => {
      let dataSource = dataSources.value.find((ds) => ds.id === dataSourceId)
      datastreamId.value = dsId
      linkedColumn.value = column
      selectedColumn.value = column
      linkedDataSource.value = dataSource
      selectedDataSource.value = dataSource ? dataSource.name : null
    }

    const saveDataSource = async () => {
      let dataSource = dataSources.value.find(
        (ds) => ds.name === selectedDataSource.value
      )
      let datastreamBody = {
        dataSourceId: dataSource ? dataSource.id : null,
        dataSourceColumn: selectedColumn.value,
      }

      return await api.patch(
        `${ENDPOINTS.DATASTREAMS}/${datastreamId.value}`,
        datastreamBody
      )
    }

    return {
      formLoaded,
      dataSources,
      linkedDataSource,
      selectedDataSource,
      linkedColumn,
      selectedColumn,
      savable,
      fetchDatastreams,
      fetchDataSources,
      fillForm,
      saveDataSource,
    }
  }
)
