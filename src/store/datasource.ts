import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  ExtractorConfig,
  TransformerConfig,
  LoaderConfig,
  DataSource,
  ETLStep,
  Payload,
  Mapping,
} from '@hydroserver/client'
import { Snackbar } from '@/utils/notifications'
import hs, { Datastream, DatastreamExtended } from '@hydroserver/client'

export const useDataSourceStore = defineStore('datasource', () => {
  const selectedETLStep = ref<ETLStep>('extractor')
  const dataSource = ref(new DataSource())
  const linkedDatastreams = ref<Datastream[]>([])
  const draftDatastreams = ref<DatastreamExtended[]>([])

  const extractor = computed<ExtractorConfig>({
    get() {
      return dataSource.value.settings.extractor
    },
    set(newVal) {
      dataSource.value.settings.extractor = newVal
    },
  })

  const transformer = computed<TransformerConfig>({
    get() {
      return dataSource.value.settings.transformer
    },
    set(newVal) {
      dataSource.value.settings.transformer = newVal
    },
  })

  const loader = computed<LoaderConfig>({
    get() {
      return dataSource.value.settings.loader
    },
    set(newVal) {
      dataSource.value.settings.loader = newVal
    },
  })

  const isExtractorValid = ref(true)
  const isTransformerValid = ref(true)
  const isLoaderValid = ref(true)

  const payloads = computed<Payload[]>({
    get() {
      return dataSource.value?.settings?.payloads ?? []
    },
    set(newVal) {
      dataSource.value.settings.payloads = newVal
    },
  })

  // Remove MappingPath if datastream id is targetId. Remove mappings that now have no paths.
  function removeTargetFromPayload(
    payload: Payload,
    id: string | number
  ): void {
    const key = String(id)
    for (const m of payload.mappings) {
      m.paths = m.paths.filter((p) => String(p.targetIdentifier) !== key)
    }
    payload.mappings = payload.mappings.filter((m) => m.paths.length > 0)
  }

  async function updateLinkedDatastreams(
    newPayload?: Payload,
    oldPayload?: Payload
  ) {
    const newMappings: Mapping[] = newPayload?.mappings || []
    const oldMappings: Mapping[] = oldPayload?.mappings || []

    const newIds = new Set(
      newMappings.flatMap((m) => m.paths.map((p) => String(p.targetIdentifier)))
    )
    const oldIds = new Set(
      oldMappings.flatMap((m) => m.paths.map((p) => String(p.targetIdentifier)))
    )
    const addedIds = newIds.difference(oldIds)
    const removedIds = oldIds.difference(newIds)

    // Issue DELETE requests to before POST requests in case the user is switching
    if (removedIds.size > 0) {
      await Promise.all(
        [...removedIds].map((id) =>
          hs.dataSources
            .unlinkDatastream(dataSource.value.id, id)
            .catch((error) =>
              console.error(`Error unlinking datastream ${id}:`, error)
            )
        )
      )
    }

    if (addedIds.size > 0) {
      await Promise.all(
        [...addedIds].map((id) =>
          hs.dataSources
            .linkDatastream(dataSource.value.id, id)
            .catch((error) => {
              if (error.status === 400) {
                console.error(error.message)
                Snackbar.error(`Datastream already linked to a datasource.`)
                removeTargetFromPayload(newPayload!, id)
              } else {
                console.error(`Error linking datastream ${id}:`, error)
              }
            })
        )
      )
    }
  }

  return {
    dataSource,
    extractor,
    transformer,
    loader,
    payloads,
    selectedETLStep,
    isExtractorValid,
    isTransformerValid,
    isLoaderValid,
    linkedDatastreams,
    draftDatastreams,
    updateLinkedDatastreams,
  }
})
