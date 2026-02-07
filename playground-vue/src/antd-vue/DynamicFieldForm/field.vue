<template>
  <div>
    <h2>动态增删字段</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      运行时添加/移除字段 — FormField + createField/removeField 实现
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <!-- 添加新字段（仅编辑态） -->
          <ACard v-if="mode === 'editable'" size="small" title="添加新字段" style="margin-bottom: 16px">
            <ASpace>
              <AInput v-model:value="newLabel" placeholder="字段标签" style="width: 200px" />
              <ASelect v-model:value="newType" :options="[{ label: '文本', value: 'text' }, { label: '数字', value: 'number' }, { label: '选择', value: 'select' }]" style="width: 120px" />
              <AButton type="primary" :disabled="!newLabel.trim()" @click="addField">添加</AButton>
            </ASpace>
            <div style="margin-top: 8px; color: #999; font-size: 12px">
              已添加 {{ dynamicFields.length }} 个动态字段
            </div>
          </ACard>
          <!-- 静态字段 -->
          <FormField name="title" :field-props="{ label: '表单标题', required: true, component: 'Input' }" />
          <!-- 动态字段 — 使用 fieldProps 声明式渲染，删除按钮单独放在外侧 -->
          <div v-for="df in dynamicFields" :key="df.id" style="display: flex; gap: 8px; align-items: flex-start; margin-bottom: 4px">
            <FormField :name="df.name" :field-props="getDynFieldProps(df)" />
            <AButton v-if="mode === 'editable'" danger style="margin-top: 30px" @click="removeField(df.id)">删除</AButton>
          </div>
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
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
 * 动态增删字段 — Field 模式
 *
 * 使用 FormProvider + FormField，通过 form.createField / form.removeField
 * 在运行时动态添加和移除字段。
 * 动态字段根据类型通过 getDynFieldProps 返回不同的 fieldProps 配置。
 */
import { Button as AButton, Card as ACard, Input as AInput, Select as ASelect, Space as ASpace } from 'ant-design-vue'
import { onMounted, ref, watch } from 'vue'

setupAntdVue()
const st = ref<InstanceType<typeof StatusTabs>>()

const newLabel = ref('')
const newType = ref('text')
let counter = 0

/** 动态字段定义 */
interface DynField {
  id: string
  name: string
  label: string
  fieldType: string
}

const dynamicFields = ref<DynField[]>([])

const form = useCreateForm({ initialValues: { title: '' } })

onMounted(() => {
  form.createField({ name: 'title', label: '表单标题', required: true })
})

/** 根据动态字段类型返回 fieldProps 配置 */
function getDynFieldProps(df: DynField): Record<string, unknown> {
  if (df.fieldType === 'select') {
    return {
      label: df.label,
      component: 'Select',
      componentProps: {
        options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }],
        placeholder: '请选择',
        style: 'width: 200px',
      },
    }
  }
  return {
    label: df.label,
    component: 'Input',
    componentProps: { style: 'width: 200px' },
  }
}

/** 添加动态字段 */
function addField(): void {
  if (!newLabel.value.trim()) return
  counter++
  const id = `dyn_${counter}`
  form.createField({ name: id, label: newLabel.value.trim() })
  dynamicFields.value.push({ id, name: id, label: newLabel.value.trim(), fieldType: newType.value })
  newLabel.value = ''
}

/** 移除动态字段 */
function removeField(id: string): void {
  form.removeField(id)
  dynamicFields.value = dynamicFields.value.filter(f => f.id !== id)
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
