<template>
  <div>
    <h2>????</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      ??????????????????????????????
    </p>

    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 13px; color: #666;">??{{ items.length }} ??? ??????400px ? ?? 48px</span>
          <div style="display: inline-flex; gap: 8px;">
            <button @click="addBatch(50)" style="padding: 2px 12px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff;">+50 ??/button>
            <button @click="addBatch(100)" style="padding: 2px 12px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff;">+100 ??/button>
            <button @click="clearAll" style="padding: 2px 12px; border: 1px solid #ff4d4f; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff; color: #ff4d4f;">??</button>
          </div>
        </div>

        <div
          ref="scrollContainer"
          style="height: 400px; overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px;"
          @scroll="onScroll"
        >
          <div :style="{ height: totalHeight + 'px', position: 'relative' }">
            <div
              v-for="item in visibleItems"
              :key="item.index"
              :style="{ position: 'absolute', top: item.offset + 'px', left: 0, right: 0, height: ROW_HEIGHT + 'px', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }"
            >
              <span style="width: 40px; color: #999; font-size: 12px;">#{{ item.index + 1 }}</span>
              <input
                :value="item.data.name"
                placeholder="??"
                :disabled="mode !== 'editable'"
                :readonly="mode === 'readOnly'"
                style="flex: 1; padding: 2px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; outline: none;"
                @input="updateItem(item.index, 'name', ($event.target as HTMLInputElement).value)"
              />
              <input
                :value="item.data.email"
                placeholder="??"
                :disabled="mode !== 'editable'"
                :readonly="mode === 'readOnly'"
                style="flex: 1; padding: 2px 8px; border: 1px solid #d9d9d9; border-radius: 4px; font-size: 13px; outline: none;"
                @input="updateItem(item.index, 'email', ($event.target as HTMLInputElement).value)"
              />
              <button
                v-if="mode === 'editable'"
                @click="removeItem(item.index)"
                style="padding: 2px 8px; border: 1px solid #ff4d4f; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff; color: #ff4d4f;"
              >??/button>
            </div>
          </div>
        </div>
        <div v-if="mode === 'editable'" style="margin-top: 16px; display: flex; gap: 8px">
          <button type="button" @click="handleSubmit(showResult)" style="padding: 4px 15px; background: #1677ff; color: #fff; border: none; border-radius: 6px; cursor: pointer">??</button>
          <button type="button" @click="form.reset()" style="padding: 4px 15px; background: #fff; border: 1px solid #d9d9d9; border-radius: 6px; cursor: pointer">??</button>
        </div>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
/**
 * ?? 56??????Ant Design Vue?? *
 * ????CSS + ?????????????? * ????????? ??????????????????? */
import { computed, ref, watch } from 'vue'
import { createForm } from '@moluoxixi/core'
import { setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormProvider } from '@moluoxixi/vue'
import type { FieldPattern } from '@moluoxixi/shared'

setupAntdVue()

const st = ref<InstanceType<typeof StatusTabs>>()

const ROW_HEIGHT = 48
const BUFFER = 5
const CONTAINER_HEIGHT = 400

interface RowItem {
  name: string
  email: string
}

const items = ref<RowItem[]>(
  Array.from({ length: 100 }, (_, i) => ({
    name: `?? ${i + 1}`,
    email: `user${i + 1}@example.com`,
  })),
)

const form = createForm({
  initialValues: { items: items.value },
})

const scrollTop = ref(0)
const scrollContainer = ref<HTMLElement>()

const totalHeight = computed(() => items.value.length * ROW_HEIGHT)

const visibleItems = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER)
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + BUFFER * 2
  const end = Math.min(items.value.length, start + visibleCount)

  const result: Array<{ index: number; offset: number; data: RowItem }> = []
  for (let i = start; i < end; i++) {
    result.push({ index: i, offset: i * ROW_HEIGHT, data: items.value[i] })
  }
  return result
})

function onScroll(e: Event): void {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

function updateItem(index: number, field: keyof RowItem, value: string): void {
  items.value[index][field] = value
}

function addBatch(count: number): void {
  const base = items.value.length
  const newItems = Array.from({ length: count }, (_, i) => ({
    name: `?? ${base + i + 1}`,
    email: `user${base + i + 1}@example.com`,
  }))
  items.value.push(...newItems)
}

function removeItem(index: number): void {
  items.value.splice(index, 1)
}

function clearAll(): void {
  items.value = []
}

/** ?? StatusTabs ? mode ? form.pattern */
watch(() => st.value?.mode, (v) => { if (v) form.pattern = v as FieldPattern }, { immediate: true })

/** ???? */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
