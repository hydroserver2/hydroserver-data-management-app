import { ref, onMounted, computed, watch } from 'vue'
import { VForm } from 'vuetify/components'
import { useSensorStore } from '@/store/sensors'
import { useObservedPropertyStore } from '@/store/observedProperties'
import { useProcessingLevelStore } from '@/store/processingLevels'
import { useResultQualifierStore } from '@/store/resultQualifiers'
import {
  Sensor,
  Unit,
  ObservedProperty,
  ProcessingLevel,
  ResultQualifier,
} from '@/types'

function useMetadata(
  entityStore: any,
  createEntity: () => any,
  getEntityByID: string,
  id: string | null = null,
  fetchEntities: string | null = null,
  deleteEntity: string | null = null
) {
  const isCreateEditModalOpen = ref(false)
  const isDeleteModalOpen = ref(false)
  const isEdit = computed(() => id != null)
  const valid = ref(false)
  const myForm = ref<VForm>()

  // selectedId is watched so that when it changes,
  // the form is populated with the data from selectedEntity
  const selectedId = ref(id)
  const isEntitySelected = ref(false)
  const selectedEntity = ref(createEntity())

  function openDialog(
    myEntity?: Sensor | Unit | ObservedProperty | ProcessingLevel
  ) {
    isCreateEditModalOpen.value = true
    isEntitySelected.value = !!myEntity
    selectedEntity.value = myEntity ? myEntity : createEntity()
  }

  function openDeleteDialog(entity: any) {
    isDeleteModalOpen.value = true
    selectedEntity.value = entity
  }

  async function deleteSelectedEntity() {
    isDeleteModalOpen.value = false
    if (!deleteEntity) return
    await entityStore[deleteEntity](selectedEntity.value.id)
  }

  watch(selectedId, async () => {
    if (!selectedId.value) return
    populateForm(selectedId.value)
    await myForm.value?.validate()
  })

  function populateForm(id: string) {
    Object.assign(selectedEntity.value, entityStore[getEntityByID](id))
  }

  onMounted(async () => {
    if (fetchEntities) await entityStore[fetchEntities]()
    if (id) populateForm(id)
  })

  return {
    isEntitySelected,
    selectedId,
    selectedEntity,
    isCreateEditModalOpen,
    isDeleteModalOpen,
    isEdit,
    valid,
    myForm,
    deleteSelectedEntity,
    openDialog,
    openDeleteDialog,
  }
}

export function useSensorModals(id: string | null = null) {
  return useMetadata(
    useSensorStore(),
    () => new Sensor(),
    'getSensorById',
    id,
    'fetchSensors',
    'deleteSensor'
  )
}

export function useResultQualifierModals(id: string | null = null) {
  return useMetadata(
    useResultQualifierStore(),
    () => new ResultQualifier(),
    'getById',
    id,
    'fetchResultQualifiers',
    'deleteResultQualifier'
  )
}

export function useProcessingLevelModals(id: string | null = null) {
  const metadataFuncs = useMetadata(
    useProcessingLevelStore(),
    () => new ProcessingLevel(),
    'getById',
    id,
    'fetchProcessingLevels',
    'deleteProcessingLevel'
  )

  const plStore = useProcessingLevelStore()

  const formattedProcessingLevels = computed(() => {
    return plStore.unownedProcessingLevels.map((pl) => ({
      id: pl.id,
      title: `${pl.code} : ${pl.definition}`,
    }))
  })

  return {
    ...metadataFuncs,
    formattedProcessingLevels,
  }
}

export function useObservedPropertyModals(id: string | null = null) {
  return useMetadata(
    useObservedPropertyStore(),
    () => new ObservedProperty(),
    'getById',
    id,
    'fetchObservedProperties',
    'deleteObservedProperty'
  )
}
