<template>
  <v-card>
    <v-card-title> {{ isEdit ? 'Edit' : 'Add' }} Unit </v-card-title>
    <v-divider />

    <v-form
      @submit.prevent="uploadUnit"
      ref="myForm"
      v-model="valid"
      validate-on="blur"
    >
      <v-card-text v-if="unit">
        <v-autocomplete
          v-if="!isEdit"
          v-model="selectedId"
          label="Load a template unit"
          :items="unownedUnits"
          item-title="name"
          item-value="id"
        />

        <v-text-field
          v-model="unit.name"
          label="Name *"
          :rules="rules.requiredName"
        />
        <v-text-field
          v-model="unit.symbol"
          label="Symbol *"
          :rules="rules.required"
        />
        <v-text-field
          v-model="unit.definition"
          label="Definition *"
          :rules="rules.requiredDescription"
        />
        <v-text-field
          v-model="unit.type"
          label="Unit Type *"
          :rules="rules.requiredName"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn-cancel @click="$emit('close')">Cancel</v-btn-cancel>
        <v-btn-primary type="submit">{{
          isEdit ? 'Update' : 'Save'
        }}</v-btn-primary>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { rules } from '@/utils/rules'
import { api } from '@/services/api'
import { computed, onMounted, ref, watch } from 'vue'
import { VForm } from 'vuetify/components'
import { Unit } from '@/types'

const props = defineProps({
  unit: Object as () => Unit,
})
const emit = defineEmits(['created', 'updated', 'close'])

const unit = ref<Unit>(new Unit())
const unownedUnits = ref<Unit[]>([])
const isEdit = computed(() => props.unit != null)
const valid = ref(false)
const myForm = ref<VForm>()
const selectedId = ref(props.unit?.id)

watch(selectedId, async () => {
  if (!selectedId.value) return
  await populateForm(selectedId.value)
  await myForm.value?.validate()
})

async function populateForm(id: string) {
  const newUnit = unownedUnits.value.find((u) => u.id === id)
  Object.assign(unit.value, newUnit)
}

async function uploadUnit() {
  await myForm.value?.validate()
  if (!valid.value) return
  if (isEdit.value) {
    try {
      const updatedUnit = await api.updateUnit(unit.value, props.unit)
      emit('updated', updatedUnit)
    } catch (error) {
      console.error('Error updating unit', error)
    }
  } else {
    try {
      const newUnit = await api.createUnit(unit.value)
      emit('created', newUnit.id)
    } catch (error) {
      console.error('Error creating unit', error)
    }
  }
  emit('close')
}

onMounted(async () => {
  if (isEdit.value) {
    unit.value = JSON.parse(JSON.stringify(props.unit))
    return
  }
  try {
    const fetchedUnits: Unit[] = await api.fetchUnits()
    unownedUnits.value = fetchedUnits.filter((u) => !u.owner)
  } catch (error) {
    console.error('Error fetching units from DB.', error)
  }
})
</script>
