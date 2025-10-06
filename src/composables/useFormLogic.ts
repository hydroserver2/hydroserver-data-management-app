import { ref, computed } from 'vue'
import type { VForm } from 'vuetify/components'
import type {
  ApiContract,
  SummaryOf,
  DetailOf,
  PostOf,
  PatchOf,
  HydroServerBaseService,
} from '@hydroserver/client'

type ItemOf<C extends ApiContract> = SummaryOf<C> | DetailOf<C>
type FormOf<C extends ApiContract> = PostOf<C> | PatchOf<C>

function hasId(x: unknown): x is { id: string } {
  return !!x && typeof (x as any).id === 'string' && (x as any).id.length > 0
}

export function useFormLogic<C extends ApiContract>(
  service: HydroServerBaseService<C>,
  initial?: ItemOf<C> | PostOf<C>
) {
  const isEdit = computed(() => hasId(initial))

  const item = ref<FormOf<C>>(
    isEdit.value
      ? (service.getFormFrom(initial as ItemOf<C>) as PatchOf<C>)
      : (service.newForm(initial as Partial<PostOf<C>>) as PostOf<C>)
  )

  const valid = ref(false)
  const myForm = ref<VForm>()

  async function submit() {
    await myForm.value?.validate()
    if (!valid.value) return null

    if (isEdit.value) {
      const id = (initial as any).id as string
      const res = await service.update(
        id,
        item.value as PatchOf<C>,
        item.value as PatchOf<C>
      )
      return res.ok ? (res.item as ItemOf<C>) : null
    } else {
      const res = await service.create(item.value as PostOf<C>)
      return res.ok ? (res.item as ItemOf<C>) : null
    }
  }

  return {
    item,
    isEdit,
    valid,
    myForm,
    submit,
  }
}
