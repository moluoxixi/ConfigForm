<template>
  <div>
    <h2>虚拟滚动</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      虚拟滚动大列表 — FormField + FormArrayField + CSS 虚拟滚动实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormArrayField v-slot="{ arrayField }" name="items" :field-props="{ itemTemplate: () => ({ name: '', email: '' }) }">
            <div style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center">
              <span style="font-size: 13px; color: #666">共 {{ ((arrayField.value as unknown[]) ?? []).length }} 条数据 · 容器高400px · 行高 48px</span>
              <div style="display: inline-flex; gap: 8px">
                <button style="padding: 2px 12px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff" @click="addBatch(50)">+50 条</button>
                <button style="padding: 2px 12px; border: 1px solid #d9d9d9; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff" @click="addBatch(100)">+100 条</button>
                <button style="padding: 2px 12px; border: 1px solid #ff4d4f; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff; color: #ff4d4f" @click="clearAll">清空</button>
              </div>
            </div>
            <div
              ref="scrollContainer"
              style="height: 400px; overflow-y: auto; border: 1px solid #e8e8e8; border-radius: 6px"
              @scroll="onScroll"
            >
              <div :style="{ height: `${((arrayField.value as unknown[]) ?? []).length * ROW_HEIGHT}px`, position: 'relative' }">
                <div
                  v-for="vis in computeVisibleItems((arrayField.value as unknown[]) ?? [])"
                  :key="vis.index"
                  :style="{ position: 'absolute', top: `${vis.offset}px`, left: 0, right: 0, height: `${ROW_HEIGHT}px`, padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }"
                >
                  <span style="width: 40px; color: #999; font-size: 12px">#{{ vis.index + 1 }}</span>
                  <FormField :name="`items.${vis.index}.name`" :field-props="{ component: 'Input', componentProps: { placeholder: '姓名', size: 'small', style: 'flex: 1' } }" />
                  <FormField :name="`items.${vis.index}.email`" :field-props="{ component: 'Input', componentProps: { placeholder: '邮箱', size: 'small', style: 'flex: 1' } }" />
                  <button
                    style="padding: 2px 8px; border: 1px solid #ff4d4f; border-radius: 4px; cursor: pointer; font-size: 13px; background: #fff; color: #ff4d4f"
                    @click="arrayField.remove(vis.index)"
                  >
                    删
                  </button>
                </div>
              </div>
            </div>
          </FormArrayField>
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormArrayField, FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 虚拟滚动 — Field 模式
 *
 * 使用 FormProvider + FormArrayField + FormField + CSS 虚拟滚动实现大列表表单。
 * 仅渲染可视区域内的行，每行使用 FormField + fieldProps 声明式渲染。
 * 框架自动处理三种模式（editable / disabled / readOnly），无需手动 mode 判断。
 */
import { ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

/** 虚拟滚动常量 */
const ROW_HEIGHT = 48
const BUFFER = 5
const CONTAINER_HEIGHT = 400

/** 行数据类型 */
interface RowItem {
  name: string
  email: string
}

const form = useCreateForm({
  initialValues: {
    items: Array.from({ length: 100 }, (_, i) => ({
      name: `用户 ${i + 1}`,
      email: `user${i + 1}@example.com`,
    })),
  },
})

const scrollTop = ref(0)
const scrollContainer = ref<HTMLElement>()

/** 根据滚动位置计算可视区域内的行索引和偏移 */
function computeVisibleItems(allItems: unknown[]): Array<{ index: number; offset: number }> {
  const start = Math.max(0, Math.floor(scrollTop.value / ROW_HEIGHT) - BUFFER)
  const visibleCount = Math.ceil(CONTAINER_HEIGHT / ROW_HEIGHT) + BUFFER * 2
  const end = Math.min(allItems.length, start + visibleCount)

  const result: Array<{ index: number; offset: number }> = []
  for (let i = start; i < end; i++) {
    result.push({ index: i, offset: i * ROW_HEIGHT })
  }
  return result
}

/** 滚动事件处理 */
function onScroll(e: Event): void {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

/** 批量添加数据 */
function addBatch(count: number): void {
  const current = (form.getFieldValue('items') ?? []) as RowItem[]
  const base = current.length
  const newItems = [...current, ...Array.from({ length: count }, (_, i) => ({
    name: `用户 ${base + i + 1}`,
    email: `user${base + i + 1}@example.com`,
  }))]
  form.setFieldValue('items', newItems)
}

/** 清空所有数据 */
function clearAll(): void {
  form.setFieldValue('items', [])
}

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
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
