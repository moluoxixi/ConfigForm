<template>
  <div>
    <h2>大表单性能</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      {{ fieldCount }} 个字段性能测试 — FormField 批量渲染
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px">
      <button
        v-for="n in [50, 100, 200]"
        :key="n"
        :style="{
          padding: '4px 16px',
          border: fieldCount === n ? '1px solid #1677ff' : '1px solid #d9d9d9',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          background: fieldCount === n ? '#1677ff' : '#fff',
          color: fieldCount === n ? '#fff' : 'inherit',
        }"
        @click="fieldCount = n"
      >
        {{ n }} 个
      </button>
      <span style="line-height: 32px; margin-left: 8px; color: #666; font-size: 13px">
        渲染耗时: <b>{{ renderTime }}ms</b>
      </span>
    </div>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :key="fieldCount" :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField
            v-for="f in fieldDefs"
            :key="f.name"
            :name="f.name"
            :field-props="{ label: f.label, component: f.component, ...(f.required ? { required: true } : {}) }"
          />
          <LayoutFormActions @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, useCreateForm } from '@moluoxixi/vue'
/**
 * 大表单性能测试 — Field 模式
 *
 * 使用 FormProvider + FormField 批量渲染大量字段，测试渲染性能。
 * 支持切换 50/100/200 个字段，记录渲染耗时。
 */
import { computed, nextTick, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const fieldCount = ref(50)
const renderTime = ref(0)

/** 字段定义 */
interface FieldDef {
  name: string
  label: string
  component: string
  required?: boolean
}

/** 生成字段定义列表 */
const fieldDefs = computed<FieldDef[]>(() => {
  const defs: FieldDef[] = []
  for (let i = 0; i < fieldCount.value; i++) {
    const component = i % 4 === 0 ? 'InputNumber' : i % 4 === 1 ? 'Switch' : i % 4 === 2 ? 'DatePicker' : 'Input'
    defs.push({
      name: `field_${i}`,
      label: `字段 ${i + 1}`,
      component,
      required: i % 10 === 0,
    })
  }
  return defs
})

/** 生成初始值 */
function getInitialValues(): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (let i = 0; i < fieldCount.value; i++) {
    const type = i % 4
    values[`field_${i}`] = type === 0 ? 0 : type === 1 ? false : ''
  }
  return values
}

const form = useCreateForm({ initialValues: getInitialValues() })

/** 切换字段数量时重建表单并测量渲染时间 */
watch(fieldCount, async () => {
  const start = performance.now()
  form.setValues(getInitialValues())
  await nextTick()
  await nextTick()
  renderTime.value = Math.round(performance.now() - start)
}, { immediate: true })

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
