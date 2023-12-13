import { ref, Ref, computed, watch, onMounted } from 'vue'
import { VForm } from 'vuetify/components'

interface WithId {
  id: string
}

export function useFormLogic<T extends WithId>(
  fetchItems: () => Promise<T[]>,
  createItem: (item: T) => Promise<T>,
  updateItem: (item: T, originalItem: T) => Promise<T>,
  ItemClass: new () => T,
  initialItem?: T,
  hasTemplateSelect: boolean = true
) {
  const item = ref(new ItemClass()) as Ref<T>
  const items: Ref<T[]> = ref([])

  const isEdit = computed(() => !!initialItem)
  const valid = ref(false)
  const myForm = ref<VForm>()

  const selectedId = ref(initialItem?.id)

  watch(selectedId, async (newId) => {
    if (!newId || !hasTemplateSelect) return
    await populateForm(newId)
    await myForm.value?.validate()
  })

  async function populateForm(id: string | number) {
    const newItem = items.value.find((u: any) => u.id === id)
    if (newItem) Object.assign(item.value, newItem)
  }

  async function uploadItem() {
    await myForm.value?.validate()
    if (!valid.value) return
    if (initialItem) return await updateItem(item.value, initialItem!)
    return await createItem(item.value)
  }

  onMounted(async () => {
    if (initialItem) {
      item.value = JSON.parse(JSON.stringify(initialItem))
      return
    }

    if (!hasTemplateSelect) return
    try {
      items.value = await fetchItems()
    } catch (error) {
      console.error('Error fetching items from DB.', error)
    }
  })

  return { item, items, isEdit, valid, myForm, selectedId, uploadItem }
}
