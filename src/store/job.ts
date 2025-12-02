import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  ExtractorConfig,
  TransformerConfig,
  LoaderConfig,
  Job,
  ETLStep,
  Task,
} from '@hydroserver/client'
import hs, { Datastream, DatastreamExtended } from '@hydroserver/client'

export const useJobStore = defineStore('job', () => {
  const selectedETLStep = ref<ETLStep>('extractor')
  const job = ref(new Job())
  const linkedDatastreams = ref<Datastream[]>([])
  const draftDatastreams = ref<DatastreamExtended[]>([])

  const extractor = computed<ExtractorConfig>({
    get() {
      return job.value.extractor
    },
    set(newVal) {
      job.value.extractor = newVal
    },
  })

  const transformer = computed<TransformerConfig>({
    get() {
      return job.value.transformer
    },
    set(newVal) {
      job.value.transformer = newVal
    },
  })

  const loader = computed<LoaderConfig>({
    get() {
      return job.value.loader
    },
    set(newVal) {
      job.value.loader = newVal
    },
  })

  const isExtractorValid = ref(true)
  const isTransformerValid = ref(true)
  const isLoaderValid = ref(true)

  // const payloads = computed<Task[]>({
  //   get() {
  //     return job.value?.payloads ?? []
  //   },
  //   set(newVal) {
  //     job.value.payloads = newVal
  //   },
  // })

  // Remove MappingPath if datastream id is targetId. Remove mappings that now have no paths.
  function removeTargetFromPayload(payload: Task, id: string | number): void {
    const key = String(id)
    for (const m of payload.mappings) {
      m.paths = m.paths.filter((p) => String(p.targetIdentifier) !== key)
    }
    payload.mappings = payload.mappings.filter((m) => m.paths.length > 0)
  }

  // async function updateLinkedDatastreams(newPayload?: Task, oldPayload?: Task) {
  //   const newMappings: Mapping[] = newPayload?.mappings || []
  //   const oldMappings: Mapping[] = oldPayload?.mappings || []

  //   const newIds = new Set(
  //     newMappings.flatMap((m) => m.paths.map((p) => String(p.targetIdentifier)))
  //   )
  //   const oldIds = new Set(
  //     oldMappings.flatMap((m) => m.paths.map((p) => String(p.targetIdentifier)))
  //   )
  //   const addedIds = newIds.difference(oldIds)
  //   const removedIds = oldIds.difference(newIds)

  //   // Issue DELETE requests to before POST requests in case the user is switching
  //   if (removedIds.size > 0) {
  //     await Promise.all(
  //       [...removedIds].map((id) =>
  //         hs.jobs
  //           .unlinkDatastream(job.value.id, id)
  //           .catch((error) =>
  //             console.error(`Error unlinking datastream ${id}:`, error)
  //           )
  //       )
  //     )
  //   }

  //   if (addedIds.size > 0) {
  //     await Promise.all(
  //       [...addedIds].map((id) =>
  //         hs.jobs.linkDatastream(job.value.id, id).catch((error) => {
  //           if (error.status === 400) {
  //             console.error(error.message)
  //             Snackbar.error(`Datastream already linked to a job.`)
  //             removeTargetFromPayload(newPayload!, id)
  //           } else {
  //             console.error(`Error linking datastream ${id}:`, error)
  //           }
  //         })
  //       )
  //     )
  //   }
  // }

  return {
    job,
    extractor,
    transformer,
    loader,
    // payloads,
    selectedETLStep,
    isExtractorValid,
    isTransformerValid,
    isLoaderValid,
    linkedDatastreams,
    draftDatastreams,
    // updateLinkedDatastreams,
  }
})
