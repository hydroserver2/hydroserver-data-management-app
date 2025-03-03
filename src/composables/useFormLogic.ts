import { ref, Ref, computed, onMounted } from 'vue'
import { VForm } from 'vuetify/components'

interface WithId {
  id: string
}

export function useFormLogic<T extends WithId>(
  createItem: (item: T) => Promise<T>,
  updateItem: (item: T, originalItem: T) => Promise<T>,
  ItemClass: new () => T,
  initialItem?: T
) {
  const item = ref(new ItemClass()) as Ref<T>
  const isEdit = computed(() => !!initialItem)
  const valid = ref(false)
  const myForm = ref<VForm>()

  async function uploadItem() {
    await myForm.value?.validate()
    if (!valid.value) return
    if (initialItem) return await updateItem(item.value, initialItem!)
    return await createItem(item.value)
  }

  onMounted(() => {
    if (initialItem) item.value = JSON.parse(JSON.stringify(initialItem))
  })

  return { item, isEdit, valid, myForm, uploadItem }
}
