<template>
  <v-data-table :headers="UnitHeaders" :items="ownedUnits" class="elevation-3">
    <template v-slot:item.actions="{ item }">
      <v-icon @click="openDialog(item.raw, 'edit')"> mdi-pencil </v-icon>
      <v-icon @click="openDialog(item.raw, 'delete')"> mdi-delete </v-icon>
    </template>
  </v-data-table>

  <v-dialog v-model="openEdit" width="60rem">
    <UnitModal :unit="unit" @close="openEdit = false" @updated="onUnitUpdate" />
  </v-dialog>

  <v-dialog v-model="openDelete" width="40rem">
    <DeleteModal
      itemName="unit"
      :itemID="unit.id"
      parameter-name="unitId"
      @delete="onUnitDelete"
      @close="openDelete = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import UnitModal from '@/components/Datastream/UnitModal.vue'
import DeleteModal from '@/components/Datastream/deleteModal.vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'
import { computed, onMounted, ref } from 'vue'
import { api } from '@/services/api'
import { Unit } from '@/types'

const { user } = storeToRefs(useUserStore())

const openEdit = ref(false)
const openDelete = ref(false)
const unit = ref(new Unit())
const units = ref<Unit[]>([])

const ownedUnits = computed(() =>
  user.value?.email
    ? units.value.filter((u) => u.owner === user.value.email)
    : []
)

function openDialog(selectedUnit: Unit, dialog: string) {
  unit.value = selectedUnit
  if (dialog === 'edit') openEdit.value = true
  else if (dialog === 'delete') openDelete.value = true
}

const onUnitUpdate = (updatedUnit: Unit) => {
  const index = units.value.findIndex((u) => u.id === updatedUnit.id)
  if (index !== -1) units.value[index] = updatedUnit
}

const onUnitDelete = async () => {
  try {
    await api.deleteUnit(unit.value.id)
    units.value = units.value.filter((u) => u.id !== unit.value.id)
    openDelete.value = false
  } catch (error) {
    console.error('Error deleting unit', error)
  }
}

const UnitHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Symbol', key: 'symbol' },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
] as const

onMounted(async () => {
  try {
    // TODO: Just grab the primary owned units
    units.value = await api.fetchUnits()
    units.value.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Error fetching units from DB', error)
  }
})
</script>
