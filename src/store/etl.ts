import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  ExtractorConfig,
  TransformerConfig,
  LoaderConfig,
  DataSource,
  ETLStep,
} from '@/models/dataSource'
import { Payload } from '@/models'
import { SourceTargetMapping } from '@/models/payload'
import { api } from '@/services/api'
import { Snackbar } from '@/utils/notifications'

export const useETLStore = defineStore('etl', () => {
  const selectedETLStep = ref<ETLStep>('extractor')
  const dataSource = ref(new DataSource())

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

  async function updateLinkedDatastreams(
    newPayload?: Payload,
    oldPayload?: Payload
  ) {
    const newMappings: SourceTargetMapping[] = newPayload?.mappings || []
    const oldMappings: SourceTargetMapping[] = oldPayload?.mappings || []

    const newIds = new Set(newMappings.map((m) => String(m.targetIdentifier)))
    const oldIds = new Set(oldMappings.map((m) => String(m.targetIdentifier)))

    const addedIds = newIds.difference(oldIds)
    const removedIds = oldIds.difference(newIds)

    // Issue DELETE requests to before POST requests in case the user is switching
    if (removedIds.size > 0) {
      await Promise.all(
        [...removedIds].map((id) =>
          api
            .unlinkDatastreamFromDataSource(dataSource.value.id, id)
            .catch((error) =>
              console.error(`Error unlinking datastream ${id}:`, error)
            )
        )
      )
    }

    if (addedIds.size > 0) {
      await Promise.all(
        [...addedIds].map((id) =>
          api
            .linkDatastreamToDataSource(dataSource.value.id, id)
            .catch((error) => {
              if (error.status === 400) {
                console.error(error.message)
                Snackbar.error(
                  `Datastream is already linked to another datasource.`
                )
                // Remove the mapping with this targetIdentifier from newPayload.mappings.
                newPayload!.mappings = newPayload!.mappings.filter(
                  (mapping) => String(mapping.targetIdentifier) !== id
                )
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
    updateLinkedDatastreams,
  }
})
