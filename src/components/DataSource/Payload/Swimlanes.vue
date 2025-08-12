<template>
  <div class="swimlanes">
    <div class="head">Source</div>
    <div class="head">Data transformation steps</div>
    <div class="head">Target</div>

    <template v-for="(m, mi) in payload.mappings" :key="mi">
      <template v-for="(p, pi) in m.paths" :key="pi">
        <div class="cell source" :class="{ 'source-empty': pi !== 0 }">
          <template v-if="pi === 0">
            <v-chip size="small" color="primary" variant="flat" class="mr-2">
              {{ String(m.sourceIdentifier) }}
            </v-chip>
          </template>
        </div>

        <div class="cell transforms">
          <div class="transform-row">
            <v-chip
              v-if="!p.dataTransformations?.length"
              size="small"
              variant="tonal"
              color="grey"
            >
              no transform
            </v-chip>
            <TransformChip
              v-for="(t, ti) in p.dataTransformations"
              :key="ti"
              :t="t"
              class="mr-1 mb-1"
            />
          </div>
        </div>

        <div class="cell target">
          <v-chip size="small" color="green-lighten-1" variant="flat">
            {{ String(p.targetIdentifier) }}
          </v-chip>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import TransformChip from './TransformChip.vue'
import type { Payload } from '@/models/payload'

const props = defineProps<{
  payload: Payload
}>()
</script>

<style scoped>
.swimlanes {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  column-gap: 12px;
  row-gap: 8px;
  margin-bottom: 12px;
}
.head {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  padding-bottom: 6px;
}
.cell {
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  padding: 6px 8px;
  min-height: 34px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.source {
  background: transparent;
  border: none;
  padding-left: 0;
}
.source-empty {
  min-height: 0;
}
.transforms.trunk {
  position: relative;
}
.transform-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.target {
  justify-content: space-between;
}
</style>
