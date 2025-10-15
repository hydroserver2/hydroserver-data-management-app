import { ItemResult } from '@hydroserver/client'
import { ref, Ref, computed, onMounted } from 'vue'
import { VForm } from 'vuetify/components'

interface WithId {
  id: string
}

function assertOk<T>(
  res: ItemResult<T>
): asserts res is Extract<ItemResult<T>, { ok: true; item: T }> {
  if (!res.ok) throw new Error(res.message ?? 'Request failed')
}

export function useFormLogic<T extends WithId>(
  createItem: (item: T) => Promise<ItemResult<T>>,
  updateItem: (item: T, originalItem: T) => Promise<ItemResult<T>>,
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
    if (initialItem) {
      const res = await updateItem(item.value, initialItem!)
      assertOk(res)
      return res.item
    }
    const res = await createItem(item.value)
    assertOk(res)
    return res.item
  }

  onMounted(() => {
    if (initialItem) item.value = JSON.parse(JSON.stringify(initialItem))
  })

  return { item, isEdit, valid, myForm, uploadItem }
}
